alter table public.practitioner_expressions_of_interest
  add column submission_token uuid not null default gen_random_uuid();

alter table public.practitioner_expressions_of_interest
  drop constraint practitioner_eoi_location_check,
  add constraint practitioner_eoi_location_check
    check (location is null or length(location) between 1 and 300);

create unique index practitioner_eoi_submission_token_idx
  on public.practitioner_expressions_of_interest (submission_token);

comment on column public.practitioner_expressions_of_interest.submission_token is
  'Browser-generated idempotency key used to prevent duplicate practitioner submissions.';
