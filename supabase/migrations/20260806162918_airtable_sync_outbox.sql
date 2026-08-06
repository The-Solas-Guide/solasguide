-- Airtable is an operational CRM projection. Supabase remains authoritative for
-- submissions, so database triggers only enqueue an outbox event and never
-- synchronously call Airtable.

create type public.airtable_sync_source as enum (
  'customer_enquiry',
  'practitioner_expression'
);

create type public.airtable_sync_operation as enum ('upsert', 'delete');

create type public.airtable_sync_status as enum (
  'pending',
  'processing',
  'succeeded',
  'failed'
);

alter table public.customer_enquiries
  add column airtable_test_record boolean not null default false;

alter table public.practitioner_expressions_of_interest
  add column airtable_test_record boolean not null default false;

create table public.airtable_sync_events (
  id uuid primary key default gen_random_uuid(),
  source public.airtable_sync_source not null,
  source_id uuid not null,
  source_submission_id uuid not null,
  is_test_record boolean not null default false,
  operation public.airtable_sync_operation not null,
  status public.airtable_sync_status not null default 'pending',
  attempt_count integer not null default 0 check (attempt_count >= 0),
  workflow_run_id text,
  webhook_request_id bigint,
  last_error_code text,
  last_error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index airtable_sync_events_recovery_idx
  on public.airtable_sync_events (status, created_at);

create index airtable_sync_events_source_idx
  on public.airtable_sync_events (source, source_id, created_at);

create table public.airtable_sync_leases (
  source public.airtable_sync_source not null,
  source_id uuid not null,
  event_id uuid not null references public.airtable_sync_events (id) on delete cascade,
  lease_expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (source, source_id)
);

create or replace function public.set_airtable_sync_updated_at()
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

create trigger airtable_sync_events_set_updated_at
before update on public.airtable_sync_events
for each row
execute function public.set_airtable_sync_updated_at();

create trigger airtable_sync_leases_set_updated_at
before update on public.airtable_sync_leases
for each row
execute function public.set_airtable_sync_updated_at();

create or replace function public.enqueue_airtable_sync_event()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  event_source public.airtable_sync_source;
  event_operation public.airtable_sync_operation;
  event_source_id uuid;
  event_submission_id uuid;
  event_is_test_record boolean;
begin
  if tg_table_name = 'customer_enquiries' then
    event_source := 'customer_enquiry';
  elsif tg_table_name = 'practitioner_expressions_of_interest' then
    event_source := 'practitioner_expression';
  else
    raise exception 'Unsupported Airtable sync source table: %', tg_table_name;
  end if;

  if tg_op = 'DELETE' then
    event_operation := 'delete';
    event_source_id := old.id;
    event_submission_id := old.submission_token;
    event_is_test_record := old.airtable_test_record;
  else
    event_operation := 'upsert';
    event_source_id := new.id;
    event_submission_id := new.submission_token;
    event_is_test_record := new.airtable_test_record;
  end if;

  insert into public.airtable_sync_events (
    source,
    source_id,
    source_submission_id,
    is_test_record,
    operation
  ) values (
    event_source,
    event_source_id,
    event_submission_id,
    event_is_test_record,
    event_operation
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger customer_enquiries_enqueue_airtable_sync_insert
after insert on public.customer_enquiries
for each row
execute function public.enqueue_airtable_sync_event();

create trigger customer_enquiries_enqueue_airtable_sync_update
after update of
  full_name,
  email,
  phone,
  contact_preference,
  consent_confirmed,
  consent_given_at,
  questionnaire_answers,
  airtable_test_record,
  source
on public.customer_enquiries
for each row
when (old is distinct from new)
execute function public.enqueue_airtable_sync_event();

create trigger customer_enquiries_enqueue_airtable_sync_delete
after delete on public.customer_enquiries
for each row
execute function public.enqueue_airtable_sync_event();

create trigger practitioner_eoi_enqueue_airtable_sync_insert
after insert on public.practitioner_expressions_of_interest
for each row
execute function public.enqueue_airtable_sync_event();

create trigger practitioner_eoi_enqueue_airtable_sync_update
after update of
  full_name,
  email,
  phone,
  contact_preference,
  practice_name,
  location,
  website_url,
  consent_confirmed,
  consent_given_at,
  questionnaire_answers,
  airtable_test_record,
  source
on public.practitioner_expressions_of_interest
for each row
when (old is distinct from new)
execute function public.enqueue_airtable_sync_event();

create trigger practitioner_eoi_enqueue_airtable_sync_delete
after delete on public.practitioner_expressions_of_interest
for each row
execute function public.enqueue_airtable_sync_event();

-- The URL and shared secret live in Supabase Vault. Missing configuration must
-- not block a public submission; the retained pending event can be replayed
-- once deployment secrets are configured.
create or replace function public.dispatch_airtable_sync_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_url text;
  webhook_secret text;
  request_id bigint;
begin
  select decrypted_secret into webhook_url
  from vault.decrypted_secrets
  where name = 'airtable_sync_webhook_url';

  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'airtable_sync_webhook_secret';

  if webhook_url is null or webhook_secret is null then
    raise warning 'Airtable sync webhook is not configured for event %', new.id;
    return new;
  end if;

  select net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-solas-airtable-sync-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'airtable_sync_events',
      'schema', 'public',
      'record', jsonb_build_object('id', new.id)
    ),
    timeout_milliseconds := 1000
  ) into request_id;

  update public.airtable_sync_events
  set webhook_request_id = request_id
  where id = new.id;

  return new;
