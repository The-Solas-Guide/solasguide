begin;

select no_plan();

-- Schema additions and lifecycle constraints.
select has_column('public', 'practitioners', 'archived_at', 'practitioners have archived_at');
select has_column('public', 'practitioners', 'featured_position', 'practitioners have featured_position');
select has_column('public', 'practitioner_terms', 'archived_at', 'terms have archived_at');
select has_column('public', 'practitioner_terms', 'created_at', 'terms have created_at');
select has_column('public', 'practitioner_terms', 'updated_at', 'terms have updated_at');
select has_column('public', 'customer_enquiries', 'archived_at', 'customer enquiries have archived_at');
select has_column('public', 'practitioner_expressions_of_interest', 'archived_at', 'practitioner interest has archived_at');

-- Blocker regressions: source values must use the database enum.
select has_type('public', 'submission_source', 'submission source enum exists');
select is(
  (select udt_name
     from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customer_enquiries'
      and column_name = 'source'),
  'submission_source',
  'customer enquiry source uses the enum'
);
select is(
  (select udt_name
     from information_schema.columns
    where table_schema = 'public'
      and table_name = 'practitioner_expressions_of_interest'
      and column_name = 'source'),
  'submission_source',
  'practitioner interest source uses the enum'
);

select ok(
  exists (
    select 1
      from pg_constraint
     where conrelid = 'public.practitioners'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%featured_position%'
       and pg_get_constraintdef(oid) ilike '%1%'
       and pg_get_constraintdef(oid) ilike '%8%'
  ),
  'featured positions are constrained to one through eight'
);
select ok(
  exists (
    select 1
      from pg_indexes
     where schemaname = 'public'
       and tablename = 'practitioners'
       and indexdef ilike '%unique%featured_position%'
  ),
  'featured positions are unique when present'
);
select ok(
  exists (
    select 1
      from pg_constraint
     where conrelid = 'public.practitioners'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%featured_position%'
       and pg_get_constraintdef(oid) ilike '%published%'
  ),
  'featured practitioners must be published'
);
select ok(
  exists (
    select 1
      from pg_indexes
     where schemaname = 'public'
       and tablename = 'practitioners'
       and indexname = 'practitioners_image_path_idx'
       and indexdef ilike '%unique%'
  ),
  'practitioner image paths are unique when present'
);

-- The policy catalog must distinguish the administrator allowlist from public reads.
select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'practitioners'
       and policyname = 'practitioners_admin_manage'
       and qual ilike '%admin_private.is_admin%'
       and with_check ilike '%admin_private.is_admin%'
  ),
  'administrators can manage practitioners through an allowlist policy'
);
select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'practitioner_terms'
       and policyname = 'practitioner_terms_admin_manage'
       and qual ilike '%admin_private.is_admin%'
       and with_check ilike '%admin_private.is_admin%'
  ),
  'administrators can manage taxonomy through an allowlist policy'
);
select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'practitioner_term_links'
       and policyname = 'practitioner_term_links_admin_manage'
       and qual ilike '%admin_private.is_admin%'
       and with_check ilike '%admin_private.is_admin%'
  ),
  'administrators can manage term links through an allowlist policy'
);

select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'storage'
       and tablename = 'objects'
       and policyname = 'profile_images_admin_select'
       and cmd = 'SELECT'
       and qual ilike '%admin_private.is_admin%'
  ),
  'administrators can select profile images through an allowlist policy'
);
select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'storage'
       and tablename = 'objects'
       and policyname = 'profile_images_admin_insert'
       and cmd = 'INSERT'
       and with_check ilike '%admin_private.is_admin%'
  ),
  'administrators can insert profile images through an allowlist policy'
);
select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'storage'
       and tablename = 'objects'
       and policyname = 'profile_images_admin_update'
       and cmd = 'UPDATE'
       and qual ilike '%admin_private.is_admin%'
       and with_check ilike '%admin_private.is_admin%'
  ),
  'administrators can update profile images through an allowlist policy'
);
select ok(
  exists (
    select 1 from pg_policies
     where schemaname = 'storage'
       and tablename = 'objects'
       and policyname = 'profile_images_admin_delete'
       and cmd = 'DELETE'
       and qual ilike '%admin_private.is_admin%'
  ),
  'administrators can delete profile images through an allowlist policy'
);
select is(
  (select count(*)::integer
     from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_images_public_read'
      and 'anon' = any(roles)),
  0,
  'anonymous users cannot list profile image objects'
);

