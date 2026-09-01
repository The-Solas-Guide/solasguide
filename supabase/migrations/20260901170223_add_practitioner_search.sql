-- Public directory search stays inside PostgreSQL so the browser never needs
-- to load unpublished profiles or calculate taxonomy matches client-side.
create or replace function public.search_published_practitioner_ids(
  p_query text default null,
  p_area_slugs text[] default '{}'::text[],
  p_approach_slugs text[] default '{}'::text[],
  p_works_with_slugs text[] default '{}'::text[],
  p_location_slugs text[] default '{}'::text[],
  p_format_values text[] default '{}'::text[],
  p_language_slugs text[] default '{}'::text[]
)
returns table (practitioner_id uuid)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id
    from public.practitioners as p
   where p.status = 'published'
     and (
       p_query is null
       or pg_catalog.btrim(p_query) = ''
       or position(
            pg_catalog.lower(pg_catalog.btrim(p_query))
            in lower(
              pg_catalog.concat_ws(
                ' ',
                p.name,
                p.descriptor,
                p.summary,
                p.about,
                pg_catalog.array_to_string(coalesce(p.credentials, '{}'::text[]), ' '),
                pg_catalog.array_to_string(coalesce(p.significant_training, '{}'::text[]), ' ')
              )
            )
          ) > 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.is_active
            and position(
                  pg_catalog.lower(pg_catalog.btrim(p_query))
                  in lower(t.name)
                ) > 0
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_area_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'support_area'
            and t.is_active
            and t.slug = any(coalesce(p_area_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_approach_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'approach'
            and t.is_active
            and t.slug = any(coalesce(p_approach_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_works_with_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'works_with'
            and t.is_active
            and t.slug = any(coalesce(p_works_with_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_location_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'location'
            and t.is_active
            and t.slug = any(coalesce(p_location_slugs, '{}'::text[]))
       )
     )
     and (
       coalesce(pg_catalog.cardinality(p_format_values), 0) = 0
       or ('in-person' = any(coalesce(p_format_values, '{}'::text[])) and p.offers_in_person)
       or ('online' = any(coalesce(p_format_values, '{}'::text[])) and p.offers_online)
     )
     and (
       coalesce(pg_catalog.cardinality(p_language_slugs), 0) = 0
       or exists (
         select 1
           from public.practitioner_term_links as l
           join public.practitioner_terms as t on t.id = l.term_id
          where l.practitioner_id = p.id
            and t.type = 'language'
            and t.is_active
            and t.slug = any(coalesce(p_language_slugs, '{}'::text[]))
       )
     )
   order by p.name, p.id;
$$;

revoke all on function public.search_published_practitioner_ids(
  text, text[], text[], text[], text[], text[], text[]
) from public, anon, authenticated;

grant execute on function public.search_published_practitioner_ids(
  text, text[], text[], text[], text[], text[], text[]
) to anon, authenticated, service_role;

comment on function public.search_published_practitioner_ids(
  text, text[], text[], text[], text[], text[], text[]
) is
  'Return published practitioner ids matching public search and taxonomy filters.';
