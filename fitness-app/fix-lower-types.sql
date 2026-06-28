-- ============================================================
-- Allow lower1 / lower2 workout types
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop old constraint (default name: {table}_{column}_check)
alter table exercises drop constraint if exists exercises_workout_type_check;
alter table exercises add constraint exercises_workout_type_check
  check (workout_type in ('push', 'pull', 'lower', 'upper', 'lower1', 'lower2'));

alter table workout_templates drop constraint if exists workout_templates_type_check;
alter table workout_templates add constraint workout_templates_type_check
  check (type in ('push', 'pull', 'lower', 'upper', 'lower1', 'lower2'));
