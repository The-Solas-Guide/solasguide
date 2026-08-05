alter table public.customer_enquiries
  add column submission_token uuid not null default gen_random_uuid(),
  add column customer_confirmation_status text not null default 'pending',
  add column internal_notification_status text not null default 'pending',
  add constraint customer_enquiries_confirmation_status_check
    check (customer_confirmation_status in ('pending', 'sending', 'sent', 'failed')),
  add constraint customer_enquiries_notification_status_check
    check (internal_notification_status in ('pending', 'sending', 'sent', 'failed'));

create unique index customer_enquiries_submission_token_idx
  on public.customer_enquiries (submission_token);

alter table public.customer_enquiries disable trigger customer_enquiries_set_updated_at;

update public.customer_enquiries
set customer_confirmation_status = case when customer_confirmation_sent_at is null then 'pending' else 'sent' end,
    internal_notification_status = case when internal_notification_sent_at is null then 'pending' else 'sent' end;

alter table public.customer_enquiries enable trigger customer_enquiries_set_updated_at;

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

  if not found then
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

revoke all on function public.claim_customer_enquiry_delivery(uuid) from public, anon, authenticated;
grant execute on function public.claim_customer_enquiry_delivery(uuid) to service_role;

comment on column public.customer_enquiries.customer_confirmation_status is
  'Durable MailerSend delivery state for the customer receipt.';
comment on column public.customer_enquiries.internal_notification_status is
  'Durable MailerSend delivery state for the internal operations notification.';
