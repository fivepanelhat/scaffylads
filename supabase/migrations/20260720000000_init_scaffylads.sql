-- ScaffyLads core schema (projects, shifts, log entries)
-- Local-first product: Supabase is optional sync / production store for Vercel.

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site_address text not null default '',
  client text not null default '',
  status text not null default 'active'
    check (status in ('planned', 'active', 'on_hold', 'complete')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  crew text[] not null default '{}',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'done', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  shift_id uuid references public.shifts (id) on delete set null,
  date date not null,
  author text not null default 'Site lead',
  weather text not null default 'clear'
    check (weather in ('clear', 'overcast', 'rain', 'wind', 'other')),
  max_height_m double precision,
  inspection_done boolean not null default false,
  crew_on_site text[] not null default '{}',
  work_done text not null default '',
  issues text not null default '',
  next_steps text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shifts_project_id_idx on public.shifts (project_id);
create index if not exists shifts_starts_at_idx on public.shifts (starts_at);
create index if not exists logs_project_id_idx on public.logs (project_id);
create index if not exists logs_date_idx on public.logs (date desc);

-- Demo-friendly: open read/write for anon key until auth ships.
-- Tighten with RLS + auth.uid() when multi-tenant auth is added.
alter table public.projects enable row level security;
alter table public.shifts enable row level security;
alter table public.logs enable row level security;

drop policy if exists "projects_anon_all" on public.projects;
create policy "projects_anon_all" on public.projects
  for all using (true) with check (true);

drop policy if exists "shifts_anon_all" on public.shifts;
create policy "shifts_anon_all" on public.shifts
  for all using (true) with check (true);

drop policy if exists "logs_anon_all" on public.logs;
create policy "logs_anon_all" on public.logs
  for all using (true) with check (true);

-- Seed one demo job if empty
insert into public.projects (id, name, site_address, client, status, notes)
select
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'Harbour View Apartments - Edge Protection',
  '12 Quay St, Auckland CBD',
  'Harbour Build Ltd',
  'active',
  'Seed project for ScaffyLads demo. Replace with live jobs.'
where not exists (select 1 from public.projects limit 1);

insert into public.shifts (id, project_id, title, starts_at, ends_at, crew, status, notes)
select
  'b0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'Erect level 3 handrail + board out',
  (current_date::text || ' 07:00:00+00')::timestamptz,
  (current_date::text || ' 15:30:00+00')::timestamptz,
  array['Tane', 'Mia', 'Josh'],
  'scheduled',
  'Bring extra boards and tag kit.'
where not exists (select 1 from public.shifts limit 1);

insert into public.logs (
  id, project_id, shift_id, date, author, weather, max_height_m,
  inspection_done, crew_on_site, work_done, issues, next_steps
)
select
  'c0000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'b0000000-0000-4000-8000-000000000001'::uuid,
  current_date,
  'Site lead',
  'overcast',
  9,
  true,
  array['Tane', 'Mia', 'Josh'],
  'Completed first lift handrail on east elevation. Boards tagged green. Access ladder secured.',
  'One split board replaced. Client gate code changed - note in van folder.',
  'West elevation handrail tomorrow. Book inspector for Thursday.'
where not exists (select 1 from public.logs limit 1);
