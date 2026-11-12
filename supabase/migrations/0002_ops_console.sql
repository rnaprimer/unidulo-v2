-- Unidulo v2, second migration: what the owner's console at /ops needs.
-- Run this once in the Supabase SQL editor, after 0001_init.sql.
-- It only adds things. No existing row or column is changed or removed.

-- 1. A "next action" and a "last changed" time on both record tables.
alter table public.rfqs
  add column next_action     text not null default '' check (char_length(next_action) <= 200),
  add column next_action_due date,
  add column updated_at      timestamptz not null default now();

alter table public.manufacturer_applications
  add column next_action     text not null default '' check (char_length(next_action) <= 200),
  add column next_action_due date,
  add column updated_at      timestamptz not null default now();

-- Rows that already exist were last changed when they were created.
update public.rfqs set updated_at = created_at;
update public.manufacturer_applications set updated_at = created_at;

-- The database keeps updated_at current itself, so the application can't forget.
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger rfqs_set_updated_at
  before update on public.rfqs
  for each row execute function public.set_updated_at();

create trigger manufacturer_applications_set_updated_at
  before update on public.manufacturer_applications
  for each row execute function public.set_updated_at();

-- 2. Private notes written in the console.
-- Each note belongs to exactly one RFQ or one manufacturer application.
-- Notes are never edited, so there is no updated_at here.
create table public.notes (
  id                          uuid primary key default gen_random_uuid(),
  rfq_id                      uuid references public.rfqs (id) on delete cascade,
  manufacturer_application_id uuid references public.manufacturer_applications (id) on delete cascade,
  body                        text not null check (char_length(body) between 1 and 4000),
  created_at                  timestamptz not null default now(),
  -- Exactly one of the two links must be filled in: never both, never neither.
  constraint notes_one_parent check (num_nonnulls(rfq_id, manufacturer_application_id) = 1)
);

create index notes_rfq_idx on public.notes (rfq_id, created_at desc)
  where rfq_id is not null;
create index notes_manufacturer_application_idx
  on public.notes (manufacturer_application_id, created_at desc)
  where manufacturer_application_id is not null;

-- 3. Same lock as the other tables. Row Level Security is on with no policies,
-- so the public (anon) key and any signed-in user can read and write nothing.
-- Only the server, using the secret service-role key, can touch these rows.
alter table public.notes enable row level security;

revoke all on public.notes from anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
