-- Run this once in Supabase → SQL Editor to create the shared reports board.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost', 'found')),
  title text not null,
  category text not null,
  date date not null,
  location text not null,
  description text not null default '',
  contact_name text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
drop policy if exists "Anyone can read reports" on public.reports;
drop policy if exists "Anyone can post reports" on public.reports;
create policy "Anyone can read reports" on public.reports for select using (true);
create policy "Anyone can post reports" on public.reports for insert with check (
  type in ('lost', 'found') and length(title) <= 80 and length(location) <= 100
  and length(description) <= 400 and length(contact) <= 120
);
grant select, insert on public.reports to anon, authenticated;
