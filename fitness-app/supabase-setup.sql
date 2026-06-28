-- ============================================================
-- Fitness App - Supabase Database Setup
-- Execute this entire script in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Exercises catalog
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  workout_type text not null check (workout_type in ('push', 'pull', 'lower', 'upper')),
  muscles_involved text[] not null,
  youtube_link text not null,
  instructions text,
  thumbnail_url text,
  created_at timestamptz default now()
);

-- Workout templates (Push, Pull, Lower 1, Lower 2, Upper)
create table workout_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  type text not null check (type in ('push', 'pull', 'lower', 'upper')),
  description text,
  created_at timestamptz default now()
);

-- Exercises assigned to templates with sets/reps
create table template_exercises (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references workout_templates(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  sets int not null default 3,
  reps_range text not null,
  sort_order int not null default 0,
  unique(template_id, exercise_id)
);

-- Weekly schedule: which template on which day (0=Sun, 6=Sat)
create table weekly_schedule (
  id uuid primary key default uuid_generate_v4(),
  day_of_week int not null check (day_of_week between 0 and 6),
  template_id uuid references workout_templates(id) on delete set null,
  is_rest_day boolean default false,
  unique(day_of_week)
);

-- Individual workout sessions (instances of templates)
create table workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references workout_templates(id) on delete set null,
  scheduled_date date not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'missed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Set entries within a session
create table set_entries (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references workout_sessions(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  set_number int not null,
  weight numeric,
  reps int,
  notes text,
  created_at timestamptz default now()
);

-- Daily weight logs
create table weight_logs (
  id uuid primary key default uuid_generate_v4(),
  logged_date date not null unique,
  weight numeric not null,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_template_exercises_template on template_exercises(template_id);
create index idx_weekly_schedule_day on weekly_schedule(day_of_week);
create index idx_workout_sessions_date on workout_sessions(scheduled_date);
create index idx_set_entries_session on set_entries(session_id);
create index idx_weight_logs_date on weight_logs(logged_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table exercises enable row level security;
alter table workout_templates enable row level security;
alter table template_exercises enable row level security;
alter table weekly_schedule enable row level security;
alter table workout_sessions enable row level security;
alter table set_entries enable row level security;
alter table weight_logs enable row level security;

-- v1 policies: allow all operations (single user, no auth)
create policy "allow all exercises" on exercises for all using (true) with check (true);
create policy "allow all templates" on workout_templates for all using (true) with check (true);
create policy "allow all template_exercises" on template_exercises for all using (true) with check (true);
create policy "allow all weekly_schedule" on weekly_schedule for all using (true) with check (true);
create policy "allow all workout_sessions" on workout_sessions for all using (true) with check (true);
create policy "allow all set_entries" on set_entries for all using (true) with check (true);
create policy "allow all weight_logs" on weight_logs for all using (true) with check (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Push workout template
insert into workout_templates (name, type, description) values
  ('Push', 'push', 'Chest, shoulders, triceps');

-- Push exercises
insert into exercises (name, workout_type, muscles_involved, youtube_link, instructions) values
  ('Low Incline Dumbbell Press', 'push',
   array['Upper Chest', 'Front Delts', 'Triceps'],
   'https://youtu.be/kpzUeFLReEA',
   'Set up an incline bench to about 15 to 30 degrees. Grab a pair of dumbbells and sit on the bench. Kick up the dumbbells one at a time to get them into position with your arms straight over your body. Pull your shoulder blades down away from your ears and pinch them together to create a small space between your lower back and the bench. Firmly plant your feet on the ground. Avoid letting your shoulders round forward at the top position. Instead, keep your chest up and out and shoulder blades back and down. Avoid flaring your elbows out to the sides. Instead, keep your elbows tucked at about a 45 to 60 degree angle.'),
  ('Seated Mid-Chest Cable Fly', 'push',
   array['Middle Chest'],
   'https://youtu.be/Y8E3dHNsSTU',
   'Sit on a flat bench positioned between two cable machines. Grab the handles with palms facing each other. Keep a slight bend in your elbows throughout the movement. Bring the handles together in front of your chest in a hugging motion. Squeeze your chest at the peak contraction. Slowly return to the starting position with control.'),
  ('Barbell Bench Press', 'push',
   array['Middle Chest', 'Front Delts', 'Triceps'],
   'https://youtu.be/pCGVSBk0bIQ',
   'Lie flat on a bench with your feet firmly planted on the ground. Grip the barbell slightly wider than shoulder width. Unrack the bar and position it over your chest. Lower the bar to your mid-chest with control. Press the bar back up to the starting position. Keep your shoulder blades retracted throughout the movement.'),
  ('Lateral Raises', 'push',
   array['Side Delts'],
   'https://youtu.be/pCGVSBk0bIQ',
   'Stand with dumbbells at your sides, palms facing your body. Keep a slight bend in your elbows. Raise the dumbbells out to the sides until they reach shoulder height. Pause briefly at the top. Lower the dumbbells back down with control. Avoid using momentum to swing the weights up.'),
  ('Cable Pushdowns', 'push',
   array['Triceps'],
   'https://youtu.be/MlfCS_7ZLXA',
   'Stand facing a cable machine with a rope or bar attachment at chest height. Grab the attachment with both hands. Keep your elbows pinned to your sides. Push the attachment down until your arms are fully extended. Squeeze your triceps at the bottom. Slowly return to the starting position.'),
  ('Single Arm Overhead Extension', 'push',
   array['Triceps'],
   'https://youtu.be/7yoTblFCUQM',
   'Stand or sit with a dumbbell held in one hand. Raise the dumbbell overhead with your arm fully extended. Keep your elbow close to your head. Lower the dumbbell behind your head by bending at the elbow. Extend your arm back to the starting position. Keep your core engaged throughout.');

-- Link exercises to Push template
insert into template_exercises (template_id, exercise_id, sets, reps_range, sort_order)
select
  (select id from workout_templates where name = 'Push'),
  e.id,
  case
    when e.name = 'Low Incline Dumbbell Press' then 4
    when e.name = 'Seated Mid-Chest Cable Fly' then 3
    when e.name = 'Barbell Bench Press' then 4
    when e.name = 'Lateral Raises' then 3
    when e.name = 'Cable Pushdowns' then 3
    when e.name = 'Single Arm Overhead Extension' then 3
  end,
  case
    when e.name = 'Low Incline Dumbbell Press' then '8-12'
    when e.name = 'Seated Mid-Chest Cable Fly' then '10-15'
    when e.name = 'Barbell Bench Press' then '8-12'
    when e.name = 'Lateral Raises' then '10-20'
    when e.name = 'Cable Pushdowns' then '10-15'
    when e.name = 'Single Arm Overhead Extension' then '10-15'
  end,
  row_number() over (order by e.name)
from exercises e
where e.workout_type = 'push';

-- Weekly schedule (Sun=Push, Mon=Pull, Tue=Lower 1, Wed=Rest, Thu=Upper, Fri=Lower 2, Sat=Rest)
insert into weekly_schedule (day_of_week, template_id, is_rest_day) values
  (0, (select id from workout_templates where name = 'Push'), false),
  (1, null, false),
  (2, null, false),
  (3, null, true),
  (4, null, false),
  (5, null, false),
  (6, null, true);
