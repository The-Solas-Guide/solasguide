begin;
select plan(9);

set local role service_role;

insert into public.customer_enquiries (
  id, submission_token, full_name, email, contact_preference, consent_confirmed,
  source, delivery_enabled
) values
  ('00000000-0000-4000-8000-00000000e101', '00000000-0000-4000-8000-00000000e111', 'Manual customer', 'manual@example.test', 'email', true, 'admin', false),
  ('00000000-0000-4000-8000-00000000e102', '00000000-0000-4000-8000-00000000e112', 'Historical customer', 'historical@example.test', 'email', true, 'website', false),
  ('00000000-0000-4000-8000-00000000e103', '00000000-0000-4000-8000-00000000e113', 'New customer', 'new@example.test', 'email', true, 'website', true);

insert into public.practitioner_expressions_of_interest (
  id, submission_token, full_name, email, contact_preference, consent_confirmed,
  source, delivery_enabled
) values
  ('00000000-0000-4000-8000-00000000e104', '00000000-0000-4000-8000-00000000e114', 'Manual practitioner', 'manual-practitioner@example.test', 'email', true, 'admin', false),
  ('00000000-0000-4000-8000-00000000e105', '00000000-0000-4000-8000-00000000e115', 'Historical practitioner', 'historical-practitioner@example.test', 'email', true, 'website', false),
  ('00000000-0000-4000-8000-00000000e106', '00000000-0000-4000-8000-00000000e116', 'New practitioner', 'new-practitioner@example.test', 'email', true, 'website', true);

select is((select send_customer::text || ':' || send_internal::text from public.claim_customer_enquiry_delivery('00000000-0000-4000-8000-00000000e101')), 'false:false', 'manual customer delivery is disabled');
select is((select send_customer::text || ':' || send_internal::text from public.claim_customer_enquiry_delivery('00000000-0000-4000-8000-00000000e102')), 'false:false', 'historical customer delivery is disabled');
select is((select send_customer::text || ':' || send_internal::text from public.claim_customer_enquiry_delivery('00000000-0000-4000-8000-00000000e103')), 'true:true', 'new customer delivery claims both messages');
select is((select send_customer::text || ':' || send_internal::text from public.claim_customer_enquiry_delivery('00000000-0000-4000-8000-00000000e103')), 'false:false', 'second customer claim cannot duplicate messages');
select is((select send_customer::text || ':' || send_internal::text from public.claim_practitioner_expression_delivery('00000000-0000-4000-8000-00000000e104')), 'false:false', 'manual practitioner delivery is disabled');
select is((select send_customer::text || ':' || send_internal::text from public.claim_practitioner_expression_delivery('00000000-0000-4000-8000-00000000e105')), 'false:false', 'historical practitioner delivery is disabled');
select is((select send_customer::text || ':' || send_internal::text from public.claim_practitioner_expression_delivery('00000000-0000-4000-8000-00000000e106')), 'true:true', 'new practitioner delivery claims both messages');
select is((select send_customer::text || ':' || send_internal::text from public.claim_practitioner_expression_delivery('00000000-0000-4000-8000-00000000e106')), 'false:false', 'second practitioner claim cannot duplicate messages');
select is((select internal_notification_status from public.practitioner_expressions_of_interest where id = '00000000-0000-4000-8000-00000000e106'), 'sending', 'practitioner claim persists internal sending state');

select * from finish();
rollback;
