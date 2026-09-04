-- The admin mutation routines use SECURITY INVOKER and enforce administrator
-- access and table RLS. Keep them in the default exposed schema so clients can
-- call them through the ordinary Supabase RPC surface.

alter function admin_api.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) set schema public;

alter function admin_api.reorder_admin_featured(uuid[]) set schema public;
alter function admin_api.reserve_admin_practitioner() set schema public;
alter function admin_api.delete_admin_practitioner_reservation(uuid) set schema public;

alter function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) security invoker set search_path = '';
alter function public.reorder_admin_featured(uuid[]) security invoker set search_path = '';
alter function public.reserve_admin_practitioner() security invoker set search_path = '';
alter function public.delete_admin_practitioner_reservation(uuid) security invoker set search_path = '';

revoke all on function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) from public, anon;
grant execute on function public.save_admin_practitioner(
  uuid, text, text, text, integer, text, text, text[], text[], boolean,
  boolean, text, text, text, text, numeric, numeric, text, smallint, uuid[]
) to authenticated, service_role;

revoke all on function public.reorder_admin_featured(uuid[]) from public, anon;
grant execute on function public.reorder_admin_featured(uuid[]) to authenticated, service_role;

revoke all on function public.reserve_admin_practitioner() from public, anon;
grant execute on function public.reserve_admin_practitioner() to authenticated, service_role;

revoke all on function public.delete_admin_practitioner_reservation(uuid) from public, anon;
grant execute on function public.delete_admin_practitioner_reservation(uuid) to authenticated, service_role;

-- No CASCADE: PostgreSQL refuses to drop a non-empty schema.
drop schema if exists admin_api;
