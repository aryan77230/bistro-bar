# Supabase Setup

Provisions the Postgres backend that powers reservations, availability lookups, and feedback persistence.

---

## Step 1 — Create (or pick) a Supabase project

1. Go to https://supabase.com/dashboard
2. **New project** → name: `bistro-bar` → region: closest to your customers (Mumbai for India) → strong DB password → **Create new project**
3. Wait ~2 minutes for it to provision

> **Already have a project?** Skip to Step 2.

---

## Step 2 — Run the migrations (in order)

In the Supabase dashboard, open **SQL Editor → New query** and run each file in this folder, in order:

1. `01_schema.sql` — creates `tables`, `bookings`, `feedback` tables + enums + indexes
2. `02_rls.sql` — locks every table down so the anon key can only call the RPCs (never raw SQL)
3. `03_rpcs.sql` — creates the four stored procedures the website calls
4. `04_seed.sql` — inserts the 9 physical tables (T1..T9)

**Tip:** copy the file content, paste into the SQL Editor, click **Run**, repeat. Or, if you have the Supabase MCP enabled in this Claude Code session, ask me to "apply migration X".

---

## Step 3 — Grab the connection keys

Dashboard → **Project Settings → API** → copy:

| Variable | Field on this page | Where it goes |
|---|---|---|
| `SUPABASE_URL` | **Project URL** | Vercel env (public-safe) |
| `SUPABASE_ANON_KEY` | **`anon` `public` key** | Vercel env (public-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | **`service_role` `secret` key** | Vercel env — **server-only** |

⚠️ **Never** put `SUPABASE_SERVICE_ROLE_KEY` in any client/browser code. It bypasses RLS.

---

## Step 4 — Test that it worked

Open SQL Editor and run:

```sql
select label, capacity, active from public.tables order by label;
-- expect 9 rows: T1..T9 with capacity 2/2/2/2/4/4/4/6/6, all active=true
```

Then test the availability RPC:

```sql
select * from public.get_availability('2026-05-01'::date, 4);
-- returns 7 rows (one per slot), each with `tables_left` count
```

If both queries return data, Supabase is ready.

---

## Architecture notes

### Why RPCs instead of letting the client write directly?

The browser can't be trusted with arbitrary `INSERT INTO bookings`. We need:

1. **Server-side validation** — party size fits the table, slot is in the future, slot doesn't overlap an existing booking.
2. **Race-safe inserts** — two users hitting "Confirm" at the same exact second can't grab the same table.
3. **Token generation** — the cancel-link token must be generated server-side.

All three are handled by `create_booking()` in `03_rpcs.sql`, which runs in a transaction with `FOR UPDATE` row locking on the candidate table.

### Schema overview

```
tables
  └── id, label, capacity (2|4|6), active

bookings
  └── id, cancel_token, table_id → tables
      guest_name, guest_phone, guest_email
      party_size, special_requests
      slot_starts_at, slot_ends_at
      status (booked|seated|completed|cancelled|no_show)
      ghl_contact_id, ghl_opportunity_id
      created_at

feedback
  └── id, name, email, topic (feedback|reservation|press|private_dining)
      message, ghl_contact_id, created_at
```

### Cancel token

8-character `nanoid` (base62), unguessable, unique. Used in cancel-link URLs:
`https://bistro-bar-ui.vercel.app/b/8xK2pQv9`
