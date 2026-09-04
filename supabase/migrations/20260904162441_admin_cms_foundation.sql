-- Admin CMS foundation: lifecycle state, taxonomy maintenance, submissions,
-- and allowlisted administrator access.

alter table public.practitioners
  add column archived_at timestamptz,
  add column featured_position smallint;

alter table public.practitioner_terms
  add column archived_at timestamptz,
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();

alter table public.customer_enquiries
  add column archived_at timestamptz;

alter table public.practitioner_expressions_of_interest
  add column archived_at timestamptz;

alter table public.customer_enquiries
  drop constraint customer_enquiries_source_check,
  add constraint customer_enquiries_source_check
    check (source in ('website', 'admin'));

alter table public.practitioner_expressions_of_interest
  drop constraint practitioner_eoi_source_check,
  add constraint practitioner_eoi_source_check
    check (source in ('website', 'admin'));

-- Existing archived rows receive an archive timestamp before the state checks
-- are added. No seed or production records are rewritten by this task.
update public.practitioners
   set archived_at = coalesce(archived_at, pg_catalog.now())
 where status = 'archived';

alter table public.practitioners
  add constraint practitioners_featured_position_check
    check (featured_position between 1 and 8),
  add constraint practitioners_featured_published_check
    check (featured_position is null or status = 'published'),
  add constraint practitioners_archive_state_check
    check (
      (status in ('draft', 'published') and archived_at is null)
      or (status = 'archived' and archived_at is not null)
    );

create unique index practitioners_featured_position_idx
  on public.practitioners (featured_position)
  where featured_position is not null;

alter table public.practitioner_terms
  add constraint practitioner_terms_archive_state_check
    check (not is_active or archived_at is null);

alter table public.practitioner_term_links
  drop constraint practitioner_term_links_term_id_fkey,
  add constraint practitioner_term_links_term_id_fkey
    foreign key (term_id)
    references public.practitioner_terms(id)
    on delete restrict;

create index practitioner_terms_active_order_idx
  on public.practitioner_terms (type, sort_order, name)
  where is_active and archived_at is null;

-- Practitioners use status for their public lifecycle. The timestamps are
-- normalized here so every write follows the same transition rules.
create or replace function public.validate_practitioner_publication()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if old.featured_position is not null
       and new.status is distinct from 'published' then
      raise exception using
        errcode = '23514',
        message = 'A featured practitioner must be unfeatured before it leaves published status';
    end if;

    if old.status = 'archived' and new.status = 'published' then
      raise exception using
        errcode = '23514',
        message = 'Restore an archived practitioner to draft before publishing';
    end if;

    if old.status = 'archived'
       and new.status = 'archived'
       and new.archived_at is null then
      new.status := 'draft';
    end if;

    if old.status = 'archived' and new.status = 'draft' then
      new.archived_at := null;
    end if;
  end if;

  if new.status = 'published' and new.archived_at is not null then
    raise exception using
      errcode = '23514',
      message = 'A published practitioner cannot have an archive timestamp';
  end if;

  -- Supplying an archive timestamp is also an archive action. This keeps
  -- direct SQL and the future admin action on the same state machine.
  if new.archived_at is not null and new.status <> 'archived' then
    new.status := 'archived';
  end if;

  if new.status = 'published' then
    if new.summary is null or btrim(new.summary) = '' then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have a summary';
    end if;

    if new.about is null or btrim(new.about) = '' then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have an about description';
    end if;

    if new.image_path is null or btrim(new.image_path) = '' then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have an image path';
    end if;

    if tg_op = 'UPDATE' then
      new.published_at := coalesce(old.published_at, new.published_at, pg_catalog.now());
    else
      new.published_at := coalesce(new.published_at, pg_catalog.now());
    end if;

    new.archived_at := null;

    if not exists (
      select 1
        from public.practitioner_term_links as l
        join public.practitioner_terms as t on t.id = l.term_id
       where l.practitioner_id = new.id
         and t.type = 'location'
         and t.is_active
         and t.archived_at is null
    ) then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have at least one location';
    end if;
  elsif new.status = 'archived' then
    new.published_at := null;
    new.archived_at := coalesce(new.archived_at, pg_catalog.now());
  else
    new.published_at := null;
    new.archived_at := null;
  end if;

  return new;
end;
$$;

