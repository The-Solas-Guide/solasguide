begin;

select no_plan();

set local role postgres;
insert into auth.users (id, instance_id, aud, role, email)
values (
  '00000000-0000-0000-0000-00000000c501',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'draft-workflow-admin@example.com'
);
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-00000000c501');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000c501', 'role', 'authenticated')::text,
  true
);

select lives_ok(
  $$select public.save_admin_practitioner(
    p_slug => 'new-draft',
    p_name => 'New Draft',
    p_status => 'published'
  )$$,
  'creation RPC accepts a published request as a draft save'
);
select is(
  (select status from public.practitioners where slug = 'new-draft'),
  'draft',
  'creation RPC always creates a draft'
);
select throws_ok(
  $$insert into public.practitioners (slug, name, status) values ('direct-published', 'Direct Published', 'published')$$,
  '23514', null,
  'direct published inserts are rejected'
);
select throws_ok(
  $$select public.save_admin_practitioner(p_practitioner_id => (select id from public.practitioners where slug = 'new-draft'), p_slug => 'new-draft', p_name => 'New Draft', p_status => 'published')$$,
  '23514', 'Publish a saved draft with the publish action',
  'save RPC cannot publish an existing draft'
);
select throws_ok(
  $$select public.publish_admin_practitioner((select id from public.practitioners where slug = 'new-draft'))$$,
  '23514', 'A published practitioner must have a summary',
  'publish RPC validates saved draft completeness'
);

select is(
  public.save_admin_practitioner(
    p_practitioner_id => (select id from public.practitioners where slug = 'new-draft'),
    p_slug => 'new-draft', p_name => 'New Draft',
    p_summary => 'A complete summary', p_about => 'A complete description',
    p_image_path => (select id::text || '/portrait.jpg' from public.practitioners where slug = 'new-draft'),
    p_portrait_approval_confirmed => true,
    p_term_ids => array[(select id from public.practitioner_terms where type = 'location' and is_active limit 1)]
  ),
  (select id from public.practitioners where slug = 'new-draft'),
  'administrator can save a complete draft with recorded portrait approval'
);
select throws_ok(
  $$select public.publish_admin_practitioner((select id from public.practitioners where slug = 'new-draft'))$$,
  '23514', 'A published practitioner must have a stored portrait object',
  'publication requires a real portrait object'
);

set local role postgres;
insert into storage.objects (bucket_id, name, owner, metadata)
select 'profile-images', id::text || '/portrait.jpg', '00000000-0000-0000-0000-00000000c501', '{"mimetype":"image/jpeg"}'::jsonb
  from public.practitioners
 where slug = 'new-draft';
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000c501', 'role', 'authenticated')::text,
  true
);
select lives_ok(
  $$select public.publish_admin_practitioner((select id from public.practitioners where slug = 'new-draft'))$$,
  'publish RPC publishes a complete saved draft with a stored approved portrait'
);
select is(
  (select status from public.practitioners where slug = 'new-draft'),
  'published',
  'publish RPC persists published status'
);
update public.practitioners
   set featured_position = 1
 where slug = 'new-draft';
set local role postgres;
insert into storage.objects (bucket_id, name, owner, metadata)
select 'profile-images', id::text || '/replacement.jpg', '00000000-0000-0000-0000-00000000c501', '{"mimetype":"image/jpeg"}'::jsonb
  from public.practitioners
 where slug = 'new-draft';
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000c501', 'role', 'authenticated')::text,
  true
);
select lives_ok(
  $$select public.save_admin_practitioner(
    p_practitioner_id => (select id from public.practitioners where slug = 'new-draft'),
    p_slug => 'new-draft', p_name => 'New Draft',
    p_summary => 'A complete summary', p_about => 'A complete description',
    p_image_path => (select id::text || '/replacement.jpg' from public.practitioners where slug = 'new-draft'),
    p_status => 'published', p_featured_position => 1::smallint,
    p_portrait_approval_confirmed => true,
    p_term_ids => array[(select id from public.practitioner_terms where type = 'location' and is_active limit 1)]
  )$$,
  'a confirmed replacement keeps a published featured practitioner public'
);
select is(
  (select status = 'published' and featured_position = 1 and portrait_approved_at is not null
          and image_path = id::text || '/replacement.jpg'
     from public.practitioners where slug = 'new-draft'),
  true,
  'replacement records fresh approval without changing public status'
);
select throws_ok(
  $$update public.practitioners set portrait_approval_required = false where slug = 'new-draft'$$,
  '23514', 'Portrait approval cannot be removed',
  'new portrait approval cannot be cleared through a direct update'
);
select throws_ok(
  $$insert into public.practitioners (id, slug, name, portrait_approval_required)
      values ('00000000-0000-0000-0000-00000000c502', 'approval-bypass', 'Approval Bypass', false)$$,
  '23514', 'Portrait approval exemptions are reserved for historical published portraits',
  'new practitioners cannot claim a legacy approval exemption'
);
set local role postgres;
insert into storage.objects (bucket_id, name, owner, metadata)
select 'profile-images', id::text || '/direct-change.jpg', '00000000-0000-0000-0000-00000000c501', '{"mimetype":"image/jpeg"}'::jsonb
  from public.practitioners
 where slug = 'new-draft';
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-00000000c501', 'role', 'authenticated')::text,
  true
);
select throws_ok(
  $$update public.practitioners
       set image_path = id::text || '/direct-change.jpg'
     where slug = 'new-draft'$$,
  '23514', 'A newly uploaded portrait must have recorded approval before publication',
  'a later direct path change does not inherit RPC portrait approval'
);
select throws_ok(
  $$update public.practitioners set featured_position = null where slug = 'new-draft'; update public.practitioners set status = 'archived' where slug = 'new-draft'; update public.practitioners set status = 'published' where slug = 'new-draft'$$,
  '23514', 'Restore an archived practitioner to draft before publishing',
  'archived practitioners cannot return directly to published'
);

select * from finish();
rollback;
