create schema if not exists admin_private;

revoke all on schema admin_private from public;
grant usage on schema admin_private to authenticated, service_role;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;
grant all on table public.admin_users to service_role;

create policy admin_users_read_own
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function admin_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
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

comment on table public.admin_users is
  'Allowlist of Supabase Auth users who may access the Solas Admin CMS.';

comment on function admin_private.is_admin() is
  'Return true when the authenticated user exists in the admin allowlist.';
