begin;

select no_plan();

select is(
  (select prosecdef
     from pg_proc
    where oid = 'public.delete_admin_practitioner_reservation(uuid)'::regprocedure),
  false,
  'reservation cleanup is security invoker'
);
select ok(
  exists (
    select 1
      from pg_proc,
           unnest(coalesce(proconfig, array[]::text[])) as setting
     where oid = 'public.delete_admin_practitioner_reservation(uuid)'::regprocedure
       and setting = 'search_path=""'
  ),
  'reservation cleanup uses an empty search path'
);
select ok(
  (select prosrc
     from pg_proc
    where oid = 'public.delete_admin_practitioner_reservation(uuid)'::regprocedure)
    !~* 'disable[[:space:]]+trigger',
  'reservation cleanup does not disable triggers'
);
select ok(
  (select prosrc
     from pg_proc
    where oid = 'public.delete_admin_practitioner_reservation(uuid)'::regprocedure)
    ~* 'for[[:space:]]+update',
  'reservation cleanup locks the matching reservation'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.delete_admin_practitioner_reservation(uuid)',
    'EXECUTE'
  ),
  'authenticated administrators can request reservation cleanup'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.delete_admin_practitioner_reservation(uuid)',
    'EXECUTE'
  ),
  'anonymous users cannot request reservation cleanup'
);

set local role postgres;
insert into auth.users (id, instance_id, aud, role, email)
values
  (
    '00000000-0000-0000-0000-00000000c401',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'reservation-admin@example.com'
  ),
  (
    '00000000-0000-0000-0000-00000000c402',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'reservation-user@example.com'
  );
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-00000000c401');

insert into public.practitioners (id, slug, name, descriptor, status)
values
  (
    '00000000-0000-0000-0000-00000000c411',
    'reserved-00000000-0000-0000-0000-00000000c411',
    'Reserved practitioner',
    '__admin_upload_reservation__',
    'draft'
  ),
  (
    '00000000-0000-0000-0000-00000000c412',
    'reserved-00000000-0000-0000-0000-00000000c412',
    'Edited reservation',
    '__admin_upload_reservation__',
    'draft'
  ),
  (
    '00000000-0000-0000-0000-00000000c413',
    'reserved-00000000-0000-0000-0000-00000000c413',
    'Reserved practitioner',
    '__admin_upload_reservation__',
    'draft'
  );
insert into storage.objects (bucket_id, name, owner, metadata)
values (
  'profile-images',
  '00000000-0000-0000-0000-00000000c413/orphan.png',
  '00000000-0000-0000-0000-00000000c401',
  '{"mimetype":"image/png"}'::jsonb
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-0000-0000-00000000c402',
    'role', 'authenticated'
  )::text,
  true
);
select throws_ok(
  $$select public.delete_admin_practitioner_reservation('00000000-0000-0000-0000-00000000c411'::uuid)$$,
  '42501',
  null,
  'non-admin users cannot clean reservations'
);
set local role postgres;
select is(
  (select status from public.practitioners where id = '00000000-0000-0000-0000-00000000c411'),
  'draft',
  'non-admin cleanup leaves the reservation unchanged'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-0000-0000-00000000c401',
    'role', 'authenticated'
  )::text,
  true
);
select lives_ok(
  $$select public.delete_admin_practitioner_reservation('00000000-0000-0000-0000-00000000c412'::uuid)$$,
  'administrator cleanup ignores an edited reservation'
);
select is(
  (select name from public.practitioners where id = '00000000-0000-0000-0000-00000000c412'),
  'Edited reservation',
  'edited reservation remains available'
);

select lives_ok(
  $$select public.delete_admin_practitioner_reservation('00000000-0000-0000-0000-00000000c411'::uuid)$$,
  'administrator cleanup removes an untouched reservation'
);
select is(
  (select count(*)::integer from public.practitioners where id = '00000000-0000-0000-0000-00000000c411'),
  0,
  'untouched reservation is deleted'
);

select throws_ok(
  $$select public.delete_admin_practitioner_reservation('00000000-0000-0000-0000-00000000c413'::uuid)$$,
  '23514',
  null,
  'Storage objects block reservation deletion through the existing trigger'
);
select is(
  (select status from public.practitioners where id = '00000000-0000-0000-0000-00000000c413'),
  'draft',
  'failed Storage cleanup rolls back the archive'
);
select ok(
  (select archived_at is null from public.practitioners where id = '00000000-0000-0000-0000-00000000c413'),
  'failed Storage cleanup leaves archived_at null'
);
select is(
  (select count(*)::integer
     from storage.objects
    where bucket_id = 'profile-images'
      and name = '00000000-0000-0000-0000-00000000c413/orphan.png'),
  1,
  'failed cleanup leaves the Storage object in place'
);

select * from finish();
rollback;