-- Seed deterministic fixtures while running as the migration owner.
insert into auth.users (id, instance_id, aud, role, email)
values
  (
    '00000000-0000-0000-0000-00000000b001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'foundation-admin@example.com'
  ),
  (
    '00000000-0000-0000-0000-00000000b002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'foundation-user@example.com'
  );
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-00000000b001');

insert into public.practitioners (
  id, slug, name, summary, about, image_path, status
)
values (
  '00000000-0000-0000-0000-00000000b101',
  'foundation-practitioner',
  'Foundation Practitioner',
  'A complete foundation profile.',
  'A complete foundation profile with all required copy.',
  '00000000-0000-0000-0000-00000000b101/foundation-practitioner.jpg',
  'draft'
);
insert into public.practitioner_term_links (practitioner_id, term_id)
select '00000000-0000-0000-0000-00000000b101', id
  from public.practitioner_terms
 where type = 'location' and slug = 'bali';

insert into public.practitioners (
  id, slug, name, summary, about, image_path, status
)
values (
  '00000000-0000-0000-0000-00000000b102',
  'foundation-second-practitioner',
  'Foundation Second Practitioner',
  'A second complete foundation profile.',
  'A second complete foundation profile with all required copy.',
  '00000000-0000-0000-0000-00000000b102/foundation-second-practitioner.jpg',
  'draft'
);
insert into public.practitioner_term_links (practitioner_id, term_id)
select '00000000-0000-0000-0000-00000000b102', id
  from public.practitioner_terms
 where type = 'location' and slug = 'bali';

insert into public.customer_enquiries (
  id, full_name, email, consent_confirmed, questionnaire_answers, source, status
)
values (
  '00000000-0000-0000-0000-00000000b201',
  'Foundation Customer',
  'foundation-customer@example.com',
  true,
  '{}'::jsonb,
  'website',
  'contacted'
);
insert into public.practitioner_expressions_of_interest (
  id, full_name, email, consent_confirmed, questionnaire_answers, source, status
)
values (
  '00000000-0000-0000-0000-00000000b202',
  'Foundation Practitioner Applicant',
  'foundation-applicant@example.com',
  true,
  '{}'::jsonb,
  'website',
  'reviewing'
);

-- Anonymous access remains limited to published directory records and public URLs.
set local role anon;
select is(
  (select count(*)::integer from public.practitioners
    where id = '00000000-0000-0000-0000-00000000b101'),
  0,
  'anonymous users cannot read a draft practitioner'
);
select throws_ok(
  $$select count(*) from public.customer_enquiries$$,
  '42501',
  null,
  'anonymous users cannot read customer enquiries'
);
select throws_ok(
  $$select count(*) from public.practitioner_expressions_of_interest$$,
  '42501',
  null,
  'anonymous users cannot read practitioner interest'
);
select throws_ok(
  $$insert into public.practitioners (slug, name) values ('foundation-anon', 'Anonymous')$$,
  '42501',
  null,
  'anonymous users cannot insert practitioners'
);

-- A non-admin authenticated user cannot access the CMS.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b002', true);
select is(
  (select count(*)::integer from public.practitioners),
  0,
  'non-admin users see only published directory records'
);
select is(
  (select count(*)::integer from public.customer_enquiries),
  0,
  'non-admin users cannot read private enquiries'
);
update public.customer_enquiries
   set status = 'closed'
 where id = '00000000-0000-0000-0000-00000000b201';