create or replace function public.assert_published_practitioner_has_location(p_practitioner_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  practitioner_status text;
begin
  select p.status
    into practitioner_status
    from public.practitioners as p
   where p.id = p_practitioner_id;

  if practitioner_status = 'published'
     and not exists (
       select 1
         from public.practitioner_term_links as l
         join public.practitioner_terms as t on t.id = l.term_id
        where l.practitioner_id = p_practitioner_id
          and t.type = 'location'
          and t.is_active
          and t.archived_at is null
     ) then
    raise exception using
      errcode = '23514',
      message = 'A published practitioner must have at least one location';
  end if;
end;
$$;

-- Integrity triggers call the private location assertion as their owner. The
-- trigger functions remain non-executable by browser roles.
alter function public.validate_practitioner_location_links() security definer;

create or replace function public.prevent_featured_practitioner_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.featured_position is not null then
    raise exception using
      errcode = '23514',
      message = 'A featured practitioner cannot be deleted';
  end if;

  return old;
end;
$$;

drop trigger if exists practitioners_prevent_featured_delete on public.practitioners;
create trigger practitioners_prevent_featured_delete
before delete on public.practitioners
for each row
execute function public.prevent_featured_practitioner_delete();

-- Taxonomy lifecycle is represented by is_active plus archived_at. Restoring
-- an archived term always returns it to the inactive state.
create or replace function public.normalize_practitioner_term_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.archived_at is not null
     or (tg_op = 'UPDATE' and old.archived_at is not null and new.archived_at is null) then
    new.is_active := false;
  end if;

  return new;
end;
$$;

drop trigger if exists practitioner_terms_normalize_lifecycle on public.practitioner_terms;
create trigger practitioner_terms_normalize_lifecycle
before insert or update on public.practitioner_terms
for each row
execute function public.normalize_practitioner_term_lifecycle();

drop trigger if exists practitioner_terms_set_updated_at on public.practitioner_terms;
create trigger practitioner_terms_set_updated_at
before update on public.practitioner_terms
for each row
execute function public.set_practitioner_updated_at();

create or replace function public.prevent_unqualified_practitioner_term_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.archived_at is null then
    raise exception using
      errcode = '23514',
      message = 'Only archived taxonomy terms can be permanently deleted';
  end if;

  if exists (
    select 1
      from public.practitioner_term_links as l
     where l.term_id = old.id
  ) then
    raise exception using
      errcode = '23503',
      message = 'A taxonomy term with practitioner links cannot be permanently deleted';
  end if;

  return old;
end;
$$;

drop trigger if exists practitioner_terms_prevent_unqualified_delete on public.practitioner_terms;
create trigger practitioner_terms_prevent_unqualified_delete
before delete on public.practitioner_terms
for each row
execute function public.prevent_unqualified_practitioner_term_delete();

create or replace function public.validate_practitioner_term_type_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  linked_practitioner record;
begin
  if old.type = 'location'
     or new.type = 'location'
     or old.is_active is distinct from new.is_active
     or old.archived_at is distinct from new.archived_at then
    for linked_practitioner in
      select distinct l.practitioner_id
        from public.practitioner_term_links as l
       where l.term_id = new.id
    loop
      perform public.assert_published_practitioner_has_location(linked_practitioner.practitioner_id);
    end loop;
  end if;

  return null;
end;
$$;

drop trigger if exists practitioner_terms_validate_type_changes on public.practitioner_terms;
create trigger practitioner_terms_validate_type_changes
after update of type, is_active, archived_at on public.practitioner_terms
for each row
execute function public.validate_practitioner_term_type_changes();

-- Keep the directory helper and public taxonomy RPCs aligned with the active
-- definition used by the admin lifecycle.
create or replace function directory_private.practitioner_term_is_active(p_term_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
      from public.practitioner_terms as t
     where t.id = p_term_id
       and t.is_active
       and t.archived_at is null
  );
$$;

drop policy if exists practitioner_terms_public_read on public.practitioner_terms;
create policy practitioner_terms_public_read
on public.practitioner_terms
for select
to anon, authenticated
using (
  is_active
  and archived_at is null
  and exists (
    select 1
      from public.practitioner_term_links as l
      join public.practitioners as p on p.id = l.practitioner_id
     where l.term_id = practitioner_terms.id
       and p.status = 'published'
  )
);

create or replace function public.get_active_practitioner_taxonomy_term(
  p_type text,
  p_slug text
)
returns table (
  id uuid,
  type text,
  name text,
  slug text
)
language sql
stable
security definer
set search_path = ''
as $$
  select term.id, term.type, term.name, term.slug
    from public.practitioner_terms as term
   where p_type in ('support_area', 'location')
     and term.type = p_type
     and term.slug = p_slug
     and term.is_active
     and term.archived_at is null
   limit 1;
$$;

create or replace function public.list_active_practitioner_taxonomy_terms()
returns table (id uuid, type text, name text, slug text)
language sql
stable
security definer
set search_path = ''
as $$
  select term.id, term.type, term.name, term.slug
    from public.practitioner_terms as term
   where term.type in ('support_area', 'location')
     and term.is_active
     and term.archived_at is null
   order by term.type, term.slug;
$$;

-- Administrator access uses the allowlist helper in every policy predicate.
grant insert, update, delete on table public.practitioners to authenticated;
create policy practitioners_admin_manage
on public.practitioners
for all
to authenticated
using ((select admin_private.is_admin()))
with check ((select admin_private.is_admin()));

grant insert, update, delete on table public.practitioner_terms to authenticated;
create policy practitioner_terms_admin_manage
on public.practitioner_terms
for all
to authenticated
using ((select admin_private.is_admin()))
with check ((select admin_private.is_admin()));

grant insert, update, delete on table public.practitioner_term_links to authenticated;
create policy practitioner_term_links_admin_manage
on public.practitioner_term_links
for all
to authenticated
using ((select admin_private.is_admin()))
with check ((select admin_private.is_admin()));

-- Submission administrators can read private records and update only the
-- operational fields. No browser role receives insert or permanent delete.
grant select on table public.customer_enquiries to authenticated;
grant update (status, internal_notes, archived_at)
  on table public.customer_enquiries to authenticated;
create policy customer_enquiries_admin_read
on public.customer_enquiries
for select
to authenticated
using ((select admin_private.is_admin()));
create policy customer_enquiries_admin_update
on public.customer_enquiries
for update
to authenticated
using ((select admin_private.is_admin()))
with check ((select admin_private.is_admin()));

grant select on table public.practitioner_expressions_of_interest to authenticated;
grant update (status, internal_notes, archived_at)
  on table public.practitioner_expressions_of_interest to authenticated;
create policy practitioner_eoi_admin_read
on public.practitioner_expressions_of_interest
for select
to authenticated
using ((select admin_private.is_admin()));
create policy practitioner_eoi_admin_update
on public.practitioner_expressions_of_interest
for update
to authenticated
using ((select admin_private.is_admin()))
with check ((select admin_private.is_admin()));

-- Public object URLs do not require table reads. Keep the bucket public but
-- remove the anonymous object-listing policy.
drop policy if exists profile_images_public_read on storage.objects;

create policy profile_images_admin_select
on storage.objects
for select
to authenticated
using (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
);

create policy profile_images_admin_insert
on storage.objects
for insert
to authenticated
with check (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
);

create policy profile_images_admin_update
on storage.objects
for update
to authenticated
using (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
)
with check (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
  and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
);

create policy profile_images_admin_delete
on storage.objects
for delete
to authenticated
using (
  (select admin_private.is_admin())
  and bucket_id = 'profile-images'
);

-- The search RPC must ignore archived taxonomy terms.
create or replace function public.search_published_practitioner_ids(
  p_query text default null,
  p_area_slugs text[] default '{}'::text[],
  p_approach_slugs text[] default '{}'::text[],
  p_works_with_slugs text[] default '{}'::text[],
  p_location_slugs text[] default '{}'::text[],
  p_format_values text[] default '{}'::text[],
  p_language_slugs text[] default '{}'::text[]
)
returns table (practitioner_id uuid)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id
    from public.practitioners as p
   where p.status = 'published'
     and (
       p_query is null
       or pg_catalog.btrim(p_query) = ''
       or position(
            pg_catalog.lower(pg_catalog.btrim(p_query))
            in lower(
              pg_catalog.concat_ws(
                ' ',
                p.name,
                p.descriptor,
                p.summary,
                p.about,
                pg_catalog.array_to_string(coalesce(p.credentials, '{}'::text[]), ' '),
                pg_catalog.array_to_string(coalesce(p.significant_training, '{}'::text[]), ' ')
              )
            )
          ) > 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.is_active
            and t.archived_at is null
            and position(
                  pg_catalog.lower(pg_catalog.btrim(p_query))
                  in lower(t.name)
                ) > 0
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_area_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'support_area'
            and t.is_active
            and t.archived_at is null
            and t.slug = any(coalesce(p_area_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_approach_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'approach'
            and t.is_active
            and t.archived_at is null
            and t.slug = any(coalesce(p_approach_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_works_with_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'works_with'
            and t.is_active
            and t.archived_at is null
            and t.slug = any(coalesce(p_works_with_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_location_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'location'
            and t.is_active
            and t.archived_at is null
            and t.slug = any(coalesce(p_location_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_format_values), 0) = 0
       or ('in-person' = any(coalesce(p_format_values, '{}'::text[])) and p.offers_in_person)
       or ('online' = any(coalesce(p_format_values, '{}'::text[])) and p.offers_online)
     )
     and (
       coalesce(pg_catalog.cardinality(p_language_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'language'
            and t.is_active
            and t.archived_at is null
            and t.slug = any(coalesce(p_language_slugs, '{}'::text[]))
       )
     )
   order by p.name, p.id;
$$;

comment on column public.practitioners.archived_at is
  'Timestamp set when a practitioner enters the archived lifecycle state.';
comment on column public.practitioners.featured_position is
  'Optional public featured ordering position from one through eight.';
comment on column public.practitioner_terms.archived_at is
  'Timestamp set when a taxonomy term enters the archived lifecycle state.';
comment on column public.customer_enquiries.archived_at is
  'Optional operator archive timestamp; independent from workflow status.';
comment on column public.practitioner_expressions_of_interest.archived_at is
  'Optional operator archive timestamp; independent from workflow status.';
