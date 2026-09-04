begin;

select no_plan();

select has_table('public', 'customer_enquiries', 'customer enquiries table exists');
select has_table('public', 'practitioner_expressions_of_interest', 'practitioner interest table exists');
select is(
  (select relrowsecurity from pg_class where oid = 'public.customer_enquiries'::regclass),
  true,
  'customer enquiries keep RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.practitioner_expressions_of_interest'::regclass),
  true,
  'practitioner interest keeps RLS enabled'
);
select ok(
  not has_table_privilege('authenticated', 'public.customer_enquiries', 'DELETE'),
  'authenticated users cannot directly delete customer enquiries'
);
select ok(
  not has_table_privilege('authenticated', 'public.practitioner_expressions_of_interest', 'DELETE'),
  'authenticated users cannot directly delete practitioner interest'
);
select ok(
  has_function_privilege('authenticated', 'public.remove_admin_customer_enquiry(uuid,text,boolean)', 'EXECUTE'),
  'authenticated users can request guarded enquiry privacy removal'
);
select ok(
  has_function_privilege('authenticated', 'public.remove_admin_practitioner_interest(uuid,text,boolean)', 'EXECUTE'),
  'authenticated users can request guarded interest privacy removal'
);
select ok(
  not has_function_privilege('anon', 'public.remove_admin_customer_enquiry(uuid,text,boolean)', 'EXECUTE'),
  'anonymous users cannot request enquiry privacy removal'
);
select ok(
  not has_function_privilege('anon', 'public.remove_admin_practitioner_interest(uuid,text,boolean)', 'EXECUTE'),
  'anonymous users cannot request interest privacy removal'
);
select is(
  (select prosecdef from pg_proc where oid = 'public.remove_admin_customer_enquiry(uuid,text,boolean)'::regprocedure),
  true,
  'enquiry privacy removal is a narrow security definer function'
);
select is(
  (select prosecdef from pg_proc where oid = 'public.remove_admin_practitioner_interest(uuid,text,boolean)'::regprocedure),
  true,
  'interest privacy removal is a narrow security definer function'
);
select ok(
  exists (
    select 1
      from pg_proc,
           unnest(coalesce(proconfig, array[]::text[])) as setting
     where oid = 'public.remove_admin_customer_enquiry(uuid,text,boolean)'::regprocedure
       and setting = 'search_path=""'
  ),
  'enquiry privacy removal uses an empty search path'
);
select ok(
  exists (
    select 1
      from pg_proc,
           unnest(coalesce(proconfig, array[]::text[])) as setting
     where oid = 'public.remove_admin_practitioner_interest(uuid,text,boolean)'::regprocedure
       and setting = 'search_path=""'
  ),
  'interest privacy removal uses an empty search path'
);
select ok(
  (select prosrc from pg_proc where oid = 'public.remove_admin_customer_enquiry(uuid,text,boolean)'::regprocedure) ~* 'for[[:space:]]+update',
  'enquiry privacy removal locks its target row'
);
select ok(
  (select prosrc from pg_proc where oid = 'public.remove_admin_practitioner_interest(uuid,text,boolean)'::regprocedure) ~* 'for[[:space:]]+update',
  'interest privacy removal locks its target row'
);