select is(
  (select count(*)::integer from public.customer_enquiries
    where id = '00000000-0000-0000-0000-00000000b201'),
  0,
  'non-admin users cannot update submissions'
);
select throws_ok(
  $$insert into public.practitioners (slug, name) values ('foundation-user', 'Non-admin')$$,
  '42501',
  null,
  'non-admin users cannot insert practitioners'
);
select throws_ok(
  $$insert into public.customer_enquiries (
       full_name, email, consent_confirmed, questionnaire_answers, source
     ) values (
       'Non-admin Enquiry', 'non-admin-enquiry@example.com', true, '{}'::jsonb, 'admin'
     )$$,
  '42501',
  null,
  'non-admin users cannot insert customer enquiries'
);
select throws_ok(
  $$insert into public.practitioner_expressions_of_interest (
       full_name, email, consent_confirmed, questionnaire_answers, source
     ) values (
       'Non-admin Applicant', 'non-admin-applicant@example.com', true, '{}'::jsonb, 'admin'
     )$$,
  '42501',
  null,
  'non-admin users cannot insert practitioner interest'
);

-- An administrator can manage directory records and links.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b001', true);
select is(
  (select count(*)::integer from public.practitioners
    where id = '00000000-0000-0000-0000-00000000b101'),
  1,
  'administrator can read draft practitioners'
);
select lives_ok(
  $$insert into public.practitioner_terms (type, name, slug)
    values ('approach', 'Foundation Approach', 'foundation-approach')$$,
  'administrator can create taxonomy terms'
);
select lives_ok(
  $$update public.practitioners
       set descriptor = 'Edited by an administrator'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'administrator can edit practitioners'
);
select lives_ok(
  $$insert into public.practitioner_term_links (practitioner_id, term_id)
    select '00000000-0000-0000-0000-00000000b101', id
      from public.practitioner_terms
     where slug = 'foundation-approach'$$,
  'administrator can create term links'
);

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-0000-0000-00000000b001',
    'role', 'authenticated',
    'exp', floor(extract(epoch from now()))::bigint - 60
  )::text,
  true
);
select is(
  admin_private.is_admin(),
  false,
  'expired administrator sessions are denied'
);
select is(
  (select count(*)::integer from public.practitioners),
  0,
  'expired administrator sessions cannot read CMS records'
);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-0000-0000-00000000b001',
    'role', 'authenticated',
    'exp', floor(extract(epoch from now()))::bigint + 3600
  )::text,
  true
);

-- Practitioner lifecycle and featured ordering.
select lives_ok(
  $$update public.practitioners set status = 'published'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'administrator can publish a complete practitioner'
);
select is(
  (select status from public.practitioners where id = '00000000-0000-0000-0000-00000000b101'),
  'published',
  'publishing sets published status'
);
select is(
  (select published_at is not null and archived_at is null
     from public.practitioners where id = '00000000-0000-0000-0000-00000000b101'),
  true,
  'publishing sets published_at and clears archive state'
);
select lives_ok(
  $$update public.practitioners set summary = 'An updated live summary'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'published field edits remain live'
);
select is(
  (select status from public.practitioners where id = '00000000-0000-0000-0000-00000000b101'),
  'published',
  'published field edits preserve status'
);
select lives_ok(
  $$update public.practitioners set status = 'draft'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'unpublishing returns a practitioner to draft'
);
select is(
  (select published_at is null and archived_at is null
     from public.practitioners where id = '00000000-0000-0000-0000-00000000b101'),
  true,
  'draft practitioners have no publish or archive timestamp'
);
select lives_ok(
  $$update public.practitioners set status = 'archived'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'archiving sets the archive timestamp'
);
select is(
  (select status = 'archived' and published_at is null and archived_at is not null
     from public.practitioners where id = '00000000-0000-0000-0000-00000000b101'),
  true,
  'archived practitioners have archive state and no publish timestamp'
);
select lives_ok(
  $$update public.practitioners set status = 'draft'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'restoring a practitioner returns it to draft'
);
select throws_ok(
  $$update public.practitioners set featured_position = 9
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  '23514',
  null,
  'featured positions above eight fail'
);
select throws_ok(
  $$update public.practitioners set featured_position = 1
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  '23514',
  null,
  'draft practitioners cannot be featured'
);
select lives_ok(
  $$update public.practitioners set status = 'published'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'administrator can republish a restored practitioner'
);
select lives_ok(
  $$update public.practitioners set featured_position = 1
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'administrator can feature a published practitioner'
);
select throws_ok(
  $$update public.practitioners set status = 'draft'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  '23514',
  null,
  'featured practitioners cannot be unpublished'
);
select throws_ok(
  $$update public.practitioners set status = 'archived'
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  '23514',
  null,
  'featured practitioners cannot be archived'
);
select throws_ok(
  $$delete from public.practitioners
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  '23514',
  null,
  'featured practitioners cannot be deleted'
);

