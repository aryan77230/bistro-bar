-- ============================================================================
-- Bistro Bar — Stored procedures (RPCs)
-- Run this THIRD. All website writes go through these.
--
-- All functions are SECURITY DEFINER — they run as the table owner so they
-- can read/write the underlying tables despite RLS being default-deny.
-- ============================================================================

-- Constants embedded into functions (so we don't need a config table):
--   - Slot length:     120 minutes
--   - Booking window:  next 14 days
--   - Last seating:    21:00 local (so dining ends by 23:00)
--   - Open time:       18:00 local
--   - Cutoff:          1 hour before slot start (no last-minute books)
--   - Cancel cutoff:   24 hours before slot start


-- ============================================================================
-- 1. get_availability(date, party_size)
--    Returns 7 rows, one per 30-min start time, with `tables_left` count.
-- ============================================================================

create or replace function public.get_availability(
  p_date        date,
  p_party_size  int
)
returns table (
  slot_starts_at  timestamptz,
  tables_left     int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  slot_starts timestamptz;
  slot_ends   timestamptz;
  free_count  int;
begin
  if p_party_size < 1 or p_party_size > 6 then
    raise exception 'party_size must be between 1 and 6';
  end if;

  -- 8 slots: 18:00, 18:30, 19:00, 19:30, 20:00, 20:30, 21:00, 21:30
  for i in 0..7 loop
    slot_starts := (p_date::timestamp + interval '18 hours' + (i * interval '30 minutes')) at time zone 'Asia/Kolkata';
    slot_ends   := slot_starts + interval '120 minutes';

    -- Skip slots that have already passed (or are within 1h cutoff)
    if slot_starts < (now() + interval '1 hour') then
      slot_starts_at := slot_starts;
      tables_left := 0;
      return next;
      continue;
    end if;

    -- Count tables of correct capacity that have NO overlapping booking
    select count(*) into free_count
    from public.tables t
    where t.active = true
      and t.capacity >= p_party_size
      and not exists (
        select 1 from public.bookings b
        where b.table_id = t.id
          and b.status not in ('cancelled', 'no_show')
          and b.slot_starts_at < slot_ends
          and b.slot_ends_at   > slot_starts
      );

    slot_starts_at := slot_starts;
    tables_left := free_count;
    return next;
  end loop;
end;
$$;


-- ============================================================================
-- 2. create_booking(...)
--    Validates, locks the smallest fitting free table, inserts, returns
--    the cancel_token + booking_id.
-- ============================================================================

create or replace function public.create_booking(
  p_guest_name        text,
  p_guest_phone       text,
  p_guest_email       text,
  p_party_size        int,
  p_slot_starts_at    timestamptz,
  p_special_requests  text default null
)
returns table (
  booking_id    uuid,
  cancel_token  text,
  table_label   text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot_ends     timestamptz;
  v_table_id      uuid;
  v_table_label   text;
  v_token         text;
  v_booking_id    uuid;
begin
  -- Input validation
  if length(coalesce(p_guest_name, '')) < 2 then
    raise exception 'guest_name required';
  end if;

  if length(coalesce(p_guest_phone, '')) < 8 then
    raise exception 'guest_phone required';
  end if;

  if p_party_size < 1 or p_party_size > 6 then
    raise exception 'party_size must be between 1 and 6';
  end if;

  if p_slot_starts_at < (now() + interval '1 hour') then
    raise exception 'slot must be at least 1 hour in the future';
  end if;

  if p_slot_starts_at > (now() + interval '17 days') then
    raise exception 'slot must be within 16 days';
  end if;

  v_slot_ends := p_slot_starts_at + interval '120 minutes';

  -- Find smallest fitting table that has no overlap. FOR UPDATE locks
  -- the candidate row so concurrent calls can't both grab it.
  select t.id, t.label
    into v_table_id, v_table_label
  from public.tables t
  where t.active = true
    and t.capacity >= p_party_size
    and not exists (
      select 1 from public.bookings b
      where b.table_id = t.id
        and b.status not in ('cancelled', 'no_show')
        and b.slot_starts_at < v_slot_ends
        and b.slot_ends_at   > p_slot_starts_at
    )
  order by t.capacity asc, t.label asc  -- smallest fitting table first
  limit 1
  for update;

  if v_table_id is null then
    raise exception 'no tables available for that slot';
  end if;

  -- Generate 8-char token via md5(random()) — no extension required.
  -- Hex chars only [0-9a-f], 16^8 = ~4.3 billion possibilities, plenty unguessable
  -- for a hospitality cancel-link use case.
  v_token := substr(md5(random()::text || clock_timestamp()::text), 1, 8);

  -- Insert booking
  insert into public.bookings (
    cancel_token, table_id, guest_name, guest_phone, guest_email,
    party_size, special_requests, slot_starts_at, slot_ends_at, status
  ) values (
    v_token, v_table_id, p_guest_name, p_guest_phone, p_guest_email,
    p_party_size, p_special_requests, p_slot_starts_at, v_slot_ends, 'booked'
  )
  returning id into v_booking_id;

  booking_id   := v_booking_id;
  cancel_token := v_token;
  table_label  := v_table_label;
  return next;
end;
$$;


-- ============================================================================
-- 3. get_booking_by_token(token)
--    Returns the booking details for the cancel page (no PII leakage of
--    other bookings — the token IS the auth).
-- ============================================================================

create or replace function public.get_booking_by_token(p_token text)
returns table (
  booking_id        uuid,
  guest_name        text,
  party_size        int,
  slot_starts_at    timestamptz,
  slot_ends_at      timestamptz,
  table_label       text,
  status            public.booking_status,
  special_requests  text,
  can_cancel        boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    b.id,
    b.guest_name,
    b.party_size,
    b.slot_starts_at,
    b.slot_ends_at,
    t.label,
    b.status,
    b.special_requests,
    (b.status = 'booked' and b.slot_starts_at > (now() + interval '24 hours')) as can_cancel
  from public.bookings b
  join public.tables   t on t.id = b.table_id
  where b.cancel_token = p_token
  limit 1;
end;
$$;


-- ============================================================================
-- 4. cancel_booking(token)
--    Marks status=cancelled if still allowed. Returns success bool.
-- ============================================================================

create or replace function public.cancel_booking(p_token text)
returns table (
  success        boolean,
  message        text,
  booking_id     uuid,
  ghl_contact_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking  public.bookings%rowtype;
begin
  select * into v_booking
  from public.bookings
  where cancel_token = p_token
  for update;

  if v_booking.id is null then
    success := false; message := 'booking not found';
    return next; return;
  end if;

  if v_booking.status <> 'booked' then
    success := false; message := 'booking already ' || v_booking.status;
    booking_id := v_booking.id;
    ghl_contact_id := v_booking.ghl_contact_id;
    return next; return;
  end if;

  if v_booking.slot_starts_at <= (now() + interval '24 hours') then
    success := false; message := 'too late to cancel online — please call';
    booking_id := v_booking.id;
    return next; return;
  end if;

  update public.bookings set status = 'cancelled' where id = v_booking.id;

  success := true; message := 'cancelled';
  booking_id := v_booking.id;
  ghl_contact_id := v_booking.ghl_contact_id;
  return next;
end;
$$;


-- ============================================================================
-- 5. submit_feedback(name, email, topic, message)
--    Inserts a feedback row, returns the id (server then upserts to GHL).
-- ============================================================================

create or replace function public.submit_feedback(
  p_name     text,
  p_email    text,
  p_topic    public.feedback_topic,
  p_message  text
)
returns table (feedback_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if length(coalesce(p_name, ''))    < 2 then raise exception 'name required'; end if;
  if length(coalesce(p_email, ''))   < 3 then raise exception 'email required'; end if;
  if length(coalesce(p_message, '')) < 5 then raise exception 'message too short'; end if;

  insert into public.feedback (name, email, topic, message)
  values (p_name, p_email, p_topic, p_message)
  returning id into v_id;

  feedback_id := v_id;
  return next;
end;
$$;


-- ============================================================================
-- 6. set_booking_ghl_ids(booking_id, contact_id, opportunity_id)
--    Called by the server route AFTER it upserts to GHL, so the row stores
--    the GHL pointers. service_role only — anon can't call this.
-- ============================================================================

create or replace function public.set_booking_ghl_ids(
  p_booking_id        uuid,
  p_ghl_contact_id    text,
  p_ghl_opportunity_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
     set ghl_contact_id = p_ghl_contact_id,
         ghl_opportunity_id = p_ghl_opportunity_id
   where id = p_booking_id;
end;
$$;

-- service_role bypasses RLS, so it doesn't need explicit grant.
revoke execute on function public.set_booking_ghl_ids(uuid, text, text) from anon, authenticated;


-- ============================================================================
-- Re-grant after creation (in case 02_rls.sql ran before the functions existed)
-- ============================================================================

grant execute on function public.get_availability(date, int)                              to anon, authenticated;
grant execute on function public.create_booking(text, text, text, int, timestamptz, text) to anon, authenticated;
grant execute on function public.get_booking_by_token(text)                               to anon, authenticated;
grant execute on function public.cancel_booking(text)                                     to anon, authenticated;
grant execute on function public.submit_feedback(text, text, public.feedback_topic, text) to anon, authenticated;
