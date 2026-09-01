begin;

select plan(57);

select has_table('public', 'practitioners', 'practitioners table exists');
select has_table('public', 'practitioner_terms', 'practitioner_terms table exists');
select has_table('public', 'practitioner_term_links', 'practitioner_term_links table exists');
select has_column('public', 'practitioners', 'image_focal_x', 'practitioners has image_focal_x');
select has_column('public', 'practitioners', 'published_at', 'practitioners has published_at');
select has_column('public', 'practitioner_terms', 'is_active', 'practitioner_terms has is_active');
select has_column('public', 'practitioner_term_links', 'display_order', 'links have display_order');

select is(
  (select count(*)::integer from public.practitioners),
  20,
  'seed includes the 20 supplied practitioner drafts'
);
select is(
  (select count(*)::integer from public.practitioners where status = 'draft' and published_at is null),
  20,
  'all supplied practitioners start as unpublished drafts'
);
select is(
  (select count(*)::integer
     from public.practitioner_terms
    where type = 'support_area'),
  15,
  'support areas are profile-sourced and controlled'
);
select is(
  (select count(*)::integer
     from public.practitioner_terms
    where type = 'approach'),
  13,
  'approaches are profile-sourced and controlled'
);
select is(
  (select count(*)::integer
     from public.practitioner_terms
    where type = 'works_with'),
  5,
  'works-with values are profile-sourced and controlled'
);
select is(
  (select count(*)::integer
     from public.practitioner_term_links as l
     join public.practitioner_terms as t on t.id = l.term_id
    where t.type = 'location'),
  39,
  'every supplied profile has at least one location link'
);

select is(
  (select relrowsecurity
     from pg_class
    where oid = 'public.practitioners'::regclass),
  true,
  'practitioners has row-level security enabled'
);
select is(
  (select relrowsecurity
     from pg_class
    where oid = 'public.practitioner_terms'::regclass),
  true,
  'practitioner_terms has row-level security enabled'
);
select is(
  (select relrowsecurity
     from pg_class
    where oid = 'public.practitioner_term_links'::regclass),
  true,
  'practitioner_term_links has row-level security enabled'
);

