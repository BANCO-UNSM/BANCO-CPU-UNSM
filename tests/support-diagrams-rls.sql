begin;
create temp table diagram_test_context as
select (select id from public.profiles where role='admin' limit 1) as admin_id,
       (select id from public.profiles where role='student' limit 1) as student_id,
       (select id from public.questions where subject='Geometría' and week=11 and cycle='2026-II' and modality='CPU-UNSM' and exam_id is null and original_number=2 limit 1) as question_id;
create temp table diagram_before as
select 'questions' as item, md5(coalesce(jsonb_agg(to_jsonb(q) order by q.id)::text,'')) as digest from public.questions q
union all select 'answer_keys',md5(coalesce(jsonb_agg(to_jsonb(a) order by a.question_id)::text,'')) from public.answer_keys a
union all select 'storage_objects',md5(coalesce(jsonb_agg(to_jsonb(s) order by s.id)::text,'')) from storage.objects s;
grant select on diagram_test_context to authenticated;
select set_config('request.jwt.claims',json_build_object('sub',admin_id,'role','authenticated')::text,true) from diagram_test_context;
set local role authenticated;
insert into public.question_support_diagram_removals(question_id) select question_id from diagram_test_context;
do $$ begin
 if not exists(select 1 from public.question_support_diagram_removals where question_id=(select question_id from diagram_test_context)) then raise exception 'Admin insert/read failed'; end if;
 begin
  delete from public.question_support_diagram_removals where question_id=(select question_id from diagram_test_context);
  raise exception 'DELETE unexpectedly allowed';
 exception when insufficient_privilege then null; end;
 begin
  update public.question_support_diagram_removals set removed_at=now();
  raise exception 'UPDATE unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',student_id,'role','authenticated')::text,true) from diagram_test_context;
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.question_support_diagram_removals where question_id=(select question_id from diagram_test_context)) then raise exception 'Student cannot read suppression'; end if;
 begin
  insert into public.question_support_diagram_removals(question_id) select question_id from diagram_test_context;
  raise exception 'Student insert unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if exists(
  (select * from diagram_before) except
  (select 'questions', md5(coalesce(jsonb_agg(to_jsonb(q) order by q.id)::text,'')) from public.questions q
   union all select 'answer_keys',md5(coalesce(jsonb_agg(to_jsonb(a) order by a.question_id)::text,'')) from public.answer_keys a
   union all select 'storage_objects',md5(coalesce(jsonb_agg(to_jsonb(s) order by s.id)::text,'')) from storage.objects s)
 ) then raise exception 'Original content changed'; end if;
end $$;
select 'PASS: admin insert/read; student read/insert denial; UPDATE/DELETE denied; questions, keys and Storage unchanged. Test rolled back.' as test_result;
rollback;