select lives_ok(
  $$insert into public.practitioners (
       id, slug, name, summary, about, image_path, status
     ) values (
       '00000000-0000-0000-0000-00000000b103',
       'foundation-draft-delete',
       'Foundation Draft Delete',
       'A draft used for deletion checks.',
       'A draft used for deletion checks.',
       '00000000-0000-0000-0000-00000000b103/draft-delete.jpg',
       'draft'
     )$$,
  'administrator can create a draft practitioner for deletion checks'
);
select throws_ok(
  $$delete from public.practitioners
     where id = '00000000-0000-0000-0000-00000000b103'$$,
  '23514',
  null,
  'draft practitioners cannot be permanently deleted'
);
select lives_ok(
  $$update public.practitioners
       set status = 'archived'
     where id = '00000000-0000-0000-0000-00000000b103'$$,
  'administrator can archive the deletion-check practitioner'
);
select lives_ok(
  $$delete from public.practitioners
     where id = '00000000-0000-0000-0000-00000000b103'$$,
  'only archived and unfeatured practitioners can be deleted'
);
select throws_ok(
  $$insert into public.practitioners (
       id, slug, name, image_path, status
     ) values (
       '00000000-0000-0000-0000-00000000b104',
       'foundation-wrong-image-owner',
       'Foundation Wrong Image Owner',
       '00000000-0000-0000-0000-00000000b101/wrong-owner.jpg',
       'draft'
     )$$,
  '23514',
  null,
  'practitioner images must use the owning practitioner UUID folder'
);
select lives_ok(
  $$update public.practitioners set featured_position = null
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  'administrator can remove a featured position'
);
select lives_ok(
  $$update public.practitioners set status = 'published'
     where id = '00000000-0000-0000-0000-00000000b102'$$,
  'administrator can publish a second complete practitioner'
);
select lives_ok(
  $$update public.practitioners set featured_position = 1
     where id = '00000000-0000-0000-0000-00000000b102'$$,
  'a second published practitioner can use the open featured position'
);
select throws_ok(
  $$update public.practitioners set featured_position = 1
     where id = '00000000-0000-0000-0000-00000000b101'$$,
  '23505',
  null,
  'duplicate featured positions fail'
);

-- Taxonomy lifecycle and permanent deletion restrictions.
select lives_ok(
  $$update public.practitioner_terms
       set is_active = false
     where slug = 'foundation-approach'$$,
  'administrator can make a taxonomy term inactive'
);
select is(
  (select is_active and archived_at is null
     from public.practitioner_terms where slug = 'foundation-approach'),
  false,
  'inactive terms have no archive timestamp'
);
select lives_ok(
  $$update public.practitioner_terms
       set archived_at = now()
     where slug = 'foundation-approach'$$,
  'administrator can archive a taxonomy term'
);
select is(
  (select not is_active and archived_at is not null
     from public.practitioner_terms where slug = 'foundation-approach'),
  true,
  'archived terms are inactive and have an archive timestamp'
);
select lives_ok(
  $$update public.practitioner_terms
       set archived_at = null, is_active = true
     where slug = 'foundation-approach'$$,
  'administrator can restore a taxonomy term'
);
select is(
  (select not is_active and archived_at is null
     from public.practitioner_terms where slug = 'foundation-approach'),
  true,
  'restoring a term returns it to inactive'
);
select throws_ok(
  $$delete from public.practitioner_terms where slug = 'foundation-approach'$$,
  '23514',
  null,
  'active or inactive terms cannot be permanently deleted'
);
select lives_ok(
  $$insert into public.practitioner_terms (type, name, slug)
    values ('language', 'Foundation Unlinked', 'foundation-unlinked')$$,
  'administrator can create an unlinked term before deletion'
);
select lives_ok(
  $$update public.practitioner_terms set archived_at = now()
     where slug = 'foundation-unlinked'$$,
  'administrator can archive an unlinked term before deletion'
);
select lives_ok(
  $$delete from public.practitioner_terms where slug = 'foundation-unlinked'$$,
  'an archived unlinked term can be permanently deleted'
);
select lives_ok(
  $$update public.practitioner_terms set archived_at = now()
     where slug = 'foundation-approach'$$,
  'administrator can archive a linked term for deletion checks'
);
select throws_ok(
  $$delete from public.practitioner_terms where slug = 'foundation-approach'$$,
  '23503',
  null,
  'linked taxonomy terms cannot be permanently deleted'
);
select lives_ok(
  $$update public.practitioner_terms set archived_at = null, is_active = true
     where slug = 'foundation-approach'$$,
  'administrator can restore the linked taxonomy term'
);