select is(
  (select b.file_size_limit = 5242880 and b.public
     from storage.buckets as b
    where b.id = 'profile-images'),
  true,
  'profile-images is a public bucket with a size limit'
);
select is(
  (select count(*)::integer
     from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_public_read'),
  1,
  'profile images have an explicit public read policy'
);
select is(
  (select count(*)::integer
     from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_service_role_manage'),
  1,
  'profile image writes have a service-role-only policy'
);

select is(
  (
    select bool_and(
      not has_function_privilege(role_name, function_signature, 'EXECUTE')
    )
      from (
        values
          ('anon', 'public.set_practitioner_updated_at()'),
          ('anon', 'public.assert_published_practitioner_has_location(uuid)'),
          ('anon', 'public.validate_practitioner_publication()'),
          ('anon', 'public.validate_practitioner_location_links()'),
          ('anon', 'public.validate_practitioner_term_type_changes()'),
          ('authenticated', 'public.set_practitioner_updated_at()'),
          ('authenticated', 'public.assert_published_practitioner_has_location(uuid)'),
          ('authenticated', 'public.validate_practitioner_publication()'),
          ('authenticated', 'public.validate_practitioner_location_links()'),
          ('authenticated', 'public.validate_practitioner_term_type_changes()')
      ) as directory_functions(role_name, function_signature)
  ),
  true,
  'anon and authenticated cannot execute directory helper or trigger functions'
);

insert into public.practitioners (
  id, slug, name, summary, about, image_path, status
)
values (
  '00000000-0000-0000-0000-000000009001',
  'schema-test-published',
  'Schema Test Published',
  'A published schema fixture.',
  'A published schema fixture with complete required copy.',
  'schema-test-published.jpg',
  'draft'
);

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 0
  from public.practitioner_terms
 where type = 'location' and slug = 'bali';

update public.practitioners
   set status = 'published'
 where id = '00000000-0000-0000-0000-000000009001';

insert into public.practitioners (id, slug, name, status)
values (
  '00000000-0000-0000-0000-000000009002',
  'schema-test-archived',
  'Schema Test Archived',
  'archived'
);

insert into public.practitioners (id, slug, name, about, image_path, status)
values (
  '00000000-0000-0000-0000-000000009003',
  'schema-test-incomplete',
  'Schema Test Incomplete',
  'Only the optional publication fields are present.',
  'schema-test-incomplete.jpg',
  'draft'
);

insert into public.practitioners (id, slug, name, summary, about, image_path, status)
values (
  '00000000-0000-0000-0000-000000009004',
  'schema-test-multi-location',
  'Schema Test Multiple Locations',
  'A draft with multiple locations.',
  'A draft with complete publication copy.',
  'schema-test-multi-location.jpg',
  'draft'
);

insert into public.practitioners (id, slug, name, summary, about, image_path, status)
values (
  '00000000-0000-0000-0000-000000009008',
  'schema-test-no-location',
  'Schema Test No Location',
  'A complete profile without a location.',
  'A complete profile without a location link.',
  'schema-test-no-location.jpg',
  'draft'
);

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009004', id, 0
  from public.practitioner_terms
 where type = 'location' and slug = 'bali';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009004', id, 1
  from public.practitioner_terms
 where type = 'location' and slug = 'international';

insert into public.practitioner_terms (type, name, slug, sort_order, is_active)
values (
  'location',
  'Schema Test Inactive Location',
  'schema-test-inactive-location',
  999,
  false
);

insert into public.practitioner_terms (type, name, slug, sort_order, is_active)
values (
  'support_area',
  'Schema Test Active Empty Area',
  'schema-test-active-empty-area',
  998,
  true
);

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 1
  from public.practitioner_terms
 where type = 'location' and slug = 'schema-test-inactive-location';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 0
  from public.practitioner_terms
 where type = 'support_area' and slug = 'trauma-and-nervous-system';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 0
  from public.practitioner_terms
 where type = 'approach' and slug = 'coaching';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 0
  from public.practitioner_terms
 where type = 'works_with' and slug = 'individuals';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 0
  from public.practitioner_terms
 where type = 'language' and slug = 'english';

insert into public.practitioners (
  id, slug, name, summary, about, offers_in_person, offers_online, image_path, status
)
values (
  '00000000-0000-0000-0000-000000009010',
  'schema-test-online',
  'Online Somatic Practitioner',
  'Offers anxiety support online.',
  'An online practitioner profile for search and format filtering.',
  false,
  true,
  'schema-test-online.jpg',
  'draft'
);

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009010', id, 0
  from public.practitioner_terms
 where type = 'support_area' and slug = 'anxiety-and-emotional-wellbeing';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009010', id, 0
  from public.practitioner_terms
 where type = 'location' and slug = 'international';

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009010', id, 0
  from public.practitioner_terms
 where type = 'language' and slug = 'english';

update public.practitioners
   set status = 'published'
 where id = '00000000-0000-0000-0000-000000009010';

update public.practitioners
   set offers_online = false
 where id = '00000000-0000-0000-0000-000000009001';

insert into public.practitioner_terms (type, name, slug, sort_order, is_active)
values (
  'language',
  'Schema Test Draft Only',
  'schema-test-draft-only',
  999,
  true
);

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009003', id, 0
  from public.practitioner_terms
 where type = 'language' and slug = 'schema-test-draft-only';

insert into public.practitioners (id, slug, name, summary, about, image_path, status)
values (
  '00000000-0000-0000-0000-000000009009',
  'schema-test-inactive-only',
  'Schema Test Inactive Only',
  'A complete profile with an inactive location only.',
  'A complete profile whose only location is inactive.',
  'schema-test-inactive-only.jpg',
  'draft'
);

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009009', id, 0
  from public.practitioner_terms
 where type = 'location' and slug = 'schema-test-inactive-location';

select throws_ok(
  $$insert into public.practitioners (id, slug, name) values ('00000000-0000-0000-0000-000000009005', 'schema-test-published', 'Duplicate slug')$$,
  '23505',
  null,
  'duplicate practitioner slugs fail'
);
select throws_ok(
  $$insert into public.practitioners (id, slug, name, years_active) values ('00000000-0000-0000-0000-000000009006', 'schema-test-invalid-years', 'Invalid years', 0)$$,
  '23514',
  null,
  'non-positive years_active fail'
);
select throws_ok(
  $$insert into public.practitioners (id, slug, name, image_focal_x) values ('00000000-0000-0000-0000-000000009007', 'schema-test-invalid-focal', 'Invalid focal', 100.01)$$,
  '23514',
  null,
  'image focal values outside 0 to 100 fail'
);
select throws_ok(
  $$update public.practitioners set status = 'published' where id = '00000000-0000-0000-0000-000000009003'$$,
  '23514',
  null,
  'publication without a summary fails'
);
select throws_ok(
  $$update public.practitioners set status = 'published' where id = '00000000-0000-0000-0000-000000009008'$$,
  '23514',
  null,
  'publication without a location fails'
);
select throws_ok(
  $$update public.practitioners set status = 'published' where id = '00000000-0000-0000-0000-000000009009'$$,
  '23514',
  null,
  'publication with only an inactive location fails'
);
select throws_ok(
  $$update public.practitioner_terms set is_active = false where type = 'location' and slug = 'bali'$$,
  '23514',
  null,
  'deactivating the last active location fails'
);
select is(
  (select published_at is not null
     from public.practitioners
    where id = '00000000-0000-0000-0000-000000009001'),
  true,
  'publishing sets published_at'
);

set local role anon;

select is(
  (
    select bool_and(
      has_function_privilege(
        role_name,
        'public.get_active_practitioner_taxonomy_term(text,text)',
        'EXECUTE'
      )
    )
      from (values ('anon'), ('authenticated'), ('service_role')) as allowed_roles(role_name)
  ),
  true,
  'active taxonomy RPC is executable by public API roles'
);

select is(
  (
    select coalesce(bool_or(acl.grantee = 0 and acl.privilege_type = 'EXECUTE'), false)
      from pg_proc as procedure
      cross join lateral aclexplode(
        coalesce(procedure.proacl, acldefault('f', procedure.proowner))
      ) as acl
     where procedure.oid = 'public.get_active_practitioner_taxonomy_term(text,text)'::regprocedure
  ),
  false,
  'active taxonomy RPC does not grant execute to PUBLIC'
);

select results_eq(
  $$select type, name, slug
      from public.get_active_practitioner_taxonomy_term(
        'support_area',
        'schema-test-active-empty-area'
      )$$,
  $$values ('support_area'::text, 'Schema Test Active Empty Area'::text, 'schema-test-active-empty-area'::text)$$,
  'active unlinked taxonomy terms are available to discovery pages'
);

select is_empty(
  $$select id
      from public.get_active_practitioner_taxonomy_term(
        'location',
        'schema-test-inactive-location'
      )$$,
  'inactive taxonomy terms are not exposed'
);

select is_empty(
  $$select id
      from public.get_active_practitioner_taxonomy_term(
        'approach',
        'schema-test-active-empty-area'
      )$$,
  'taxonomy RPC rejects unsupported term types'
);

select is(
  (
    select bool_and(
      has_function_privilege(
        role_name,
        'public.list_active_practitioner_taxonomy_terms()',
        'EXECUTE'
      )
    )
      from (values ('anon'), ('authenticated'), ('service_role')) as allowed_roles(role_name)
  ),
  true,
  'active taxonomy list RPC is executable by public API roles'
);

select is(
  (
    select coalesce(bool_or(acl.grantee = 0 and acl.privilege_type = 'EXECUTE'), false)
      from pg_proc as procedure
      cross join lateral aclexplode(
        coalesce(procedure.proacl, acldefault('f', procedure.proowner))
      ) as acl
     where procedure.oid = 'public.list_active_practitioner_taxonomy_terms()'::regprocedure
  ),
  false,
  'active taxonomy list RPC does not grant execute to PUBLIC'
);

select is(
  (
    select count(*)::integer
      from public.list_active_practitioner_taxonomy_terms()
     where slug = 'schema-test-active-empty-area'
  ),
  1,
  'active unlinked terms appear in the public taxonomy list'
);

select is(
  (
    select count(*)::integer
      from public.list_active_practitioner_taxonomy_terms()
     where slug = 'schema-test-inactive-location'
  ),
  0,
  'inactive terms do not appear in the public taxonomy list'
);

select is(
  (
    select bool_and(
      has_function_privilege(
        role_name,
        'public.search_published_practitioner_ids(text,text[],text[],text[],text[],text[],text[])',
        'EXECUTE'
      )
    )
      from (values ('anon'), ('authenticated'), ('service_role')) as allowed_roles(role_name)
  ),
  true,
  'search RPC is executable only by public API roles'
);

select is(
  (
    select coalesce(bool_or(acl.grantee = 0 and acl.privilege_type = 'EXECUTE'), false)
      from pg_proc as procedure
      cross join lateral aclexplode(
        coalesce(procedure.proacl, acldefault('f', procedure.proowner))
      ) as acl
     where procedure.oid = 'public.search_published_practitioner_ids(text,text[],text[],text[],text[],text[],text[])'::regprocedure
  ),
  false,
  'search RPC does not grant execute to PUBLIC'
);

select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[]
      )
     order by practitioner_id$$,
  $$values
    ('00000000-0000-0000-0000-000000009001'::uuid),
    ('00000000-0000-0000-0000-000000009010'::uuid)$$,
  'search returns published practitioner ids and excludes drafts'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        'schema test published',
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009001'::uuid)$$,
  'search matches practitioner names'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        'anxiety support',
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009010'::uuid)$$,
  'search matches published profile text'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        'coaching',
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009001'::uuid)$$,
  'search matches linked term names'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        array['trauma-and-nervous-system']::text[],
        '{}'::text[],
        '{}'::text[],
        array['bali']::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009001'::uuid)$$,
  'search combines support area and location filters'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        array['in-person']::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009001'::uuid)$$,
  'format filters match in-person practitioners'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        array['online']::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009010'::uuid)$$,
  'format filters match online practitioners'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        array['schema-test-inactive-location']::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$select null::uuid where false$$,
  'inactive taxonomy terms do not match'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        array['not-a-real-term']::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$select null::uuid where false$$,
  'invalid taxonomy slugs do not match'
);
select results_eq(
  $$select practitioner_id
      from public.search_published_practitioner_ids(
        null,
        array['trauma-and-nervous-system', 'anxiety-and-emotional-wellbeing']::text[],
        '{}'::text[],
        '{}'::text[],
        array['international']::text[],
        '{}'::text[],
        '{}'::text[]
      )$$,
  $$values ('00000000-0000-0000-0000-000000009010'::uuid)$$,
  'taxonomy groups use OR within a group and AND between groups'
);
select is(
  (select count(*)::integer from public.practitioners),
  2,
  'public reads return only published practitioners'
);
select is(
  (select count(*)::integer
     from public.practitioners
    where slug in ('schema-test-archived', 'schema-test-incomplete')),
  0,
  'public reads hide draft and archived practitioners'
);
select is(
  (select count(*)::integer
     from public.practitioner_terms
    where type = 'location' and slug = 'bali'),
  1,
  'public reads return active terms linked to published profiles'
);
select is(
  (select count(*)::integer
     from public.practitioner_terms
    where type = 'language' and slug = 'schema-test-draft-only'),
  0,
  'public reads hide terms linked only to unpublished profiles'
);
select is(
  (select count(*)::integer from public.practitioner_term_links),
  8,
  'public reads return links for published profiles only'
);
select is(
  (select count(*)::integer
     from public.practitioner_term_links as l
     join public.practitioner_terms as t on t.id = l.term_id
    where t.slug = 'schema-test-inactive-location'),
  0,
  'public reads hide links to inactive terms'
);
select throws_ok(
  $$select public.assert_published_practitioner_has_location('00000000-0000-0000-0000-000000009001')$$,
  '42501',
  null,
  'anon cannot execute the location helper'
);
set local role authenticated;
select throws_ok(
  $$select public.assert_published_practitioner_has_location('00000000-0000-0000-0000-000000009001')$$,
  '42501',
  null,
  'authenticated cannot execute the location helper'
);

select * from finish();
rollback;
