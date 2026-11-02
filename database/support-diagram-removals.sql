-- Permanent suppression records; original questions and Storage objects remain untouched.
create table public.question_support_diagram_removals (
  question_id uuid primary key references public.questions(id) on delete cascade,
  removed_at timestamptz not null default now()
);
alter table public.question_support_diagram_removals enable row level security;
revoke all on public.question_support_diagram_removals from public, anon, authenticated;
grant select, insert on public.question_support_diagram_removals to authenticated;
create policy support_diagram_removals_read
on public.question_support_diagram_removals for select to authenticated using (true);
create policy support_diagram_removals_admin_insert
on public.question_support_diagram_removals for insert to authenticated
with check (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  and exists (
    select 1 from public.questions q
    where q.id = question_id and q.subject = 'Geometría' and q.week = 11
      and q.cycle = '2026-II' and q.modality = 'CPU-UNSM' and q.exam_id is null
      and q.original_number between 2 and 20
  )
);
comment on table public.question_support_diagram_removals is
'Permanent removal of automatic support diagrams only. No UPDATE or DELETE grants to clients.';
notify pgrst, 'reload schema';

