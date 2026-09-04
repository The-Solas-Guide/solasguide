-- Keep administrator mutation routines outside the default public API schema.
-- The dedicated schema is exposed intentionally for authenticated server
-- actions, while the authorization helpers remain in the unexposed
-- admin_private schema.

create schema if not exists admin_api;

revoke all on schema admin_api from public;
grant usage on schema admin_api to authenticated, service_role;

alter function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) set schema admin_api;

alter function public.reorder_admin_featured(uuid[]) set schema admin_api;

revoke all on function admin_api.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) from public, anon;
grant execute on function admin_api.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) to authenticated, service_role;

revoke all on function admin_api.reorder_admin_featured(uuid[]) from public, anon;
grant execute on function admin_api.reorder_admin_featured(uuid[]) to authenticated, service_role;

comment on function admin_api.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) is 'Atomically save administrator-editable practitioner fields and taxonomy links under RLS.';
comment on function admin_api.reorder_admin_featured(uuid[]) is
  'Atomically replace the featured practitioner order under RLS.';

create or replace function admin_api.create_admin_practitioner_draft()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  practitioner_id uuid;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;
  insert into public.practitioners (slug, name, status)
  values ('draft-' || gen_random_uuid()::text, 'Untitled practitioner', 'draft')
  returning id into practitioner_id;
  return practitioner_id;
end;
$$;

create or replace function admin_api.delete_failed_admin_practitioner_draft(p_practitioner_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;
  delete from public.practitioner_term_links where practitioner_id = p_practitioner_id;
  delete from public.practitioners
   where id = p_practitioner_id
     and status = 'draft'
     and published_at is null
     and archived_at is null
     and featured_position is null
     and image_path is null;
end;
$$;

revoke all on function admin_api.create_admin_practitioner_draft() from public, anon;
grant execute on function admin_api.create_admin_practitioner_draft() to authenticated, service_role;
revoke all on function admin_api.delete_failed_admin_practitioner_draft(uuid) from public, anon;
grant execute on function admin_api.delete_failed_admin_practitioner_draft(uuid) to authenticated, service_role;
