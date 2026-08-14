-- Run this once in your Supabase project's SQL editor.
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists entries_section_idx on public.entries (section, created_at desc);
create index if not exists entries_user_idx on public.entries (user_id);

alter table public.entries enable row level security;

-- Each caregiver only ever sees/writes their own rows.
-- (If you later add a second caregiver account and want them to share
-- data, change these policies to check against a shared "household_id"
-- instead of user_id.)

create policy "Users can read their own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.entries for delete
  using (auth.uid() = user_id);
