-- Discovery pages need to distinguish an active taxonomy term with no current
-- published links from a missing or inactive term. Keep the underlying table
-- policy narrow and expose only the four public term fields through this RPC.

create or replace function public.get_active_practitioner_taxonomy_term(
  p_type text,
  p_slug text
)
returns table (
  id uuid,
  type text,
  name text,
  slug text
)
language sql
stable
security definer
set search_path = ''
as $$
  select term.id, term.type, term.name, term.slug
    from public.practitioner_terms as term
   where p_type in ('support_area', 'location')
     and term.type = p_type
     and term.slug = p_slug
     and term.is_active
   limit 1;
$$;

revoke all on function public.get_active_practitioner_taxonomy_term(text, text)
  from public, anon, authenticated;
grant execute on function public.get_active_practitioner_taxonomy_term(text, text)
  to anon, authenticated, service_role;

comment on function public.get_active_practitioner_taxonomy_term(text, text) is
  'Return one active support-area or location term for a public discovery page.';