set local role postgres;
insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-4000-8000-00000000d001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'operational-admin@example.com'),
  ('00000000-0000-4000-8000-00000000d002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'operational-user@example.com');
insert into public.admin_users (user_id)
values ('00000000-0000-4000-8000-00000000d001');

insert into public.customer_enquiries (
  id, full_name, email, contact_preference, consent_confirmed, consent_given_at,
  questionnaire_answers, source, status
)
values (
  '00000000-0000-4000-8000-00000000d101', 'Operational Customer', 'customer@example.com', 'email', true,
  '2026-09-03T10:00:00Z', '{"context":"submitted"}', 'website', 'new'
);
insert into public.practitioner_expressions_of_interest (
  id, full_name, email, contact_preference, consent_confirmed, consent_given_at,
  questionnaire_answers, source, status
)
values (
  '00000000-0000-4000-8000-00000000d102', 'Operational Practitioner', 'practitioner@example.com', 'email', true,
  '2026-09-03T10:00:00Z', '{"context":"submitted"}', 'website', 'new'
);
insert into public.practitioner_expressions_of_interest (
  id, full_name, email, contact_preference, consent_confirmed, consent_given_at,
  questionnaire_answers, source, status
)
values (
  '00000000-0000-4000-8000-00000000d103', 'Operational Practitioner Active', 'active-practitioner@example.com', 'email', true,
  '2026-09-03T10:00:00Z', '{"context":"submitted"}', 'website', 'new'
);

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-00000000d002', 'role', 'authenticated')::text, true);
select is((select count(*)::integer from public.customer_enquiries), 0, 'non-admin users cannot read enquiries');
select is((select count(*)::integer from public.practitioner_expressions_of_interest), 0, 'non-admin users cannot read practitioner interest');
select throws_ok(
  $$select public.remove_admin_customer_enquiry('00000000-0000-4000-8000-00000000d101'::uuid, 'Operational Customer', true)$$,
  '42501', null,
  'non-admin users cannot request enquiry privacy removal'
);
select throws_ok(
  $$select public.remove_admin_practitioner_interest('00000000-0000-4000-8000-00000000d102'::uuid, 'Operational Practitioner', true)$$,
  '42501', null,
  'non-admin users cannot request interest privacy removal'
);
select throws_ok(
  $$delete from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'::uuid$$,
  '42501', null,
  'non-admin users cannot directly delete enquiries'
);

set local role postgres;
select is((select status from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'), 'new', 'non-admin deletion leaves enquiry unchanged');
select is((select full_name from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'), 'Operational Customer', 'protected enquiry fields remain unchanged');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-00000000d001', 'role', 'authenticated')::text, true);
select is((select count(*)::integer from public.customer_enquiries), 2, 'administrator can read private enquiries');
select lives_ok(
  $$update public.customer_enquiries set status = 'contacted', internal_notes = 'Called once' where id = '00000000-0000-4000-8000-00000000d101'::uuid$$,
  'administrator can update workflow and internal notes'
);
select is((select status from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'), 'contacted', 'workflow status persists');
select is((select internal_notes from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'), 'Called once', 'internal notes persist');
select throws_ok(
  $$update public.customer_enquiries set full_name = 'Changed' where id = '00000000-0000-4000-8000-00000000d101'::uuid$$,
  '42501', null,
  'administrator cannot update protected contact fields'
);
select throws_ok(
  $$insert into public.customer_enquiries (full_name, email, contact_preference, consent_confirmed, consent_given_at, source) values ('Wrong source', 'wrong@example.com', 'email', true, now(), 'website')$$,
  '42501', null,
  'administrator creation requires the admin source'
);
select lives_ok(
  $$insert into public.customer_enquiries (full_name, email, contact_preference, consent_confirmed, consent_given_at, questionnaire_answers, source, status, internal_notes) values ('Admin Created', 'created@example.com', 'email', true, '2026-09-04T10:00:00Z', '{"manual_context":"Created by admin"}', 'admin', 'closed', 'Initial note')$$,
  'administrator can create a valid enquiry with consent evidence'
);
select is((select count(*)::integer from public.customer_enquiries where source = 'admin'), 1, 'administrator creation stores the admin source');
select is((select questionnaire_answers->>'manual_context' from public.customer_enquiries where full_name = 'Admin Created'), 'Created by admin', 'administrator creation stores JSON answers');
set local role postgres;
select is(
  (select send_customer::text || ':' || send_internal::text
     from public.claim_customer_enquiry_delivery((select id from public.customer_enquiries where full_name = 'Admin Created'))),
  'false:false',
  'administrator-created enquiries never enter email delivery'
);
select is(
  (select customer_confirmation_status from public.customer_enquiries where full_name = 'Admin Created'),
  'pending',
  'administrator-created enquiry customer delivery stays pending without a claim'
);
select is(
  (select internal_notification_status from public.customer_enquiries where full_name = 'Admin Created'),
  'pending',
  'administrator-created enquiry internal delivery stays pending without a claim'
);
set local role authenticated;
select lives_ok(
  $$update public.customer_enquiries set archived_at = now() where id = '00000000-0000-4000-8000-00000000d101'::uuid$$,
  'administrator can archive an enquiry'
);
select is((select status from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'), 'contacted', 'archiving does not change workflow status');
select lives_ok(
  $$update public.customer_enquiries set archived_at = null where id = '00000000-0000-4000-8000-00000000d101'::uuid$$,
  'administrator can restore an enquiry'
);
select is((select status from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'), 'contacted', 'restoring does not change workflow status');
select lives_ok(
  $$update public.customer_enquiries set archived_at = now() where id = '00000000-0000-4000-8000-00000000d101'::uuid$$,
  'administrator can re-archive an enquiry before privacy removal'
);
select throws_ok(
  $$select public.remove_admin_customer_enquiry('00000000-0000-4000-8000-00000000d101'::uuid, 'Wrong', true)$$,
  '22023', null,
  'privacy removal requires exact typed confirmation'
);
select throws_ok(
  $$select public.remove_admin_customer_enquiry('00000000-0000-4000-8000-00000000d101'::uuid, 'Operational Customer', false)$$,
  '22023', null,
  'privacy removal requires CRM acknowledgement'
);
select lives_ok(
  $$select public.remove_admin_customer_enquiry('00000000-0000-4000-8000-00000000d101'::uuid, 'Operational Customer', true)$$,
  'administrator can remove an archived enquiry through the guarded function'
);
select is((select count(*)::integer from public.customer_enquiries where id = '00000000-0000-4000-8000-00000000d101'::uuid), 0, 'privacy removal deletes the enquiry');

select lives_ok(
  $$update public.practitioner_expressions_of_interest set archived_at = now() where id = '00000000-0000-4000-8000-00000000d102'::uuid$$,
  'administrator can archive practitioner interest'
);
select is((select status from public.practitioner_expressions_of_interest where id = '00000000-0000-4000-8000-00000000d102'), 'new', 'archiving practitioner interest does not change workflow status');
select lives_ok(
  $$update public.practitioner_expressions_of_interest set archived_at = null where id = '00000000-0000-4000-8000-00000000d102'::uuid$$,
  'administrator can restore practitioner interest'
);
select is((select status from public.practitioner_expressions_of_interest where id = '00000000-0000-4000-8000-00000000d102'), 'new', 'restoring practitioner interest does not change workflow status');
select lives_ok(
  $$update public.practitioner_expressions_of_interest set archived_at = now() where id = '00000000-0000-4000-8000-00000000d102'::uuid$$,
  'administrator can re-archive practitioner interest before privacy removal'
);
select throws_ok(
  $$select public.remove_admin_practitioner_interest('00000000-0000-4000-8000-00000000d102'::uuid, 'Wrong', true)$$,
  '22023', null,
  'interest privacy removal requires exact typed confirmation'
);
select throws_ok(
  $$select public.remove_admin_practitioner_interest('00000000-0000-4000-8000-00000000d102'::uuid, 'Operational Practitioner', false)$$,
  '22023', null,
  'interest privacy removal requires CRM acknowledgement'
);
select lives_ok(
  $$select public.remove_admin_practitioner_interest('00000000-0000-4000-8000-00000000d102'::uuid, 'Operational Practitioner', true)$$,
  'administrator can remove archived practitioner interest through the guarded function'
);
select is((select count(*)::integer from public.practitioner_expressions_of_interest where id = '00000000-0000-4000-8000-00000000d102'::uuid), 0, 'privacy removal deletes practitioner interest');

set local role postgres;
select throws_ok(
  $$delete from public.practitioner_expressions_of_interest where id = '00000000-0000-4000-8000-00000000d103'::uuid$$,
  '23514', null,
  'direct SQL cannot delete an active practitioner interest record'
);
select is((select count(*)::integer from public.practitioner_expressions_of_interest where id = '00000000-0000-4000-8000-00000000d103'::uuid), 1, 'active practitioner interest remains after blocked deletion');

select * from finish();
rollback;
