-- A practitioner is first saved as a draft. Publishing is a distinct action
-- against that saved draft, so incomplete creation cannot make a public row.

alter table public.practitioners
  add column portrait_approved_at timestamptz,
  add column portrait_approval_required boolean not null default true;

-- Portraits that existed before approval evidence was recorded remain usable.
-- They are never given invented approval timestamps. Any replacement requires
-- a fresh, recorded confirmation before it can be published.
update public.practitioners
   set portrait_approval_required = false
 where status = 'published'
   and image_path is not null;

comment on column public.practitioners.portrait_approved_at is
  'When an administrator confirmed a newly uploaded portrait may be public.';
comment on column public.practitioners.portrait_approval_required is
  'False only for portrait paths that existed before approval evidence tracking.';

create or replace function public.validate_practitioner_portrait_publication()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.status = 'published' then
    raise exception using
      errcode = '23514',
      message = 'Create a practitioner as a draft before publishing';
  end if;
  if tg_op = 'INSERT' and not new.portrait_approval_required then
    raise exception using errcode = '23514', message = 'Portrait approval exemptions are reserved for historical published portraits';
  end if;
  if tg_op = 'UPDATE' and old.portrait_approval_required and not new.portrait_approval_required then
    raise exception using errcode = '23514', message = 'Portrait approval cannot be removed';
  end if;

  if tg_op = 'UPDATE' and new.image_path is distinct from old.image_path then
    new.portrait_approval_required := true;
    new.portrait_approved_at := case
      when current_setting('app.portrait_approval_confirmed', true) = 'true'
        then pg_catalog.now()
      else null
    end;
  end if;

  if new.status <> 'published' then
    return new;
  end if;

  if not exists (
    select 1
      from storage.objects as object
     where object.bucket_id = 'profile-images'
       and object.name = new.image_path
  ) then
    raise exception using
      errcode = '23514',
      message = 'A published practitioner must have a stored portrait object';
  end if;

  if new.portrait_approval_required and new.portrait_approved_at is null then
    raise exception using
      errcode = '23514',
      message = 'A newly uploaded portrait must have recorded approval before publication';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_practitioner_portrait_publication()
  from public, anon, authenticated;
grant execute on function public.validate_practitioner_portrait_publication()
  to service_role;

drop trigger if exists practitioners_validate_portrait_publication on public.practitioners;
drop trigger if exists practitioners_zz_validate_portrait_publication on public.practitioners;
drop trigger if exists practitioners_00_reject_published_insert on public.practitioners;
create trigger practitioners_00_reject_published_insert
before insert on public.practitioners
for each row
execute function public.validate_practitioner_portrait_publication();
create trigger practitioners_zz_validate_portrait_publication
before insert or update of status, image_path, portrait_approved_at, portrait_approval_required
on public.practitioners
for each row
execute function public.validate_practitioner_portrait_publication();

drop function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
);

create or replace function public.save_admin_practitioner(
  p_practitioner_id uuid default null,
  p_slug text default '',
  p_name text default '',
  p_descriptor text default null,
  p_years_active integer default null,
  p_summary text default null,
  p_about text default null,
  p_credentials text[] default null,
  p_significant_training text[] default null,
  p_offers_in_person boolean default true,
  p_offers_online boolean default true,
  p_website_url text default null,
  p_instagram_url text default null,
  p_image_path text default null,
  p_image_alt text default null,
  p_image_focal_x numeric default 50,
  p_image_focal_y numeric default 50,
  p_status text default 'draft',
  p_featured_position smallint default null,
  p_term_ids uuid[] default '{}'::uuid[],
  p_portrait_approval_confirmed boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.practitioners%rowtype;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  if p_status not in ('draft', 'published', 'archived') then
    raise exception using errcode = '22023', message = 'Invalid practitioner status';
  end if;

  perform set_config(
    'app.portrait_approval_confirmed',
    case when p_portrait_approval_confirmed then 'true' else 'false' end,
    true
  );

  if p_practitioner_id is null then
    insert into public.practitioners (slug, name, descriptor, status)
    values (p_slug, p_name, p_descriptor, 'draft')
    returning * into target;
  else
    select * into target
      from public.practitioners
     where id = p_practitioner_id
     for update;
    if not found then
      raise exception using errcode = 'P0002', message = 'Practitioner not found';
    end if;
    if target.status = 'draft' and p_status = 'published' then
      raise exception using errcode = '23514', message = 'Publish a saved draft with the publish action';
    end if;
  end if;

  insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
  select target.id, requested.term_id, requested.ordinality - 1
    from unnest(coalesce(p_term_ids, '{}'::uuid[])) with ordinality as requested(term_id, ordinality)
  on conflict (practitioner_id, term_id)
  do update set display_order = excluded.display_order;

  update public.practitioners
     set slug = p_slug,
         name = p_name,
         descriptor = p_descriptor,
         years_active = p_years_active,
         summary = p_summary,
         about = p_about,
         credentials = p_credentials,
         significant_training = p_significant_training,
         offers_in_person = p_offers_in_person,
         offers_online = p_offers_online,
         website_url = p_website_url,
         instagram_url = p_instagram_url,
         image_path = p_image_path,
         image_alt = p_image_alt,
         image_focal_x = coalesce(p_image_focal_x, 50),
         image_focal_y = coalesce(p_image_focal_y, 50),
         status = case when p_practitioner_id is null then 'draft' else p_status end,
         featured_position = p_featured_position,
         portrait_approval_required = target.portrait_approval_required,
         portrait_approved_at = target.portrait_approved_at
   where id = target.id;

  if p_portrait_approval_confirmed and p_image_path is not null then
    update public.practitioners
       set portrait_approved_at = pg_catalog.now(),
           portrait_approval_required = true
     where id = target.id;
  end if;

  delete from public.practitioner_term_links as links
   where links.practitioner_id = target.id
     and not exists (
       select 1
         from unnest(coalesce(p_term_ids, '{}'::uuid[])) as requested(term_id)
        where requested.term_id = links.term_id
     );

  perform set_config('app.portrait_approval_confirmed', 'false', true);

  return target.id;
end;
$$;

create or replace function public.publish_admin_practitioner(p_practitioner_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.practitioners%rowtype;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  select * into target
    from public.practitioners
   where id = p_practitioner_id
   for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Practitioner not found';
  end if;
  if target.status <> 'draft' then
    raise exception using errcode = '23514', message = 'Only a saved draft can be published';
  end if;

  update public.practitioners
     set status = 'published'
   where id = target.id;

  return target.id;
end;
$$;

revoke all on function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[], boolean
) from public, anon;
grant execute on function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[], boolean
) to authenticated, service_role;
revoke all on function public.publish_admin_practitioner(uuid) from public, anon;
grant execute on function public.publish_admin_practitioner(uuid) to authenticated, service_role;

comment on function public.save_admin_practitioner(uuid, text, text, text, integer, text, text, text[], text[], boolean, boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[], boolean) is
  'Atomically save an administrator-editable practitioner. New rows remain drafts.';
comment on function public.publish_admin_practitioner(uuid) is
  'Publish one complete saved draft practitioner under administrator RLS.';
