begin;

select plan(15);

select has_schema('admin_private', 'admin private schema exists');
select has_table('public', 'admin_users', 'admin allowlist table exists');
select has_column('public', 'admin_users', 'user_id', 'admin allowlist has user id');
select has_column('public', 'admin_users', 'created_at', 'admin allowlist has created at');
select has_function(
  'admin_private',
  'is_admin',
  array[]::text[],
  'admin authorization helper exists'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.admin_users'::regclass),
  true,
  'admin allowlist has row-level security enabled'
);

select ok(
  not has_table_privilege('anon', 'public.admin_users', 'SELECT'),
  'anonymous users cannot select the admin allowlist'
);
select ok(
  has_table_privilege('authenticated', 'public.admin_users', 'SELECT'),
  'authenticated users can request their own allowlist row'
);
select ok(
  not has_table_privilege('authenticated', 'public.admin_users', 'INSERT'),
  'authenticated users cannot add administrators'
);
select ok(
  not has_function_privilege('anon', 'admin_private.is_admin()', 'EXECUTE'),
  'anonymous users cannot execute the admin helper'
);
select ok(
  has_function_privilege('authenticated', 'admin_private.is_admin()', 'EXECUTE'),
  'authenticated users can execute the admin helper'
);

insert into auth.users (id, instance_id, aud, role, email)
values
  (
    '00000000-0000-0000-0000-00000000a001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'approved-admin@example.com'
  ),
  (
    '00000000-0000-0000-0000-00000000a002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ordinary-user@example.com'
  );

insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-00000000a001');

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-00000000a002',
  true
);

select is(
  (select count(*)::integer from public.admin_users),
  0,
  'a non-admin cannot read another allowlist row'
);
select is(
  admin_private.is_admin(),
  false,
  'the admin helper rejects a non-admin'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-00000000a001',
  true
);

select is(
  (select count(*)::integer from public.admin_users),
  1,
  'an administrator can read their own allowlist row'
);
select is(
  admin_private.is_admin(),
  true,
  'the admin helper accepts an approved administrator'
);

select * from finish();
rollback;
