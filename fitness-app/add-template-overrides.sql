-- ============================================================
-- Per-session exercise swap overrides
-- Run this in Supabase SQL Editor
-- ============================================================

create table template_exercise_overrides (
  id uuid primary key default uuid_generate_v4(),
  template_exercise_id uuid references template_exercises(id) on delete cascade unique,
  exercise_id uuid references exercises(id) on delete cascade,
  created_at timestamptz default now()
);

create index idx_template_exercise_overrides_te on template_exercise_overrides(template_exercise_id);

alter table template_exercise_overrides enable row level security;
create policy "allow all template_exercise_overrides"
  on template_exercise_overrides for all using (true) with check (true);
