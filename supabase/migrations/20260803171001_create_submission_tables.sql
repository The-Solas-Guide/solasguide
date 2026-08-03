-- The MVP stores each public submission as one operational record. Detailed
-- questionnaire answers stay in JSONB so the form can evolve without adding
-- speculative tables or migrations for every question.

create table public.buyer_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  contact_preference text not null default 'email',
  consent_confirmed boolean not null,
  consent_given_at timestamptz not null default now(),
  questionnaire_answers jsonb not null default '{}'::jsonb,
  source text not null default 'website',
  status text not null default 'new',
  internal_notes text,
  customer_confirmation_sent_at timestamptz,
  internal_notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_enquiries_full_name_check
    check (length(btrim(full_name)) between 1 and 200),
  constraint buyer_enquiries_email_check
    check (length(email) between 3 and 320 and position('@' in email) > 1),
  constraint buyer_enquiries_phone_check
    check (phone is null or length(phone) between 1 and 50),
  constraint buyer_enquiries_contact_preference_check
    check (contact_preference in ('email', 'phone', 'whatsapp')),
  constraint buyer_enquiries_contact_details_check
    check (contact_preference = 'email' or phone is not null),
  constraint buyer_enquiries_consent_confirmed_check
    check (consent_confirmed),
  constraint buyer_enquiries_answers_object_check
    check (jsonb_typeof(questionnaire_answers) = 'object'),
  constraint buyer_enquiries_source_check
    check (source in ('website')),
  constraint buyer_enquiries_status_check
    check (status in ('new', 'contacted', 'closed'))
);

create table public.practitioner_expressions_of_interest (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  contact_preference text not null default 'email',
  practice_name text,
  location text,
  website_url text,
  consent_confirmed boolean not null,
  consent_given_at timestamptz not null default now(),
  questionnaire_answers jsonb not null default '{}'::jsonb,
  source text not null default 'website',
  status text not null default 'new',
  internal_notes text,
  customer_confirmation_sent_at timestamptz,
  internal_notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practitioner_eoi_full_name_check
    check (length(btrim(full_name)) between 1 and 200),
  constraint practitioner_eoi_email_check
    check (length(email) between 3 and 320 and position('@' in email) > 1),
  constraint practitioner_eoi_phone_check
    check (phone is null or length(phone) between 1 and 50),
  constraint practitioner_eoi_contact_preference_check
    check (contact_preference in ('email', 'phone', 'whatsapp')),
  constraint practitioner_eoi_contact_details_check
    check (contact_preference = 'email' or phone is not null),
  constraint practitioner_eoi_practice_name_check
    check (practice_name is null or length(practice_name) between 1 and 200),
  constraint practitioner_eoi_location_check
    check (location is null or length(location) between 1 and 200),
  constraint practitioner_eoi_website_url_check
    check (website_url is null or length(website_url) between 1 and 2048),
  constraint practitioner_eoi_consent_confirmed_check
    check (consent_confirmed),
  constraint practitioner_eoi_answers_object_check
    check (jsonb_typeof(questionnaire_answers) = 'object'),
  constraint practitioner_eoi_source_check
    check (source in ('website')),
  constraint practitioner_eoi_status_check
    check (status in ('new', 'reviewing', 'accepted', 'declined', 'closed'))
);

create index buyer_enquiries_status_created_at_idx
  on public.buyer_enquiries (status, created_at);

create index practitioner_eoi_status_created_at_idx
  on public.practitioner_expressions_of_interest (status, created_at);

create or replace function public.set_submission_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger buyer_enquiries_set_updated_at
before update on public.buyer_enquiries
for each row
execute function public.set_submission_updated_at();

create trigger practitioner_eoi_set_updated_at
before update on public.practitioner_expressions_of_interest
for each row
execute function public.set_submission_updated_at();

alter table public.buyer_enquiries enable row level security;
alter table public.practitioner_expressions_of_interest enable row level security;

-- Public clients may submit only form-owned columns. Internal fields, status,
-- source, identifiers, and timestamps are database-owned or service-role-only.
revoke all on table public.buyer_enquiries from public, anon, authenticated;
revoke all on table public.practitioner_expressions_of_interest from public, anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;
grant insert (
  full_name,
  email,
  phone,
  contact_preference,
  consent_confirmed,
  questionnaire_answers
) on table public.buyer_enquiries to anon, authenticated;
grant insert (
  full_name,
  email,
  phone,
  contact_preference,
  practice_name,
  location,
  website_url,
  consent_confirmed,
  questionnaire_answers
) on table public.practitioner_expressions_of_interest to anon, authenticated;

-- The server-side operational workflow uses the non-public service role. It
-- is never a browser credential and is intentionally the only API role with
-- access to internal notes and delivery fields.
grant all on table public.buyer_enquiries to service_role;
grant all on table public.practitioner_expressions_of_interest to service_role;

create policy "Anyone can submit buyer enquiries"
on public.buyer_enquiries
for insert
to anon, authenticated
with check (
  source = 'website'
  and status = 'new'
  and consent_confirmed
  and internal_notes is null
  and customer_confirmation_sent_at is null
  and internal_notification_sent_at is null
);

create policy "Anyone can submit practitioner expressions of interest"
on public.practitioner_expressions_of_interest
for insert
to anon, authenticated
with check (
  source = 'website'
  and status = 'new'
  and consent_confirmed
  and internal_notes is null
  and customer_confirmation_sent_at is null
  and internal_notification_sent_at is null
);

comment on table public.buyer_enquiries is
  'MVP buyer enquiries. Public roles can insert form columns only; operational fields are private.';
comment on table public.practitioner_expressions_of_interest is
  'MVP practitioner expressions of interest. Public roles can insert form columns only; operational fields are private.';
comment on column public.buyer_enquiries.internal_notes is
  'Private operator notes; never exposed to anon or authenticated roles.';
comment on column public.practitioner_expressions_of_interest.internal_notes is
  'Private operator notes; never exposed to anon or authenticated roles.';
