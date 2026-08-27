-- The directory is separate from practitioner applications. Applications stay
-- in public.practitioner_expressions_of_interest and are never public records.

create table public.practitioners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  descriptor text,
  years_active integer,
  summary text,
  about text,
  credentials text[],
  significant_training text[],
  offers_in_person boolean not null default true,
  offers_online boolean not null default true,
  website_url text,
  instagram_url text,
  image_path text,
  image_alt text,
  image_focal_x numeric(5, 2) not null default 50,
  image_focal_y numeric(5, 2) not null default 50,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practitioners_slug_check
    check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint practitioners_name_check
    check (length(btrim(name)) between 1 and 200),
  constraint practitioners_descriptor_check
    check (descriptor is null or length(btrim(descriptor)) between 1 and 400),
  constraint practitioners_years_active_check
    check (years_active is null or years_active > 0),
  constraint practitioners_summary_check
    check (summary is null or length(btrim(summary)) between 1 and 1000),
  constraint practitioners_about_check
    check (about is null or length(btrim(about)) between 1 and 10000),
  constraint practitioners_credentials_check
    check (credentials is null or cardinality(credentials) <= 100),
  constraint practitioners_significant_training_check
    check (significant_training is null or cardinality(significant_training) <= 100),
  constraint practitioners_website_url_check
    check (
      website_url is null
      or (
        length(btrim(website_url)) between 12 and 2048
        and website_url = btrim(website_url)
        and lower(website_url) like 'https://%'
      )
    ),
  constraint practitioners_instagram_url_check
    check (
      instagram_url is null
      or (
        length(btrim(instagram_url)) between 12 and 2048
        and instagram_url = btrim(instagram_url)
        and lower(instagram_url) like 'https://%'
      )
    ),
  constraint practitioners_image_path_check
    check (
      image_path is null
      or (
        length(btrim(image_path)) between 1 and 500
        and image_path = btrim(image_path)
        and image_path ~ '^[a-z0-9][a-z0-9._/-]*$'
      )
    ),
  constraint practitioners_image_alt_check
    check (image_alt is null or length(btrim(image_alt)) between 1 and 500),
  constraint practitioners_image_focal_x_check
    check (image_focal_x between 0 and 100),
  constraint practitioners_image_focal_y_check
    check (image_focal_y between 0 and 100),
  constraint practitioners_status_check
    check (status in ('draft', 'published', 'archived'))
);

create table public.practitioner_terms (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  constraint practitioner_terms_type_check
    check (type in ('support_area', 'approach', 'modality', 'works_with', 'location', 'language')),
  constraint practitioner_terms_name_check
    check (length(btrim(name)) between 1 and 200),
  constraint practitioner_terms_slug_check
    check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint practitioner_terms_sort_order_check
    check (sort_order >= 0),
  constraint practitioner_terms_type_slug_key unique (type, slug)
);

create table public.practitioner_term_links (
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  term_id uuid not null references public.practitioner_terms(id) on delete cascade,
  display_order integer not null default 0,
  primary key (practitioner_id, term_id),
  constraint practitioner_term_links_display_order_check
    check (display_order >= 0)
);

create index practitioners_status_slug_idx
  on public.practitioners (status, slug);

create index practitioners_updated_at_idx
  on public.practitioners (updated_at desc);

create index practitioner_terms_type_active_order_idx
  on public.practitioner_terms (type, is_active, sort_order, name);

create index practitioner_term_links_practitioner_order_idx
  on public.practitioner_term_links (practitioner_id, display_order, term_id);

create index practitioner_term_links_term_id_idx
  on public.practitioner_term_links (term_id, practitioner_id);

create or replace function public.set_practitioner_updated_at()
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

create trigger practitioners_set_updated_at
before update on public.practitioners
for each row
execute function public.set_practitioner_updated_at();

