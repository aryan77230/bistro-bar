-- ============================================================================
-- Bistro Bar — Row Level Security
-- Run this SECOND, after 01_schema.sql.
--
-- Strategy: lock everything down for the `anon` role. Force ALL writes
-- through SECURITY DEFINER stored procedures (defined in 03_rpcs.sql) so the
-- browser can never directly INSERT/UPDATE rows.
--
-- The `service_role` key (used only on the Vercel server route) bypasses
-- RLS automatically — that's how the API talks to GHL on cancellation.
-- ============================================================================

-- 1. Enable RLS on every table -----------------------------------------------

alter table public.tables    enable row level security;
alter table public.bookings  enable row level security;
alter table public.feedback  enable row level security;


-- 2. DROP existing policies (idempotent re-runs) ----------------------------

do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('tables', 'bookings', 'feedback')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;


-- 3. Default deny ------------------------------------------------------------
-- (No policies = no access for anon. RLS is now in default-deny mode.)
-- We do NOT add SELECT/INSERT/UPDATE/DELETE policies on these tables.
-- All access from the browser MUST go through the RPCs in 03_rpcs.sql,
-- which are defined as SECURITY DEFINER and run as the table owner.


-- 4. Grant EXECUTE on RPCs to anon ------------------------------------------
-- The actual function definitions live in 03_rpcs.sql; granting permission
-- here is harmless if the functions don't exist yet.

do $$ begin
  -- These will exist after 03_rpcs.sql runs. If they don't yet, ignore.
  perform 1 from pg_proc where proname = 'get_availability';
  if found then
    grant execute on function public.get_availability(date, int) to anon, authenticated;
  end if;

  perform 1 from pg_proc where proname = 'create_booking';
  if found then
    grant execute on function public.create_booking(text, text, text, int, timestamptz, text) to anon, authenticated;
  end if;

  perform 1 from pg_proc where proname = 'get_booking_by_token';
  if found then
    grant execute on function public.get_booking_by_token(text) to anon, authenticated;
  end if;

  perform 1 from pg_proc where proname = 'cancel_booking';
  if found then
    grant execute on function public.cancel_booking(text) to anon, authenticated;
  end if;

  perform 1 from pg_proc where proname = 'submit_feedback';
  if found then
    grant execute on function public.submit_feedback(text, text, public.feedback_topic, text) to anon, authenticated;
  end if;
end $$;


-- 5. Lock down direct table access for anon (belt + suspenders) -------------

revoke all on public.tables   from anon, authenticated;
revoke all on public.bookings from anon, authenticated;
revoke all on public.feedback from anon, authenticated;
