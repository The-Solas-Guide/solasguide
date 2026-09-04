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
