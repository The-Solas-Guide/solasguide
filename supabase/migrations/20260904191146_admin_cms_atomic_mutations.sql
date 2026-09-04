-- Atomic administrator mutations. These functions remain security invoker so
-- every table write is still subject to the caller's RLS policies.

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
  p_term_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_practitioner_id uuid := p_practitioner_id;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  if p_status not in ('draft', 'published', 'archived') then
    raise exception using errcode = '22023', message = 'Invalid practitioner status';
  end if;

  if target_practitioner_id is null then
    insert into public.practitioners (
      slug, name, descriptor, years_active, summary, about, credentials,
      significant_training, offers_in_person, offers_online, website_url,
      instagram_url, image_path, image_alt, image_focal_x, image_focal_y,
      status, featured_position
    ) values (
      p_slug, p_name, p_descriptor, p_years_active, p_summary, p_about,
      p_credentials, p_significant_training, p_offers_in_person,
      p_offers_online, p_website_url, p_instagram_url, p_image_path,
      p_image_alt, coalesce(p_image_focal_x, 50), coalesce(p_image_focal_y, 50),
      'draft', null
    ) returning id into target_practitioner_id;
  else
    if not exists (select 1 from public.practitioners where id = target_practitioner_id) then
      raise exception using errcode = 'P0002', message = 'Practitioner not found';
    end if;
  end if;

  -- Add requested links before removing old links. This keeps a published
  -- practitioner locatable while its taxonomy is being replaced.
  insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
  select target_practitioner_id, requested.term_id, requested.ordinality - 1
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
         status = p_status,
         featured_position = p_featured_position
   where id = target_practitioner_id;

  delete from public.practitioner_term_links as links
   where links.practitioner_id = target_practitioner_id
     and not exists (
       select 1
         from unnest(coalesce(p_term_ids, '{}'::uuid[])) as requested(term_id)
        where requested.term_id = links.term_id
     );

  return target_practitioner_id;
end;
$$;

revoke all on function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) from public, anon;
grant execute on function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) to authenticated, service_role;

create or replace function public.reorder_admin_featured(p_practitioner_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  practitioner_id uuid;
  requested_count integer := coalesce(cardinality(p_practitioner_ids), 0);
  current_featured_count integer;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  if requested_count > 8 then
    raise exception using errcode = '22023', message = 'Featured ordering supports at most eight practitioners';
  end if;

  if exists (
    select 1
      from unnest(coalesce(p_practitioner_ids, '{}'::uuid[])) as requested(id)
     group by requested.id
    having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'Featured ordering contains duplicate practitioners';
  end if;

  select count(*) into current_featured_count
    from public.practitioners
   where featured_position is not null;

  -- Reordering is only valid against the complete current set. This prevents
  -- a stale Sheet from silently unfeaturing records added by another admin.
  if current_featured_count <> requested_count
     or exists (
       select 1 from public.practitioners
        where featured_position is not null
          and not (id = any(coalesce(p_practitioner_ids, '{}'::uuid[])))
     )
     or exists (
       select 1 from public.practitioners
        where id = any(coalesce(p_practitioner_ids, '{}'::uuid[]))
          and featured_position is null
     ) then
    raise exception using errcode = 'P0002', message = 'Featured ordering is stale. Refresh and try again.';
  end if;

  if (
    select count(*)
      from public.practitioners
     where id = any(coalesce(p_practitioner_ids, '{}'::uuid[]))
       and status = 'published'
  ) <> requested_count then
    raise exception using errcode = 'P0002', message = 'Featured ordering contains a missing or unpublished practitioner';
  end if;

  update public.practitioners set featured_position = null where featured_position is not null;

  for practitioner_id in
    select requested.id
      from unnest(coalesce(p_practitioner_ids, '{}'::uuid[])) with ordinality as requested(id, position)
     order by requested.position
  loop
    update public.practitioners
       set featured_position = (
         select requested.position
           from unnest(coalesce(p_practitioner_ids, '{}'::uuid[])) with ordinality as requested(id, position)
          where requested.id = practitioner_id
       )
     where id = practitioner_id;
  end loop;
end;
$$;

revoke all on function public.reorder_admin_featured(uuid[]) from public, anon;
grant execute on function public.reorder_admin_featured(uuid[]) to authenticated, service_role;

comment on function public.save_admin_practitioner(uuid, text, text, text, integer, text, text, text[], text[], boolean, boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]) is
  'Atomically save administrator-editable practitioner fields and taxonomy links under RLS.';
comment on function public.reorder_admin_featured(uuid[]) is
  'Atomically replace the featured practitioner order under RLS.';