end;
$$;

create trigger airtable_sync_events_dispatch_webhook
after insert on public.airtable_sync_events
for each row
execute function public.dispatch_airtable_sync_event();

create or replace function public.claim_airtable_sync_event(p_event_id uuid)
returns table (
  claimed boolean,
  current_status public.airtable_sync_status,
  source public.airtable_sync_source,
  source_id uuid,
  source_submission_id uuid,
  is_test_record boolean,
  operation public.airtable_sync_operation
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sync_event public.airtable_sync_events%rowtype;
  lease_event_id uuid;
begin
  select * into sync_event
  from public.airtable_sync_events
  where id = p_event_id
  for update;

  if not found or sync_event.status = 'succeeded' then
    return query select false, sync_event.status, null::public.airtable_sync_source, null::uuid, null::uuid, null::boolean, null::public.airtable_sync_operation;
    return;
  end if;

  if sync_event.status = 'processing'
     and sync_event.started_at > pg_catalog.now() - interval '15 minutes' then
    return query select false, sync_event.status, null::public.airtable_sync_source, null::uuid, null::uuid, null::boolean, null::public.airtable_sync_operation;
    return;
  end if;

  insert into public.airtable_sync_leases as leases (
    source,
    source_id,
    event_id,
    lease_expires_at
  ) values (
    sync_event.source,
    sync_event.source_id,
    sync_event.id,
    pg_catalog.now() + interval '15 minutes'
  )
  on conflict (source, source_id) do update
  set event_id = excluded.event_id,
      lease_expires_at = excluded.lease_expires_at
  where leases.lease_expires_at <= pg_catalog.now()
     or leases.event_id = excluded.event_id
  returning event_id into lease_event_id;

  if lease_event_id is distinct from sync_event.id then
    return query select false, 'pending'::public.airtable_sync_status, null::public.airtable_sync_source, null::uuid, null::uuid, null::boolean, null::public.airtable_sync_operation;
    return;
  end if;

  update public.airtable_sync_events
  set status = 'processing',
      attempt_count = attempt_count + 1,
      started_at = pg_catalog.now(),
      completed_at = null,
      last_error_code = null,
      last_error = null
  where id = sync_event.id;

  return query select true, 'processing'::public.airtable_sync_status, sync_event.source, sync_event.source_id, sync_event.source_submission_id, sync_event.is_test_record, sync_event.operation;
end;
$$;

create or replace function public.complete_airtable_sync_event(
  p_event_id uuid,
  p_status public.airtable_sync_status,
  p_error_code text default null,
  p_error text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sync_event public.airtable_sync_events%rowtype;
begin
  if p_status not in ('succeeded', 'failed') then
    raise exception 'Invalid terminal Airtable sync status: %', p_status;
  end if;

  select * into sync_event
  from public.airtable_sync_events
  where id = p_event_id
  for update;

  if not found then
    return;
  end if;

  if sync_event.status = 'succeeded' then
    return;
  end if;

  update public.airtable_sync_events
  set status = p_status,
      completed_at = pg_catalog.now(),
      last_error_code = p_error_code,
      last_error = left(p_error, 500)
  where id = p_event_id;

  delete from public.airtable_sync_leases
  where source = sync_event.source
    and source_id = sync_event.source_id
    and event_id = p_event_id;
end;
$$;

create or replace function public.reset_airtable_sync_event(p_event_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sync_event public.airtable_sync_events%rowtype;
begin
  select * into sync_event
  from public.airtable_sync_events
  where id = p_event_id
  for update;

  if not found or sync_event.status = 'succeeded' then
    return false;
  end if;

  update public.airtable_sync_events
  set status = 'pending',
      started_at = null,
      completed_at = null,
      last_error_code = null,
      last_error = null,
      workflow_run_id = null
  where id = p_event_id;

  delete from public.airtable_sync_leases
  where source = sync_event.source
    and source_id = sync_event.source_id
    and lease_expires_at <= pg_catalog.now();

  return true;
end;
$$;

alter table public.airtable_sync_events enable row level security;
alter table public.airtable_sync_leases enable row level security;

revoke all on table public.airtable_sync_events from public, anon, authenticated;
revoke all on table public.airtable_sync_leases from public, anon, authenticated;
grant all on table public.airtable_sync_events to service_role;
grant all on table public.airtable_sync_leases to service_role;

revoke all on function public.enqueue_airtable_sync_event() from public, anon, authenticated;
revoke all on function public.dispatch_airtable_sync_event() from public, anon, authenticated;
revoke all on function public.claim_airtable_sync_event(uuid) from public, anon, authenticated;
revoke all on function public.complete_airtable_sync_event(uuid, public.airtable_sync_status, text, text) from public, anon, authenticated;
revoke all on function public.reset_airtable_sync_event(uuid) from public, anon, authenticated;
grant execute on function public.claim_airtable_sync_event(uuid) to service_role;
grant execute on function public.complete_airtable_sync_event(uuid, public.airtable_sync_status, text, text) to service_role;
grant execute on function public.reset_airtable_sync_event(uuid) to service_role;

comment on table public.airtable_sync_events is
  'Private durable outbox for one-way Supabase-to-Airtable CRM projection.';
comment on table public.airtable_sync_leases is
  'Private per-source leases preventing concurrent Airtable create/update work.';
