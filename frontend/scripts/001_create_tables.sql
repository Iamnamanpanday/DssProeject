-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mental health assessments table
create table if not exists public.mental_health_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_quality int check (sleep_quality >= 0 and sleep_quality <= 100),
  stress_level int check (stress_level >= 0 and stress_level <= 100),
  activity_level int check (activity_level >= 0 and activity_level <= 100),
  mood int check (mood >= 0 and mood <= 100),
  ai_risk_level text,
  ai_confidence int,
  insights text,
  recommendations text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.mental_health_assessments enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- RLS Policies for assessments
create policy "assessments_select_own" on public.mental_health_assessments for select using (auth.uid() = user_id);
create policy "assessments_insert_own" on public.mental_health_assessments for insert with check (auth.uid() = user_id);
create policy "assessments_update_own" on public.mental_health_assessments for update using (auth.uid() = user_id);
create policy "assessments_delete_own" on public.mental_health_assessments for delete using (auth.uid() = user_id);
