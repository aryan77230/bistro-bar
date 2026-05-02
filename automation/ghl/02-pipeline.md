# Step 2 — `Reservations` Pipeline

A pipeline tracks each booking as one **opportunity** moving through stages over its lifetime.

> **Status (verified 2026-04-27):** Your location already has a pipeline named `Restaurant Sales Pipeline` (id `xxxxxxxxxxxxxxxxxxxx`). It contains 11 stages — 5 of which we use, 6 of which are inert (staff can use them for finer tracking).
>
> **No setup is required for the booking flow to work.** This document explains the mapping and the optional cleanup path.

---

## How our app maps to the existing pipeline

The booking API moves opportunities through 5 logical states. They map to your existing GHL stages like this:

| App stage | GHL stage name | GHL stage ID |
|---|---|---|
| **Booked** (new reservation) | `Reservation Confirmed` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| **Seated** (guest arrived) | `Checked In` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| **Completed** (visit finished) | `Won - Completed` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| **Cancelled** (guest cancelled) | `Cancelled` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| **No-show** (didn't arrive) | `No Show` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

The 6 unused stages (`New Inquiry`, `Contacted`, `Reminder Sent`, `Dining`, `Bill Paid`, `Feedback Requested`) are inert — our automation skips them. Staff can drag opportunities through them manually if they want richer tracking.

The pipeline ID + stage IDs are already in `.env.local` and `keys.txt`.

---

## Optional: slim the pipeline to exactly 5 stages

If you'd rather have a clean pipeline with only the 5 stages we use:

1. GHL sidebar → **Opportunities** → click the pipeline name (`Restaurant Sales Pipeline`)
2. Click the **gear / ⋮ icon** at the top → **Edit Pipeline**
3. Delete these 6 stages (they're inert in our flow):
   - `New Inquiry`
   - `Contacted`
   - `Reminder Sent`
   - `Dining`
   - `Bill Paid`
   - `Feedback Requested`
4. Optionally rename the pipeline from `Restaurant Sales Pipeline` → `Reservations`
5. **Save**

After cleanup, the pipeline will look like this:

| # | Stage Name | Description | Color |
|---|---|---|---|
| 1 | `Reservation Confirmed` | Reservation made online, awaiting visit | Amber / Yellow |
| 2 | `Checked In` | Guest has arrived, table active | Green |
| 3 | `Won - Completed` | Meal finished, table closed | Blue |
| 4 | `No Show` | Guest didn't arrive | Grey |
| 5 | `Cancelled` | Guest cancelled before visit | Red |

> ⚠️ **DON'T delete or rename any of the 5 kept stages — that would change their IDs and break the booking flow.** If you do rename them by accident, run `mcp__gohighlevel__get_pipelines` and update the env vars.

---

## Verify the mapping works (optional smoke test)

1. Make a real booking via the website (`/reserve`)
2. Open GHL → **Opportunities** → `Restaurant Sales Pipeline`
3. Your booking should appear as a card in the `Reservation Confirmed` stage with the guest's name + ₹X,XXX value

---

✅ Done. Move on to [`03-workflows.md`](./03-workflows.md).