create or replace function public.assert_published_practitioner_has_location(p_practitioner_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  practitioner_status text;
begin
  select p.status
    into practitioner_status
    from public.practitioners as p
   where p.id = p_practitioner_id;

  if practitioner_status = 'published'
     and not exists (
       select 1
         from public.practitioner_term_links as l
         join public.practitioner_terms as t on t.id = l.term_id
        where l.practitioner_id = p_practitioner_id
          and t.type = 'location'
     ) then
    raise exception using
      errcode = '23514',
      message = 'A published practitioner must have at least one location';
  end if;
end;
$$;

create or replace function public.validate_practitioner_publication()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'published' then
    if new.summary is null or btrim(new.summary) = '' then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have a summary';
    end if;

    if new.about is null or btrim(new.about) = '' then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have an about description';
    end if;

    if new.image_path is null or btrim(new.image_path) = '' then
      raise exception using
        errcode = '23514',
        message = 'A published practitioner must have an image path';
    end if;

    if tg_op = 'UPDATE' then
      new.published_at := coalesce(old.published_at, new.published_at, pg_catalog.now());
    else
      new.published_at := coalesce(new.published_at, pg_catalog.now());
    end if;

    if tg_op = 'INSERT' then
      if not exists (
        select 1
          from public.practitioner_term_links as l
          join public.practitioner_terms as t on t.id = l.term_id
         where l.practitioner_id = new.id
           and t.type = 'location'
      ) then
        raise exception using
          errcode = '23514',
          message = 'A published practitioner must have at least one location';
      end if;
    else
      if not exists (
        select 1
          from public.practitioner_term_links as l
          join public.practitioner_terms as t on t.id = l.term_id
         where l.practitioner_id = new.id
           and t.type = 'location'
      ) then
        raise exception using
          errcode = '23514',
          message = 'A published practitioner must have at least one location';
      end if;
    end if;
  else
    new.published_at := null;
  end if;

  return new;
end;
$$;

create trigger practitioners_validate_publication
before insert or update on public.practitioners
for each row
execute function public.validate_practitioner_publication();

create or replace function public.validate_practitioner_location_links()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.assert_published_practitioner_has_location(new.practitioner_id);
  end if;

  if tg_op in ('DELETE', 'UPDATE') then
    perform public.assert_published_practitioner_has_location(old.practitioner_id);
  end if;

  return null;
end;
$$;

create trigger practitioner_term_links_validate_location
after insert or update or delete on public.practitioner_term_links
for each row
execute function public.validate_practitioner_location_links();

create or replace function public.validate_practitioner_term_type_changes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_practitioner record;
begin
  if old.type = 'location' or new.type = 'location' then
    for linked_practitioner in
      select distinct l.practitioner_id
        from public.practitioner_term_links as l
       where l.term_id = new.id
    loop
      perform public.assert_published_practitioner_has_location(linked_practitioner.practitioner_id);
    end loop;
  end if;

  return null;
end;
$$;

create trigger practitioner_terms_validate_type_changes
after update of type on public.practitioner_terms
for each row
execute function public.validate_practitioner_term_type_changes();

alter table public.practitioners enable row level security;
alter table public.practitioner_terms enable row level security;
alter table public.practitioner_term_links enable row level security;

revoke all on table public.practitioners from public, anon, authenticated;
revoke all on table public.practitioner_terms from public, anon, authenticated;
revoke all on table public.practitioner_term_links from public, anon, authenticated;

grant select on table public.practitioners to anon, authenticated;
grant select on table public.practitioner_terms to anon, authenticated;
grant select on table public.practitioner_term_links to anon, authenticated;
grant all on table public.practitioners to service_role;
grant all on table public.practitioner_terms to service_role;
grant all on table public.practitioner_term_links to service_role;

create policy practitioners_public_read
on public.practitioners
for select
to anon, authenticated
using (status = 'published');

create policy practitioner_terms_public_read
on public.practitioner_terms
for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
      from public.practitioner_term_links as l
      join public.practitioners as p on p.id = l.practitioner_id
     where l.term_id = practitioner_terms.id
       and p.status = 'published'
  )
);

create policy practitioner_term_links_public_read
on public.practitioner_term_links
for select
to anon, authenticated
using (
  exists (
    select 1
      from public.practitioners as p
     where p.id = practitioner_term_links.practitioner_id
       and p.status = 'published'
  )
);

create policy practitioners_service_role_all
on public.practitioners
for all
to service_role
using (true)
with check (true);

create policy practitioner_terms_service_role_all
on public.practitioner_terms
for all
to service_role
using (true)
with check (true);

create policy practitioner_term_links_service_role_all
on public.practitioner_term_links
for all
to service_role
using (true)
with check (true);

-- A public bucket makes approved portraits usable by the public site. Writes
-- remain restricted to the server-side service role and approved image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy profile_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'profile-images');

create policy profile_images_service_role_manage
on storage.objects
for all
to service_role
using (bucket_id = 'profile-images')
with check (
  bucket_id = 'profile-images'
  and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
);

comment on table public.practitioners is
  'Directory profiles. Draft and archived records are server-only; public reads require published status.';

comment on table public.practitioner_terms is
  'Controlled practitioner directory terms for support areas, approaches, modalities, audiences, locations, and languages.';

comment on table public.practitioner_term_links is
  'Ordered links between practitioner directory profiles and controlled terms.';

comment on column public.practitioners.image_path is
  'Path in the public profile-images Supabase Storage bucket; populated only with an approved portrait.';