-- Private submission access and column protections.
select ok(
  has_column_privilege('authenticated', 'public.customer_enquiries', 'full_name', 'INSERT')
    and has_column_privilege('authenticated', 'public.customer_enquiries', 'email', 'INSERT')
    and has_column_privilege('authenticated', 'public.customer_enquiries', 'consent_confirmed', 'INSERT')
    and has_column_privilege('authenticated', 'public.customer_enquiries', 'source', 'INSERT'),
  'administrators have exact customer enquiry insert column grants'
);
select ok(
  not has_column_privilege('authenticated', 'public.customer_enquiries', 'id', 'INSERT')
    and not has_column_privilege('authenticated', 'public.customer_enquiries', 'created_at', 'INSERT')
    and not has_column_privilege('authenticated', 'public.customer_enquiries', 'updated_at', 'INSERT')
    and not has_column_privilege('authenticated', 'public.customer_enquiries', 'internal_notification_sent_at', 'INSERT'),
  'administrators cannot insert protected customer enquiry columns'
);
select ok(
  has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'full_name', 'INSERT')
    and has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'email', 'INSERT')
    and has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'consent_confirmed', 'INSERT')
    and has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'source', 'INSERT'),
  'administrators have exact practitioner interest insert column grants'
);
select ok(
  not has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'id', 'INSERT')
    and not has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'created_at', 'INSERT')
    and not has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'updated_at', 'INSERT')
    and not has_column_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'internal_notification_sent_at', 'INSERT'),
  'administrators cannot insert protected practitioner interest columns'
);
select lives_ok(
  $$insert into public.customer_enquiries (
       full_name, email, consent_confirmed, questionnaire_answers, source, status
     ) values (
       'Administrator Enquiry',
       'administrator-enquiry@example.com',
       true,
       '{}'::jsonb,
       'admin',
       'new'
     )$$,
  'administrator can create a customer enquiry with the admin source'
);
select throws_ok(
  $$insert into public.customer_enquiries (
       full_name, email, consent_confirmed, questionnaire_answers, source, status
     ) values (
       'Invalid Administrator Enquiry',
       'invalid-administrator-enquiry@example.com',
       false,
       '{}'::jsonb,
       'admin',
       'new'
     )$$,
  '23514',
  null,
  'administrator-created enquiries still require consent'
);
select throws_ok(
  $$insert into public.customer_enquiries (
       full_name, email, phone, contact_preference, consent_confirmed,
       questionnaire_answers, source, status
     ) values (
       'Invalid Administrator Enquiry',
       'invalid-contact-enquiry@example.com',
       null,
       'phone',
       true,
       '{}'::jsonb,
       'admin',
       'new'
     )$$,
  '23514',
  null,
  'administrator-created enquiries still require contact details'
);
select lives_ok(
  $$insert into public.practitioner_expressions_of_interest (
       full_name, email, consent_confirmed, questionnaire_answers, source, status
     ) values (
       'Administrator Applicant',
       'administrator-applicant@example.com',
       true,
       '{}'::jsonb,
       'admin',
       'new'
     )$$,
  'administrator can create practitioner interest with the admin source'
);
select throws_ok(
  $$insert into public.practitioner_expressions_of_interest (
       full_name, email, consent_confirmed, questionnaire_answers, source, status
     ) values (
       'Invalid Administrator Applicant',
       'invalid-administrator-applicant@example.com',
       false,
       '{}'::jsonb,
       'admin',
       'new'
     )$$,
  '23514',
  null,
  'administrator-created practitioner interest still requires consent'
);
select throws_ok(
  $$insert into public.practitioner_expressions_of_interest (
       full_name, email, phone, contact_preference, consent_confirmed,
       questionnaire_answers, source, status
     ) values (
       'Invalid Administrator Applicant',
       'invalid-contact-applicant@example.com',
       null,
       'phone',
       true,
       '{}'::jsonb,
       'admin',
       'new'
     )$$,
  '23514',
  null,
  'administrator-created practitioner interest still requires contact details'
);
select is(
  (select count(*)::integer from public.customer_enquiries
    where id = '00000000-0000-0000-0000-00000000b201'),
  1,
  'administrator can read private customer enquiries'
);
select is(
  (select count(*)::integer from public.practitioner_expressions_of_interest
    where id = '00000000-0000-0000-0000-00000000b202'),
  1,
  'administrator can read private practitioner interest'
);
select is(
  (
    select bool_and(
      not has_function_privilege(role_name, function_signature, 'EXECUTE')
    )
      from (
        values
          ('anon', 'public.prevent_featured_practitioner_delete()'),
          ('authenticated', 'public.prevent_featured_practitioner_delete()'),
          ('anon', 'public.normalize_practitioner_term_lifecycle()'),
          ('authenticated', 'public.normalize_practitioner_term_lifecycle()'),
          ('anon', 'public.prevent_unqualified_practitioner_term_delete()'),
          ('authenticated', 'public.prevent_unqualified_practitioner_term_delete()'),
          ('anon', 'public.validate_practitioner_location_links()'),
          ('authenticated', 'public.validate_practitioner_location_links()'),
          ('anon', 'public.validate_practitioner_term_type_changes()'),
          ('authenticated', 'public.validate_practitioner_term_type_changes()')
      ) as trigger_functions(role_name, function_signature)
  ),
  true,
  'browser roles cannot execute new trigger functions'
);
select lives_ok(
  $$update public.customer_enquiries set archived_at = now()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  'administrator can archive a customer enquiry'
);
select is(
  (select status = 'contacted' and archived_at is not null
     from public.customer_enquiries where id = '00000000-0000-0000-0000-00000000b201'),
  true,
  'archiving preserves the customer enquiry workflow status'
);
select lives_ok(
  $$update public.customer_enquiries set status = 'closed', internal_notes = 'Reviewed'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  'administrator can update normal customer enquiry fields'
);
select throws_ok(
  $$update public.customer_enquiries set email = 'changed@example.com'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501',
  null,
  'administrator cannot update protected customer enquiry fields'
);
select throws_ok(
  $$update public.customer_enquiries set id = '00000000-0000-0000-0000-00000000b203'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry identity is protected'
);
select throws_ok(
  $$update public.customer_enquiries set full_name = 'Changed'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry name is protected'
);
select throws_ok(
  $$update public.customer_enquiries set phone = '+1 555 0100'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry contact data is protected'
);
select throws_ok(
  $$update public.customer_enquiries set submission_token = gen_random_uuid()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry token is protected'
);
select throws_ok(
  $$update public.customer_enquiries set consent_confirmed = false
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry consent is protected'
);
select throws_ok(
  $$update public.customer_enquiries set consent_given_at = now()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry consent timestamp is protected'
);
select throws_ok(
  $$update public.customer_enquiries set questionnaire_answers = '{"changed":true}'::jsonb
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry answers are protected'
);
select throws_ok(
  $$update public.customer_enquiries set source = 'website'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry source is protected'
);
select throws_ok(
  $$update public.customer_enquiries set customer_confirmation_sent_at = now()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer confirmation timestamp is protected'
);
select throws_ok(
  $$update public.customer_enquiries set internal_notification_sent_at = now()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'internal notification timestamp is protected'
);
select throws_ok(
  $$update public.customer_enquiries set customer_confirmation_status = 'sent'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer delivery status is protected'
);
select throws_ok(
  $$update public.customer_enquiries set internal_notification_status = 'sent'
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'internal delivery status is protected'
);
select throws_ok(
  $$update public.customer_enquiries set created_at = now()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry creation timestamp is protected'
);
select throws_ok(
  $$update public.customer_enquiries set updated_at = now()
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501', null, 'customer enquiry update timestamp is protected'
);
select lives_ok(
  $$update public.practitioner_expressions_of_interest set archived_at = now()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  'administrator can archive practitioner interest'
);
select is(
  (select status = 'reviewing' and archived_at is not null
     from public.practitioner_expressions_of_interest
    where id = '00000000-0000-0000-0000-00000000b202'),
  true,
  'archiving preserves practitioner interest workflow status'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set id = '00000000-0000-0000-0000-00000000b204'
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest identity is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set full_name = 'Changed'
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest name is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set email = 'changed@example.com'
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest email is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set phone = '+1 555 0101'
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest contact data is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set submission_token = gen_random_uuid()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest token is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set consent_confirmed = false
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest consent is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set consent_given_at = now()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest consent timestamp is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set questionnaire_answers = '{"changed":true}'::jsonb
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest answers are protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set source = 'website'
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest source is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set customer_confirmation_sent_at = now()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner confirmation timestamp is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set internal_notification_sent_at = now()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner notification timestamp is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set created_at = now()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest creation timestamp is protected'
);
select throws_ok(
  $$update public.practitioner_expressions_of_interest set updated_at = now()
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null, 'practitioner interest update timestamp is protected'
);
select throws_ok(
  $$delete from public.customer_enquiries
     where id = '00000000-0000-0000-0000-00000000b201'$$,
  '42501',
  null,
  'administrators cannot permanently delete customer enquiries'
);
select throws_ok(
  $$delete from public.practitioner_expressions_of_interest
     where id = '00000000-0000-0000-0000-00000000b202'$$,
  '42501', null,
  'administrators cannot permanently delete practitioner interest'
);

