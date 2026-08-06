alter table public.practitioner_expressions_of_interest
  add column submission_token uuid not null default gen_random_uuid();

create unique index practitioner_eoi_submission_token_idx
  on public.practitioner_expressions_of_interest (submission_token);

comment on column public.practitioner_expressions_of_interest.submission_token is
  'Browser-generated idempotency key used to prevent duplicate practitioner submissions.';
