-- Portrait objects must be removed and the practitioner path cleared before
-- an archived practitioner row can be permanently deleted.
create or replace function public.prevent_featured_practitioner_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status is distinct from 'archived'
     or old.featured_position is not null
     or old.image_path is not null then
    raise exception using
      errcode = '23514',
      message = 'Only archived and unfeatured practitioners without portraits can be permanently deleted';
  end if;

  return old;
end;
$$;

revoke all on function public.prevent_featured_practitioner_delete()
  from public, anon, authenticated;
grant execute on function public.prevent_featured_practitioner_delete()
  to service_role;
