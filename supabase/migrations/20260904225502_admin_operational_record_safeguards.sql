-- Operational submissions can be permanently removed only after they leave
-- active workflow views. The server action adds authorization, typed name
-- confirmation, and the manual CRM acknowledgement before calling the
-- guarded removal function.

-- Administrator-created rows are manual records. They must never enter the
-- public submission delivery workflow, even while their default delivery
-- states remain pending for schema compatibility.
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

  if current_enquiry.source = 'admin'::public.submission_source then
    send_customer := false;
    send_internal := false;
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

create or replace function public.prevent_unarchived_operational_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.archived_at is null then
    raise exception using
      errcode = '23514',
      message = 'Only archived operational records can be permanently removed';
  end if;

  return old;
end;
$$;

revoke all on function public.prevent_unarchived_operational_delete()
  from public, anon, authenticated;
grant execute on function public.prevent_unarchived_operational_delete()
  to service_role;

drop trigger if exists customer_enquiries_prevent_unarchived_delete
  on public.customer_enquiries;
create trigger customer_enquiries_prevent_unarchived_delete
before delete on public.customer_enquiries
for each row
execute function public.prevent_unarchived_operational_delete();

drop trigger if exists practitioner_eoi_prevent_unarchived_delete
  on public.practitioner_expressions_of_interest;
create trigger practitioner_eoi_prevent_unarchived_delete
before delete on public.practitioner_expressions_of_interest
for each row
execute function public.prevent_unarchived_operational_delete();

-- Keep permanent DELETE unavailable to browser roles. The privacy action uses
-- these narrow, authorization-gated functions, which also enforce the typed
-- confirmation and CRM acknowledgement at the database boundary.
create or replace function public.remove_admin_customer_enquiry(
  p_enquiry_id uuid,
  p_confirmation text,
  p_acknowledged boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.customer_enquiries%rowtype;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  select *
    into target
    from public.customer_enquiries
   where id = p_enquiry_id
   for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Customer enquiry not found';
  end if;
  if target.archived_at is null then
    raise exception using errcode = '23514', message = 'Only archived operational records can be permanently removed';
  end if;
  if p_confirmation is distinct from target.full_name then
    raise exception using errcode = '22023', message = 'Type the full name exactly to confirm privacy removal';
  end if;
  if p_acknowledged is not true then
    raise exception using errcode = '22023', message = 'CRM removal acknowledgement is required';
  end if;

  delete from public.customer_enquiries where id = target.id;
  return target.id;
end;
$$;

create or replace function public.remove_admin_practitioner_interest(
  p_interest_id uuid,
  p_confirmation text,
  p_acknowledged boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.practitioner_expressions_of_interest%rowtype;
begin
  if (select auth.uid()) is null or not (select admin_private.is_admin()) then
    raise exception using errcode = '42501', message = 'Administrator access is required';
  end if;

  select *
    into target
    from public.practitioner_expressions_of_interest
   where id = p_interest_id
   for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Practitioner interest record not found';
  end if;
  if target.archived_at is null then
    raise exception using errcode = '23514', message = 'Only archived operational records can be permanently removed';
  end if;
  if p_confirmation is distinct from target.full_name then
    raise exception using errcode = '22023', message = 'Type the full name exactly to confirm privacy removal';
  end if;
  if p_acknowledged is not true then
    raise exception using errcode = '22023', message = 'CRM removal acknowledgement is required';
  end if;

  delete from public.practitioner_expressions_of_interest where id = target.id;
  return target.id;
end;
$$;

revoke all on function public.remove_admin_customer_enquiry(uuid, text, boolean)
  from public, anon, authenticated;
grant execute on function public.remove_admin_customer_enquiry(uuid, text, boolean)
  to authenticated, service_role;

revoke all on function public.remove_admin_practitioner_interest(uuid, text, boolean)
  from public, anon, authenticated;
grant execute on function public.remove_admin_practitioner_interest(uuid, text, boolean)
  to authenticated, service_role;

comment on function public.prevent_unarchived_operational_delete() is
  'Prevents permanent removal of active private operational records.';

comment on function public.claim_customer_enquiry_delivery(uuid) is
  'Claims website enquiry delivery only; administrator-created records never send email.';
