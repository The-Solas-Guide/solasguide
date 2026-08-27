begin;

select plan(36);

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

insert into public.practitioner_term_links (practitioner_id, term_id, display_order)
select '00000000-0000-0000-0000-000000009001', id, 1
  from public.practitioner_terms
 where type = 'location' and slug = 'schema-test-inactive-location';

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
  (select count(*)::integer from public.practitioners),
  1,
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
    where type = 'language' and slug = 'english'),
  0,
  'public reads hide terms linked only to unpublished profiles'
);
select is(
  (select count(*)::integer from public.practitioner_term_links),
  1,
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
