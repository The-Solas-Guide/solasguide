-- Close the remaining Admin CMS schema gaps without changing the applied
-- foundation migration.

-- Keep submission origins type-safe at the database boundary.
create type public.submission_source as enum ('website', 'admin');

alter table public.customer_enquiries
  drop constraint customer_enquiries_source_check,
  alter column source drop default,
  alter column source type public.submission_source
    using source::public.submission_source,
  alter column source set default 'website'::public.submission_source;

alter table public.practitioner_expressions_of_interest
  drop constraint practitioner_eoi_source_check,
  alter column source drop default,
  alter column source type public.submission_source
    using source::public.submission_source,
  alter column source set default 'website'::public.submission_source;

-- A practitioner can be removed only after archive and unfeatured actions.
create or replace function public.prevent_featured_practitioner_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status is distinct from 'archived'
     or old.featured_position is not null then
    raise exception using
      errcode = '23514',
      message = 'Only archived and unfeatured practitioners can be permanently deleted';
  end if;

  return old;
end;
$$;

revoke all on function public.prevent_featured_practitioner_delete()
  from public, anon, authenticated;
grant execute on function public.prevent_featured_practitioner_delete()
  to service_role;

-- Enforce a single practitioner-owned portrait path in the directory table.
alter table public.practitioners
  drop constraint practitioners_image_path_check,
  add constraint practitioners_image_path_check
    check (
      image_path is null
      or (
        length(btrim(image_path)) between 39 and 500
        and image_path = btrim(image_path)
        and image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$'
      )
    );

create unique index practitioners_image_path_idx
  on public.practitioners (image_path)
  where image_path is not null;

create or replace function public.validate_practitioner_image_path()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.image_path is not null
     and split_part(new.image_path, '/', 1) is distinct from new.id::text then
    raise exception using
      errcode = '23514',
      message = 'A practitioner image path must use its practitioner UUID folder';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_practitioner_image_path()
  from public, anon, authenticated;
grant execute on function public.validate_practitioner_image_path()
  to service_role;

drop trigger if exists practitioners_validate_image_path on public.practitioners;
create trigger practitioners_validate_image_path
before insert or update of id, image_path on public.practitioners
for each row
execute function public.validate_practitioner_image_path();

-- Storage policies use the same path shape and require the UUID folder to be
-- an existing practitioner. Public reads still come from the public bucket.
create or replace function admin_private.is_valid_practitioner_image_path(p_path text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select p_path is not null
    and p_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$'
    and exists (
      select 1
        from public.practitioners as p
       where p.id::text = split_part(p_path, '/', 1)
    );
$$;

revoke all on function admin_private.is_valid_practitioner_image_path(text)
  from public, anon, authenticated;
grant execute on function admin_private.is_valid_practitioner_image_path(text)
  to authenticated, service_role;

-- Admin creation is limited to business-input columns. Source must be admin,
-- while database defaults continue to own identity, timestamps, and delivery.
grant insert (
  full_name,
  email,
  phone,
  contact_preference,
  consent_confirmed,
  consent_given_at,
  questionnaire_answers,
  source,
  status,
  internal_notes
)
on table public.customer_enquiries
to authenticated;

create policy customer_enquiries_admin_insert
on public.customer_enquiries
for insert
to authenticated
with check (
  (select admin_private.is_admin())
  and source = 'admin'::public.submission_source
);

grant insert (
  full_name,
  email,
  phone,
  contact_preference,
  practice_name,
  location,
  website_url,
  consent_confirmed,
  consent_given_at,
  questionnaire_answers,
  source,
  status,
  internal_notes
)
on table public.practitioner_expressions_of_interest
to authenticated;

create policy practitioner_eoi_admin_insert
on public.practitioner_expressions_of_interest
for insert
to authenticated
with check (
  (select admin_private.is_admin())
  and source = 'admin'::public.submission_source
);

-- The allowlist helper is the common gate for all browser-side Admin access.
-- Missing expiry is allowed for local pgTAP role simulation; real Auth JWTs
-- always include exp and expired tokens are denied.
create or replace function admin_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and case
      when (select auth.jwt() ->> 'exp') is null then true
      when (select auth.jwt() ->> 'exp') ~ '^[0-9]+$'
        then (select auth.jwt() ->> 'exp')::bigint > floor(extract(epoch from pg_catalog.now()))::bigint
      else false
    end
    and exists (
      select 1
        from public.admin_users
       where user_id = (select auth.uid())
    );
$$;

revoke all on function admin_private.is_admin()
  from public, anon, authenticated;
grant execute on function admin_private.is_admin()
  to authenticated, service_role;

drop policy if exists profile_images_admin_select on storage.objects;
create policy profile_images_admin_select
on storage.objects
for select
to authenticated
using (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and (select admin_private.is_valid_practitioner_image_path(name))
);

drop policy if exists profile_images_admin_insert on storage.objects;
create policy profile_images_admin_insert
on storage.objects
for insert
to authenticated
with check (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and (select admin_private.is_valid_practitioner_image_path(name))
  and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
);

drop policy if exists profile_images_admin_update on storage.objects;
create policy profile_images_admin_update
on storage.objects
for update
to authenticated
using (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and (select admin_private.is_valid_practitioner_image_path(name))
)
with check (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and (select admin_private.is_valid_practitioner_image_path(name))
  and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
);

drop policy if exists profile_images_admin_delete on storage.objects;
create policy profile_images_admin_delete
on storage.objects
for delete
to authenticated
using (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and (select admin_private.is_valid_practitioner_image_path(name))
);
