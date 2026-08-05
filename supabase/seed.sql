-- Synthetic local-only records. These values are deterministic and contain no
-- personal or production data.

insert into public.customer_enquiries (
  id,
  full_name,
  email,
  contact_preference,
  consent_confirmed,
  consent_given_at,
  questionnaire_answers,
  source,
  status,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Local Test Buyer',
  'buyer@example.test',
  'email',
  true,
  '2026-01-01T00:00:00Z',
  '{"intent":"practitioner","brief":"Synthetic local enquiry","modalities":["meditation"],"timing":"planning","location":"undecided","group":"solo","budget":"unsure"}'::jsonb,
  'website',
  'new',
  '2026-01-01T00:00:00Z',
  '2026-01-01T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.practitioner_expressions_of_interest (
  id,
  full_name,
  email,
  contact_preference,
  practice_name,
  location,
  website_url,
  consent_confirmed,
  consent_given_at,
  questionnaire_answers,
  source,
  status,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000002',
  'Local Test Practitioner',
  'practitioner@example.test',
  'email',
  'Example Practice',
  'Example location',
  'https://example.test/practice',
  true,
  '2026-01-01T00:00:00Z',
  '{"modalities":["meditation"],"experience":"Synthetic local application","scope":"Example scope"}'::jsonb,
  'website',
  'new',
  '2026-01-01T00:00:00Z',
  '2026-01-01T00:00:00Z'
)
on conflict (id) do nothing;
