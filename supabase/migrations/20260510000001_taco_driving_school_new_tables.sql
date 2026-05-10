-- enrollments table
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  unique (user_id, course_id)
);
alter table public.enrollments enable row level security;

create policy "Students view own enrollments" on public.enrollments
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage enrollments" on public.enrollments
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- payments table
create type public.payment_status as enum ('pending', 'paid', 'overdue');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null,
  due_date date not null,
  status public.payment_status not null default 'pending',
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create policy "Students view own payments" on public.payments
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage payments" on public.payments
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- schedule_entries table
create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  student_id uuid references auth.users(id) on delete set null,
  scheduled_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
alter table public.schedule_entries enable row level security;
create trigger schedule_entries_updated_at before update on public.schedule_entries
  for each row execute function public.set_updated_at();

create policy "Users view relevant schedule entries" on public.schedule_entries
  for select to authenticated using (
    instructor_id = auth.uid() or
    student_id = auth.uid() or
    public.has_role(auth.uid(), 'admin')
  );
create policy "Admins manage schedule entries" on public.schedule_entries
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- lesson_progress table
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create policy "Students manage own progress" on public.lesson_progress
  for all to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- notification_preferences table
create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
create trigger notification_preferences_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

create policy "Users manage own preferences" on public.notification_preferences
  for all to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());
