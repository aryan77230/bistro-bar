-- ============================================================================
-- Bistro Bar — Schema
-- Run this FIRST. Idempotent: safe to re-run.
-- ============================================================================

-- 1. ENUMS ------------------------------------------------------------------

do $$ begin
  create type public.booking_status as enum (
    'booked',     -- newly created, awaiting visit
    'seated',     -- guest has arrived, table active
    'completed',  -- meal finished, table closed
    'cancelled',  -- guest cancelled before visit
    'no_show'     -- guest didn't arrive, marked by staff
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.feedback_topic as enum (
    'feedback',
    'reservation',
    'press',
    'other'
  );
exception when duplicate_object then null; end $$;


-- 2. TABLES -----------------------------------------------------------------

-- Physical tables in the venue
create table if not exists public.tables (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,             -- "T1", "T2", ...
  capacity    int  not null check (capacity in (2, 4, 6)),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.tables is 'Physical tables in the venue. Seeded once via 04_seed.sql.';


-- Reservations
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  cancel_token        text not null unique,                    -- 8-char nanoid
  table_id            uuid not null references public.tables(id) on delete restrict,
  guest_name          text not null,
  guest_phone         text not null,                           -- E.164 (+91...)
  guest_email         text,                                    -- optional
  party_size          int  not null check (party_size between 1 and 6),
  special_requests    text,
  slot_starts_at      timestamptz not null,
  slot_ends_at        timestamptz not null,
  status              public.booking_status not null default 'booked',
  ghl_contact_id      text,
  ghl_opportunity_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint slot_valid check (slot_ends_at > slot_starts_at),
  constraint slot_in_future check (slot_starts_at >= '2024-01-01')
);

comment on table public.bookings is 'Customer reservations. Inserts MUST go through public.create_booking() RPC.';


-- Feedback / contact-form submissions
create table if not exists public.feedback (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  topic           public.feedback_topic not null default 'feedback',
  message         text not null,
  ghl_contact_id  text,
  created_at      timestamptz not null default now()
);

comment on table public.feedback is 'Contact-page form submissions. Triggers an acknowledgement email via GHL.';


-- 3. INDEXES ----------------------------------------------------------------

create index if not exists idx_bookings_slot
  on public.bookings (table_id, slot_starts_at)
  where status not in ('cancelled', 'no_show');

create index if not exists idx_bookings_token
  on public.bookings (cancel_token);

create index if not exists idx_bookings_status
  on public.bookings (status);

create index if not exists idx_bookings_starts_at
  on public.bookings (slot_starts_at);

create index if not exists idx_feedback_created
  on public.feedback (created_at desc);


-- 4. updated_at trigger -----------------------------------------------------

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_updated_at on public.bookings;
create trigger set_updated_at
  before update on public.bookings
  for each row execute function public.tg_set_updated_at();
