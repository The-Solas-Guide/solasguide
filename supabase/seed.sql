-- Synthetic local-only records. These values are deterministic and contain no
-- personal or production data.

insert into public.customer_enquiries (
  id,
  full_name,
  email,
  phone,
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
  '+1 416 555 0100',
  'whatsapp',
  true,
  '2026-01-01T00:00:00Z',
  '{"formVersion":3,"q1":"personal-wellbeing","q2":"just-for-me","q3":["stress","sleep"],"q4":"planning-ahead","q5":"Synthetic local enquiry"}'::jsonb,
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
