# GoHighLevel Setup

Walk through the three setup steps in order. Total time: **~25 minutes**, one-time.

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ 1. Custom fields   │→ │ 2. Pipeline +      │→ │ 3. Workflows +     │
│    (5 min)         │  │    stages (5 min)  │  │    emails (15 min) │
└────────────────────┘  └────────────────────┘  └────────────────────┘
        ↓                       ↓                       ↓
   ghl/01-…              ghl/02-…              ghl/03-… +
                                                email-templates/
```

---

## Before you start

**You need access to the GHL location** — the CRM workspace. Your credentials in `keys.txt`:

```
location_id  = xxxxxxxxxxxxxxxxxxxx
PIT (Private Integration Token) = pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# (real token lives in keys.txt locally — never commit it)
```

Sign in at https://app.gohighlevel.com (or your white-labeled URL) and switch to the location matching that ID.

---

## What you're building (mental model)

```
                                  ┌─── Bistro Bar Reservations ───┐
Booking submitted from website ──▶│  Pipeline                     │
                                  │  ┌──────┐ ┌──────┐ ┌────────┐ │
                                  │  │Booked│→│Seated│→│Done /  │ │
                                  │  └──────┘ └──────┘ │No-show │ │
                                  │                    └────────┘ │
                                  └────────────┬──────────────────┘
                                               ↓
                              ┌────────── Workflows ──────────┐
                              │ 1. Confirmation email (now)   │
                              │ 2. 24h reminder email         │
                              │ 3. 2h reminder email          │
                              │ 4. Cancellation email         │
                              │ 5. Post-visit review email    │
                              │ 6. Feedback acknowledgement   │
                              └───────────────────────────────┘
```

The **website** does the booking + writes to Supabase. The **server route** then makes 4 GHL API calls to:
1. Upsert the contact (phone is the dedup key)
2. Add tags + custom fields
3. Create the opportunity in `Booked` stage
4. **The workflow does the rest** — sends emails on its own based on tags.

---

## Status (2026-04-27)

| Step | File | Status | What's still manual |
|---|---|---|---|
| **1** | [`01-custom-fields.md`](./01-custom-fields.md) | ✅ All 7 fields created | None — see field-IDs map in the doc |
| **2** | [`02-pipeline.md`](./02-pipeline.md) | ✅ Existing pipeline mapped | (Optional) slim to 5 stages — instructions in doc |
| **3** | [`03-workflows.md`](./03-workflows.md) | ⚠️ 4 workflows exist — content NOT verified | You must open each workflow + verify trigger + replace email content |
| **4** | [`email-templates/README.md`](./email-templates/README.md) | ⚠️ Templates not imported | Manual paste — 10 min |

After all 4 steps, **collect the IDs** (pipeline ID, stage IDs) and put them in Vercel env vars (see the master [`automation/README.md`](../README.md)).

---

## How to find a GHL ID after creating something

GHL doesn't always show you the ID in the UI. To grab it:

1. Open the pipeline / opportunity in your browser
2. Look at the URL — IDs are in the path, e.g.,
   ```
   /v2/location/xxxxxxxxxxxxxxxxxxxx/opportunities/list/<pipeline_id>
   ```
3. Or inspect the request in browser DevTools → Network tab → look for any API call returning the entity. The `id` field is what you want.

You can also **ask me in this chat** — I can fetch them via the GHL MCP tools if those are enabled.

---

## Testing the full flow (after setup)

Once everything is wired:

1. Submit a fake booking from the website with your own email
2. You should receive the **Confirmation email** within ~30 seconds
3. Check GHL → **Contacts** — your contact should be there with tags `bistro-bar-guest` + `booking-{date}`
4. Check GHL → **Opportunities** → `Reservations` pipeline → your booking should be in `Booked` stage
5. (24h before slot) you'd receive reminder #1 — to test now, temporarily set the workflow delay to 1 minute

If any step fails, see the troubleshooting block at the bottom of [`03-workflows.md`](./03-workflows.md).
