-- ============================================================================
-- Bistro Bar — Seed data
-- Run this LAST. Inserts the 9 physical tables in the venue.
--
-- Layout (per design):
--   4 × 2-tops (T1, T2, T3, T4)
--   3 × 4-tops (T5, T6, T7)
--   2 × 6-tops (T8, T9)
--   = 9 tables, max party 6, capacity 32
-- ============================================================================

insert into public.tables (label, capacity, active)
values
  ('T1', 2, true),
  ('T2', 2, true),
  ('T3', 2, true),
  ('T4', 2, true),
  ('T5', 4, true),
  ('T6', 4, true),
  ('T7', 4, true),
  ('T8', 6, true),
  ('T9', 6, true)
on conflict (label) do update
  set capacity = excluded.capacity,
      active   = excluded.active;

-- Verify
select label, capacity, active from public.tables order by capacity, label;
