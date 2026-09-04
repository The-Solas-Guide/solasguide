-- Failed portrait saves may leave a draft reservation behind. Clean up only
-- the exact untouched reservation through the caller's RLS privileges.
create or replace function admin_api.delete_admin_practitioner_reservation(p_practitioner_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reservation_id uuid;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  -- Lock the row before checking its reservation-only values. A concurrent
  -- administrator edit must make this cleanup a no-op, not a data loss.
  select p.id
    into reservation_id
    from public.practitioners as p
   where p.id = p_practitioner_id
     and p.slug ~ '^reserved-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     and p.name = 'Reserved practitioner'
     and p.descriptor = '__admin_upload_reservation__'
     and p.years_active is null
     and p.summary is null
     and p.about is null
     and p.credentials is null
     and p.significant_training is null
     and p.offers_in_person
     and p.offers_online
     and p.website_url is null
     and p.instagram_url is null
     and p.image_path is null
     and p.image_alt is null
     and p.image_focal_x = 50
     and p.image_focal_y = 50
     and p.status = 'draft'
     and p.published_at is null
     and p.archived_at is null
     and p.featured_position is null
     and p.updated_at = p.created_at
     and not exists (
       select 1
         from public.practitioner_term_links as links
        where links.practitioner_id = p.id
     )
   for update;

  if reservation_id is null then
    return;
  end if;

  -- The archive is deliberate. The existing delete trigger then enforces
  -- lifecycle and Storage cleanup, and any failure rolls this update back.
  update public.practitioners
     set status = 'archived',
         archived_at = pg_catalog.now()
   where id = reservation_id;

  delete from public.practitioners
   where id = reservation_id
     and status = 'archived'
     and descriptor = '__admin_upload_reservation__'
     and published_at is null
     and archived_at is not null
     and featured_position is null
     and image_path is null;
end;
$$;

revoke all on function admin_api.delete_admin_practitioner_reservation(uuid)
  from public, anon, authenticated;
grant execute on function admin_api.delete_admin_practitioner_reservation(uuid)
  to authenticated, service_role;

comment on function admin_api.delete_admin_practitioner_reservation(uuid) is
  'Atomically archives and removes only an untouched administrator upload reservation through RLS and delete triggers.';
