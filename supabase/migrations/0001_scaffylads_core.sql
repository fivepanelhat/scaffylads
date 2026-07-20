-- ScaffyLads core schema.
--
-- Every table is owned by exactly one auth user and is unreadable by anyone
-- else. owner_id defaults to auth.uid() so inserts never have to pass it and
-- cannot forge it - the WITH CHECK clauses below reject any row whose owner
-- is not the caller.
--
-- Run once against a fresh Supabase project:
--   supabase db push
-- or paste into the SQL editor.

-- ---------------------------------------------------------------- projects --

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade
                 default auth.uid(),
  name         text not null check (length(trim(name)) > 0),
  site_address text not null default '',
  client       text not null default '',
  status       text not null default 'active'
                 check (status in ('planned', 'active', 'on_hold', 'complete')),
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------ shifts --

create table if not exists public.shifts (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade
               default auth.uid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null check (length(trim(title)) > 0),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  crew       text[] not null default '{}',
  status     text not null default 'scheduled'
               check (status in ('scheduled', 'in_progress', 'done', 'cancelled')),
  notes      text not null default '',
  created_at timestamptz not null default now(),

  -- Mirrors the API-level rule, so a direct DB write cannot create the
  -- inverted shift the route layer rejects.
  constraint shifts_end_after_start check (ends_at > starts_at)
);

-- -------------------------------------------------------------------- logs --

create table if not exists public.logs (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users (id) on delete cascade
                    default auth.uid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  shift_id        uuid references public.shifts (id) on delete set null,
  date            date not null,
  author          text not null default 'Site lead',
  weather         text not null default 'clear'
                    check (weather in ('clear', 'overcast', 'rain', 'wind', 'other')),
  max_height_m    numeric,
  inspection_done boolean not null default false,
  crew_on_site    text[] not null default '{}',
  work_done       text not null default '',
  issues          text not null default '',
  next_steps      text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------- indexes --

create index if not exists projects_owner_idx on public.projects (owner_id);
create index if not exists shifts_owner_idx   on public.shifts   (owner_id);
create index if not exists logs_owner_idx     on public.logs     (owner_id);

-- Support the sorts the app actually issues.
create index if not exists shifts_starts_at_idx on public.shifts (owner_id, starts_at);
create index if not exists logs_date_idx        on public.logs   (owner_id, date desc);
create index if not exists shifts_project_idx   on public.shifts (project_id);
create index if not exists logs_project_idx     on public.logs   (project_id);

-- --------------------------------------------------------------- updated_at --

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists logs_touch_updated_at on public.logs;
create trigger logs_touch_updated_at
  before update on public.logs
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- RLS --
-- Deny by default, then allow only the owner. Without these the anon key
-- would read and write every row in the table.

alter table public.projects enable row level security;
alter table public.shifts   enable row level security;
alter table public.logs     enable row level security;

-- Belt and braces: RLS does not apply to the table owner by default, and a
-- future migration could add a SECURITY DEFINER function that forgets to
-- check. FORCE closes that off.
alter table public.projects force row level security;
alter table public.shifts   force row level security;
alter table public.logs     force row level security;

do $$
declare
  t text;
begin
  foreach t in array array['projects', 'shifts', 'logs'] loop
    execute format('drop policy if exists %I_select_own on public.%I', t, t);
    execute format('drop policy if exists %I_insert_own on public.%I', t, t);
    execute format('drop policy if exists %I_update_own on public.%I', t, t);
    execute format('drop policy if exists %I_delete_own on public.%I', t, t);

    execute format(
      'create policy %I_select_own on public.%I for select
         using (owner_id = auth.uid())', t, t);

    -- WITH CHECK stops a caller inserting a row owned by someone else.
    execute format(
      'create policy %I_insert_own on public.%I for insert
         with check (owner_id = auth.uid())', t, t);

    -- Both clauses: USING gates which rows may be targeted, WITH CHECK stops
    -- an update handing the row to another owner.
    execute format(
      'create policy %I_update_own on public.%I for update
         using (owner_id = auth.uid())
         with check (owner_id = auth.uid())', t, t);

    execute format(
      'create policy %I_delete_own on public.%I for delete
         using (owner_id = auth.uid())', t, t);
  end loop;
end;
$$;
