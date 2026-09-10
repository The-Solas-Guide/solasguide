-- Delivery is opt-in for newly submitted website records. Existing records stay
-- disabled so recovery never replays historical pending notifications.
alter table public.customer_enquiries
  add column delivery_enabled boolean not null default false;

alter table public.practitioner_expressions_of_interest
  add column delivery_enabled boolean not null default false,
  add column customer_confirmation_status text not null default 'pending',
  add column internal_notification_status text not null default 'pending',
  add constraint practitioner_eoi_confirmation_status_check
    check (customer_confirmation_status in ('pending', 'sending', 'sent', 'failed')),
  add constraint practitioner_eoi_notification_status_check
    check (internal_notification_status in ('pending', 'sending', 'sent', 'failed'));

create or replace function public.claim_customer_enquiry_delivery(p_enquiry_id uuid)
returns table (send_customer boolean, send_internal boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_enquiry public.customer_enquiries%rowtype;
begin
  select * into current_enquiry
  from public.customer_enquiries
  where id = p_enquiry_id
  for update;

  send_customer := false;
  send_internal := false;
  if not found or not current_enquiry.delivery_enabled or current_enquiry.source <> 'website' then
    return next;
    return;
  end if;

  send_customer := current_enquiry.customer_confirmation_status = 'pending'
    or (current_enquiry.customer_confirmation_status = 'failed' and current_enquiry.updated_at < pg_catalog.now() - interval '1 minute')
    or (current_enquiry.customer_confirmation_status = 'sending' and current_enquiry.updated_at < pg_catalog.now() - interval '10 minutes');
  send_internal := current_enquiry.internal_notification_status = 'pending'
    or (current_enquiry.internal_notification_status = 'failed' and current_enquiry.updated_at < pg_catalog.now() - interval '1 minute')
    or (current_enquiry.internal_notification_status = 'sending' and current_enquiry.updated_at < pg_catalog.now() - interval '10 minutes');

  update public.customer_enquiries
  set customer_confirmation_status = case when send_customer then 'sending' else customer_confirmation_status end,
      internal_notification_status = case when send_internal then 'sending' else internal_notification_status end
  where id = p_enquiry_id;

  return next;
end;
$$;

create or replace function public.claim_practitioner_expression_delivery(p_expression_id uuid)
returns table (send_customer boolean, send_internal boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_expression public.practitioner_expressions_of_interest%rowtype;
begin
  select * into current_expression
  from public.practitioner_expressions_of_interest
  where id = p_expression_id
  for update;

  send_customer := false;
  send_internal := false;
  if not found or not current_expression.delivery_enabled or current_expression.source <> 'website' then
    return next;
    return;
  end if;

  send_customer := current_expression.customer_confirmation_status = 'pending'
    or (current_expression.customer_confirmation_status = 'failed' and current_expression.updated_at < pg_catalog.now() - interval '1 minute')
    or (current_expression.customer_confirmation_status = 'sending' and current_expression.updated_at < pg_catalog.now() - interval '10 minutes');
  send_internal := current_expression.internal_notification_status = 'pending'
    or (current_expression.internal_notification_status = 'failed' and current_expression.updated_at < pg_catalog.now() - interval '1 minute')
    or (current_expression.internal_notification_status = 'sending' and current_expression.updated_at < pg_catalog.now() - interval '10 minutes');

  update public.practitioner_expressions_of_interest
  set customer_confirmation_status = case when send_customer then 'sending' else customer_confirmation_status end,
      internal_notification_status = case when send_internal then 'sending' else internal_notification_status end
  where id = p_expression_id;

  return next;
end;
$$;

revoke all on function public.claim_practitioner_expression_delivery(uuid) from public, anon, authenticated;
grant execute on function public.claim_practitioner_expression_delivery(uuid) to service_role;

comment on column public.customer_enquiries.delivery_enabled is
  'Set only for new website submissions that request transactional delivery.';
comment on column public.practitioner_expressions_of_interest.delivery_enabled is
  'Set only for new website submissions that request transactional delivery.';
