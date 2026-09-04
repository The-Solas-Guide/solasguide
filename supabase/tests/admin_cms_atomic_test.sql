begin;

select no_plan();

select is(
  (select prosecdef from pg_proc where oid = 'public.save_admin_practitioner(uuid,text,text,text,integer,text,text,text[],text[],boolean,boolean,text,text,text,text,numeric,numeric,text,smallint,uuid[])'::regprocedure),
  false,
  'practitioner save RPC is security invoker'
);
select is(
  (select prosecdef from pg_proc where oid = 'public.reorder_admin_featured(uuid[])'::regprocedure),
  false,
  'featured reorder RPC is security invoker'
);
select ok(
  exists (select 1 from pg_proc, unnest(coalesce(proconfig, array[]::text[])) as setting where oid = 'public.save_admin_practitioner(uuid,text,text,text,integer,text,text,text[],text[],boolean,boolean,text,text,text,text,numeric,numeric,text,smallint,uuid[])'::regprocedure and setting = 'search_path=""'),
  'practitioner save RPC uses an empty search path'
);
select ok(
  exists (select 1 from pg_proc, unnest(coalesce(proconfig, array[]::text[])) as setting where oid = 'public.reorder_admin_featured(uuid[])'::regprocedure and setting = 'search_path=""'),
  'featured reorder RPC uses an empty search path'
);
select ok(not has_function_privilege('anon', 'public.save_admin_practitioner(uuid,text,text,text,integer,text,text,text[],text[],boolean,boolean,text,text,text,text,numeric,numeric,text,smallint,uuid[])', 'EXECUTE'), 'anonymous users cannot execute practitioner save RPC');
select ok(has_function_privilege('authenticated', 'public.save_admin_practitioner(uuid,text,text,text,integer,text,text,text[],text[],boolean,boolean,text,text,text,text,numeric,numeric,text,smallint,uuid[])', 'EXECUTE'), 'authenticated users can request practitioner save RPC');
select ok(not has_function_privilege('anon', 'public.reorder_admin_featured(uuid[])', 'EXECUTE'), 'anonymous users cannot execute featured reorder RPC');
select ok(has_function_privilege('authenticated', 'public.reorder_admin_featured(uuid[])', 'EXECUTE'), 'authenticated users can request featured reorder RPC');

set local role postgres;
insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'atomic-admin@example.com'),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'atomic-user@example.com');
insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-00000000c001');
insert into public.practitioners (id, slug, name, status)
values ('00000000-0000-0000-0000-00000000c101', 'atomic-practitioner', 'Atomic Practitioner', 'draft');
insert into public.practitioners (id, slug, name, summary, about, image_path, status)
values
  ('00000000-0000-0000-0000-00000000c102', 'atomic-featured-one', 'Atomic Featured One', 'Summary one', 'About one', '00000000-0000-0000-0000-00000000c102/one.jpg', 'draft'),
  ('00000000-0000-0000-0000-00000000c103', 'atomic-featured-two', 'Atomic Featured Two', 'Summary two', 'About two', '00000000-0000-0000-0000-00000000c103/two.jpg', 'draft'),
  ('00000000-0000-0000-0000-00000000c104', 'atomic-unpublished', 'Atomic Unpublished', 'Summary three', 'About three', '00000000-0000-0000-0000-00000000c104/three.jpg', 'draft');
