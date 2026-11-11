-- Unidulo v2, first migration.
-- Two tables: customer RFQs and manufacturer applications.
-- Run this once in the Supabase SQL editor of the NEW project.

-- Reference numbers come from the database so two people can never get the
-- same one, however many submit at once.
create sequence public.rfq_reference_seq start 1001;
create sequence public.manufacturer_reference_seq start 1001;

create table public.rfqs (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique
                  default ('RFQ-' || to_char(now(), 'YY') || '-' || nextval('public.rfq_reference_seq')),
  -- Sent by the browser once per form. A retry or double click reuses it,
  -- and the unique rule below stops a second row being created.
  submission_id   uuid not null unique,
  status          text not null default 'new'
                  check (status in ('new', 'reviewing', 'quoted', 'closed')),

  packaging_type  text not null check (packaging_type in (
                    'corrugated_shipping_box', 'mailer_box', 'folding_carton',
                    'rigid_box', 'paper_bag', 'sleeve', 'insert', 'other')),
  intended_use    text not null check (char_length(intended_use) between 1 and 300),
  length          numeric(8,2) not null check (length > 0 and length <= 5000),
  width           numeric(8,2) not null check (width > 0 and width <= 5000),
  height          numeric(8,2) not null check (height > 0 and height <= 5000),
  unit            text not null check (unit in ('mm', 'cm', 'in')),
  dimension_basis text not null check (dimension_basis in ('internal', 'external')),

  material        text not null check (material in (
                    'not_sure', 'corrugated_3ply', 'corrugated_5ply', 'kraft_paper',
                    'duplex_board', 'sbs_fbb', 'rigid_greyboard', 'other')),
  print_colours   text not null check (print_colours in (
                    'none', 'one', 'two', 'full_colour', 'not_sure')),
  finishing       text[] not null default '{}'
                  check (finishing <@ array[
                    'matte_lamination', 'gloss_lamination', 'spot_uv', 'foil', 'emboss']),

  quantity        integer not null check (quantity between 1 and 10000000),
  delivery_city   text not null check (char_length(delivery_city) between 1 and 80),
  delivery_state  text not null check (char_length(delivery_state) between 1 and 60),
  required_by     date,
  notes           text not null default '' check (char_length(notes) <= 2000),

  contact_name    text not null check (char_length(contact_name) between 1 and 100),
  company         text not null default '' check (char_length(company) <= 120),
  email           text not null check (char_length(email) between 3 and 200),
  phone           text not null check (char_length(phone) between 7 and 20),

  -- A scrambled form of the sender's IP address, used only to limit how many
  -- requests one source can send per hour. The real address is never stored.
  ip_hash         text not null,
  -- Set when the alert email to the owner went out. Empty means resend it.
  notified_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index rfqs_created_at_idx on public.rfqs (created_at desc);
create index rfqs_rate_limit_idx on public.rfqs (ip_hash, created_at desc);

create table public.manufacturer_applications (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique
                  default ('MFR-' || to_char(now(), 'YY') || '-' || nextval('public.manufacturer_reference_seq')),
  submission_id   uuid not null unique,
  status          text not null default 'applied'
                  check (status in ('applied', 'reviewing', 'approved', 'rejected')),

  company_name    text not null check (char_length(company_name) between 1 and 120),
  contact_name    text not null check (char_length(contact_name) between 1 and 100),
  email           text not null check (char_length(email) between 3 and 200),
  phone           text not null check (char_length(phone) between 7 and 20),
  city            text not null check (char_length(city) between 1 and 80),
  state           text not null check (char_length(state) between 1 and 60),
  products        text[] not null check (
                    cardinality(products) between 1 and 8 and products <@ array[
                      'corrugated_shipping_box', 'mailer_box', 'folding_carton',
                      'rigid_box', 'paper_bag', 'sleeve', 'insert', 'other']),
  minimum_order   text not null default '' check (char_length(minimum_order) <= 200),
  capabilities    text not null default '' check (char_length(capabilities) <= 2000),

  ip_hash         text not null,
  notified_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index manufacturer_applications_created_at_idx
  on public.manufacturer_applications (created_at desc);
create index manufacturer_applications_rate_limit_idx
  on public.manufacturer_applications (ip_hash, created_at desc);

-- Lock both tables. With Row Level Security on and no policies, the public
-- (anon) key can read and write nothing. Only the server, using the secret
-- service-role key, can touch these rows.
alter table public.rfqs enable row level security;
alter table public.manufacturer_applications enable row level security;

revoke all on public.rfqs from anon, authenticated;
revoke all on public.manufacturer_applications from anon, authenticated;
revoke all on sequence public.rfq_reference_seq from anon, authenticated;
revoke all on sequence public.manufacturer_reference_seq from anon, authenticated;