-- Storage policies permit only allowlisted administrators to mutate objects.
select is(
  (select count(*)::integer from storage.objects where bucket_id = 'profile-images'),
  0,
  'administrator storage fixture starts empty'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('profile-images', '00000000-0000-0000-0000-00000000b101/foundation.jpg', '00000000-0000-0000-0000-00000000b001',
            '{"mimetype":"image/jpeg"}'::jsonb)$$,
  'administrator can insert an allowed profile image object'
);
select lives_ok(
  $$update storage.objects set metadata = '{"mimetype":"image/png"}'::jsonb
     where bucket_id = 'profile-images'
       and name = '00000000-0000-0000-0000-00000000b101/foundation.jpg'$$,
  'administrator can update a profile image object'
);
select throws_ok(
  $$delete from storage.objects
     where bucket_id = 'profile-images'
       and name = '00000000-0000-0000-0000-00000000b101/foundation.jpg'$$,
  '42501',
  null,
  'profile image deletes must use the Storage API'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('profile-images', 'arbitrary/foundation.jpg', '00000000-0000-0000-0000-00000000b001',
            '{"mimetype":"image/jpeg"}'::jsonb)$$,
  '42501',
  null,
  'administrator cannot insert a profile image at an arbitrary path'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner, metadata)
    values ('profile-images', '00000000-0000-0000-0000-00000000b999/other.jpg', '00000000-0000-0000-0000-00000000b001',
            '{"mimetype":"image/jpeg"}'::jsonb)$$,
  '42501',
  null,
  'administrator cannot insert a profile image for an unknown practitioner'
);

select * from finish();
rollback;