insert into public.practitioner_term_links (practitioner_id, term_id)
select id_to_link, id from public.practitioner_terms cross join (values
  ('00000000-0000-0000-0000-00000000c101'::uuid),
  ('00000000-0000-0000-0000-00000000c102'::uuid),
  ('00000000-0000-0000-0000-00000000c103'::uuid),
  ('00000000-0000-0000-0000-00000000c104'::uuid)
) as records(id_to_link)
where type = 'location' and slug = 'bali';
update public.practitioners set status = 'published' where id in ('00000000-0000-0000-0000-00000000c102', '00000000-0000-0000-0000-00000000c103');
update public.practitioners set featured_position = 1 where id = '00000000-0000-0000-0000-00000000c102';
update public.practitioners set featured_position = 2 where id = '00000000-0000-0000-0000-00000000c103';

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000c002', 'role', 'authenticated')::text, true);
select throws_ok(
  $$select public.save_admin_practitioner(p_practitioner_id => '00000000-0000-0000-0000-00000000c101'::uuid, p_slug => 'blocked', p_name => 'Blocked')$$,
  '42501', null, 'non-admin users cannot call practitioner save RPC'
);
select throws_ok(
  $$select public.reorder_admin_featured(array['00000000-0000-0000-0000-00000000c102'::uuid, '00000000-0000-0000-0000-00000000c103'::uuid])$$,
  '42501', null, 'non-admin users cannot call featured reorder RPC'
);

select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000c001', 'role', 'authenticated')::text, true);
select is(
  public.save_admin_practitioner(
    p_practitioner_id => '00000000-0000-0000-0000-00000000c101'::uuid,
    p_slug => 'atomic-practitioner-updated', p_name => 'Atomic Practitioner Updated',
    p_summary => 'A saved summary', p_about => 'Saved about text',
    p_image_focal_x => 31, p_image_focal_y => 68, p_term_ids => array[(select id from public.practitioner_terms where slug = 'bali')]
  ),
  '00000000-0000-0000-0000-00000000c101'::uuid,
  'administrator RPC saves practitioner fields and links together'
);
select is((select name from public.practitioners where id = '00000000-0000-0000-0000-00000000c101'), 'Atomic Practitioner Updated', 'atomic practitioner fields are updated');
select is((select image_focal_x from public.practitioners where id = '00000000-0000-0000-0000-00000000c101'), 31::numeric, 'atomic save persists focal X');
select is((select count(*)::integer from public.practitioner_term_links where practitioner_id = '00000000-0000-0000-0000-00000000c101'), 1, 'atomic save persists practitioner links');
select throws_ok(
  $$select public.save_admin_practitioner(p_practitioner_id => '00000000-0000-0000-0000-00000000c101'::uuid, p_slug => 'should-roll-back', p_name => 'Should Roll Back', p_term_ids => array['00000000-0000-0000-0000-00000000c999'::uuid])$$,
  '23503', null, 'invalid practitioner link rolls back the atomic save'
);
select is((select name from public.practitioners where id = '00000000-0000-0000-0000-00000000c101'), 'Atomic Practitioner Updated', 'failed atomic save leaves practitioner fields unchanged');

select throws_ok(
  $$select public.reorder_admin_featured(array['00000000-0000-0000-0000-00000000c102'::uuid])$$,
  'P0002', null, 'featured reorder rejects missing current IDs'
);
select throws_ok(
  $$select public.reorder_admin_featured(array['00000000-0000-0000-0000-00000000c102'::uuid, '00000000-0000-0000-0000-00000000c104'::uuid])$$,
  'P0002', null, 'featured reorder rejects stale unpublished IDs'
);
select is((select featured_position from public.practitioners where id = '00000000-0000-0000-0000-00000000c102'), 1::smallint, 'failed featured reorder preserves first position');
select is((select featured_position from public.practitioners where id = '00000000-0000-0000-0000-00000000c103'), 2::smallint, 'failed featured reorder preserves second position');
select lives_ok(
  $$select public.reorder_admin_featured(array['00000000-0000-0000-0000-00000000c103'::uuid, '00000000-0000-0000-0000-00000000c102'::uuid])$$,
  'administrator can atomically reorder featured practitioners'
);
select is((select featured_position from public.practitioners where id = '00000000-0000-0000-0000-00000000c103'), 1::smallint, 'featured reorder assigns requested first position');
select is((select featured_position from public.practitioners where id = '00000000-0000-0000-0000-00000000c102'), 2::smallint, 'featured reorder assigns requested second position');

select * from finish();
rollback;
