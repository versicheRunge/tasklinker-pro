-- ============================================================
-- TaskLinker Pro – Datenbankschema für Versicherungsagentur
-- Ausführen im Supabase SQL Editor
-- ============================================================

-- ── Erweiterungen ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Agentur-Einstellungen (Admin-Board) ─────────────────────
create table if not exists agency_settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  value       text,
  updated_at  timestamptz default now()
);

insert into agency_settings (key, value) values
  ('agency_name',    'Itzehoer Versicherungen Till Streckenbach'),
  ('agency_address', ''),
  ('agency_phone',   ''),
  ('agency_email',   ''),
  ('agency_website', ''),
  ('agency_logo_url','')
on conflict (key) do nothing;

-- ── Benutzer (Mitarbeiter) ───────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text unique not null,
  phone         text,
  role          text not null default 'staff',         -- 'admin' | 'staff' | 'field'
  department    text,
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Kunden ───────────────────────────────────────────────────
create table if not exists customers (
  id            uuid primary key default uuid_generate_v4(),
  first_name    text not null,
  last_name     text not null,
  email         text,
  phone         text,
  mobile        text,
  birth_date    date,
  address       text,
  zip           text,
  city          text,
  notes         text,
  assigned_to   uuid references profiles(id),
  created_by    uuid references profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Vorgänge (Cases) ─────────────────────────────────────────
create type case_status   as enum ('new','in_progress','waiting','completed','archived');
create type case_priority as enum ('low','medium','high','urgent');
create type case_type     as enum (
  'kfz',            -- KFZ-Versicherung
  'phv',            -- Private Haftpflicht
  'hr',             -- Hausrat
  'wgb',            -- Wohngebäude
  'bu',             -- Berufsunfähigkeit
  'risiko',         -- Risikolebensversicherung
  'altersvorsorge', -- Altersvorsorge / Rente
  'kranken',        -- Krankenversicherung / -zusatz
  'unfall',         -- Unfallversicherung
  'rechtsschutz',   -- Rechtsschutz
  'tier',           -- Tierkranken / Tierhalterhaftpflicht
  'reise',          -- Reiseversicherung
  'gewerbe',        -- Gewerbeversicherung
  'landwirtschaft', -- Landwirtschaftliche Versicherung
  'sonstiges'       -- Sonstiges
);

create table if not exists cases (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  status          case_status not null default 'new',
  priority        case_priority not null default 'medium',
  type            case_type not null default 'sonstiges',
  customer_id     uuid references customers(id),
  customer_name   text,   -- Fallback falls kein Kundeneintrag
  assignee_id     uuid references profiles(id),
  created_by      uuid references profiles(id),
  due_date        date,
  follow_up_date  date,
  reminder_sent   boolean default false,
  archived        boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Aktivitäten / Kommentare zu Vorgängen ────────────────────
create type activity_type as enum ('comment','status','document','checklist','assignment','other');

create table if not exists case_activities (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  user_id     uuid references profiles(id),
  type        activity_type not null default 'comment',
  content     text not null,
  mentions    uuid[],
  created_at  timestamptz default now()
);

-- ── Dokumente ────────────────────────────────────────────────
create table if not exists documents (
  id            uuid primary key default uuid_generate_v4(),
  case_id       uuid references cases(id) on delete cascade,
  customer_id   uuid references customers(id) on delete cascade,
  name          text not null,
  file_path     text not null,   -- Pfad im Supabase Storage
  file_size     bigint,
  mime_type     text,
  uploaded_by   uuid references profiles(id),
  created_at    timestamptz default now()
);

-- ── Checklisten-Templates ─────────────────────────────────────
create table if not exists checklist_templates (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  type        case_type,
  items       jsonb not null default '[]',
  created_by  uuid references profiles(id),
  created_at  timestamptz default now()
);

-- ── Checklisten-Einträge pro Vorgang ─────────────────────────
create table if not exists checklist_items (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  text        text not null,
  description text,
  completed   boolean not null default false,
  sort_order  integer default 0,
  sub_items   jsonb default '[]',
  created_at  timestamptz default now()
);

-- ── Ziele (Goals) ────────────────────────────────────────────
create type goal_type as enum ('count','sum');

create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  type        goal_type not null default 'count',
  target      numeric not null,
  current     numeric not null default 0,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists goal_contributions (
  id            uuid primary key default uuid_generate_v4(),
  goal_id       uuid not null references goals(id) on delete cascade,
  user_id       uuid not null references profiles(id),
  contribution  numeric not null default 0,
  updated_at    timestamptz default now(),
  unique(goal_id, user_id)
);

-- ── Chat ─────────────────────────────────────────────────────
create type channel_type as enum ('channel','direct','group');

create table if not exists chat_channels (
  id            uuid primary key default uuid_generate_v4(),
  name          text,
  type          channel_type not null default 'channel',
  participants  uuid[],
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);

create table if not exists chat_messages (
  id            uuid primary key default uuid_generate_v4(),
  channel_id    uuid not null references chat_channels(id) on delete cascade,
  user_id       uuid not null references profiles(id),
  text          text not null,
  mentions      uuid[],
  is_edited     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Benachrichtigungen ───────────────────────────────────────
create table if not exists notifications (
  id              uuid primary key default uuid_generate_v4(),
  target_user_id  uuid not null references profiles(id) on delete cascade,
  title           text not null,
  message         text not null,
  type            text not null default 'system',   -- 'case' | 'chat' | 'system'
  case_id         uuid references cases(id) on delete set null,
  read            boolean default false,
  created_at      timestamptz default now()
);

-- ── Kalender-Termine ─────────────────────────────────────────
create table if not exists calendar_events (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  start_time    timestamptz not null,
  end_time      timestamptz,
  all_day       boolean default false,
  case_id       uuid references cases(id) on delete set null,
  customer_id   uuid references customers(id) on delete set null,
  created_by    uuid not null references profiles(id),
  attendees     uuid[],
  created_at    timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table agency_settings    enable row level security;
alter table profiles           enable row level security;
alter table customers          enable row level security;
alter table cases              enable row level security;
alter table case_activities    enable row level security;
alter table documents          enable row level security;
alter table checklist_templates enable row level security;
alter table checklist_items    enable row level security;
alter table goals              enable row level security;
alter table goal_contributions enable row level security;
alter table chat_channels      enable row level security;
alter table chat_messages      enable row level security;
alter table notifications      enable row level security;
alter table calendar_events    enable row level security;

-- Alle eingeloggten Mitarbeiter können alles lesen/schreiben
-- (Feinsteuerung über Admin-Rolle folgt)
create policy "authenticated_all" on agency_settings    for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on profiles           for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on customers          for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on cases              for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on case_activities    for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on documents          for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on checklist_templates for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on checklist_items    for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on goals              for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on goal_contributions for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on chat_channels      for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on chat_messages      for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on notifications      for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on calendar_events    for all using (auth.role() = 'authenticated');

-- ── Storage Bucket für Dokumente ─────────────────────────────
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "authenticated_storage" on storage.objects
  for all using (auth.role() = 'authenticated' and bucket_id = 'documents');
