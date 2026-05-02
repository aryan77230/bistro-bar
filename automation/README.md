# Bistro Bar — Automation & Backend Setup

End-to-end guide for wiring the website to **Supabase** (data) and **GoHighLevel** (CRM + email).

---

## What this repo does end-to-end

```
┌──────────────┐    booking/feedback    ┌──────────────┐    webhook     ┌──────────────┐
│  Website     │ ─────────────────────▶ │  Supabase    │ ─────────────▶ │  GoHighLevel │
│  (Vite +     │                        │  (Postgres + │                │  (CRM, email │
│   React)     │ ◀───── live avail ──── │   RPCs)      │                │   workflows) │
└──────────────┘                        └──────────────┘                └──────────────┘
```

- **Supabase** stores tables, bookings, and feedback submissions. All writes go through stored procedures (RPCs) so the anon key is safe to ship to the browser.
- **GHL** is the source of truth for guest profiles + every guest-facing email. The website never talks to an SMTP server.

---

## Setup order (do these in sequence, the first time)

| # | Step | Folder | Time |
|---|------|--------|------|
| 1 | Provision Supabase project + run migrations | [`supabase/`](./supabase/README.md) | ~10 min |
| 2 | Create GHL custom fields, pipeline, workflows | [`ghl/`](./ghl/README.md) | ~25 min |
| 3 | Upload email templates into GHL | [`ghl/email-templates/`](./ghl/email-templates/README.md) | ~10 min |
| 4 | Add env keys to Vercel + redeploy | (last section in this file) | ~5 min |

Don't skip. The Vercel env step depends on values you collected in 1 and 2.

---

## Required env vars (final step)

Once Supabase + GHL are configured, set these in **Vercel → Project Settings → Environment Variables** (Production + Preview + Development):

```bash
# === Supabase ===
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<publishable / anon key>
SUPABASE_SERVICE_ROLE_KEY=<secret service_role key — server-only, NEVER expose to client>

# === GoHighLevel ===
GHL_LOCATION_ID=xxxxxxxxxxxxxxxxxxxx
GHL_PIT=pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
GHL_PIPELINE_ID=<copy from GHL after creating Reservations pipeline — see ghl/02-pipeline.md>
GHL_STAGE_BOOKED=<copy from GHL>
GHL_STAGE_SEATED=<copy from GHL>
GHL_STAGE_COMPLETED=<copy from GHL>
GHL_STAGE_CANCELLED=<copy from GHL>
GHL_STAGE_NOSHOW=<copy from GHL>

# === Public site (used by the email templates as the cancel-link base) ===
PUBLIC_SITE_URL=https://bistro-bar-ui.vercel.app
```

After saving, **redeploy** so the new vars take effect.

---

## What lives where

```
automation/
├── README.md                       ← you are here
├── supabase/
│   ├── README.md                   ← run-this-then-this Supabase guide
│   ├── 01_schema.sql               ← tables + types + indexes
│   ├── 02_rls.sql                  ← row-level security
│   ├── 03_rpcs.sql                 ← stored procedures (called from website)
│   └── 04_seed.sql                 ← seed 9 tables (T1..T9)
└── ghl/
    ├── README.md                   ← GHL setup walkthrough (start here)
    ├── 01-custom-fields.md         ← contact custom fields (copy/paste)
    ├── 02-pipeline.md              ← Reservations pipeline + stages
    ├── 03-workflows.md             ← all 5 workflows step-by-step
    └── email-templates/
        ├── README.md               ← how to import templates into GHL
        ├── 01-booking-confirmation.html
        ├── 02-reminder-24h.html
        ├── 03-reminder-2h.html
        ├── 04-cancelled.html
        ├── 05-post-visit-review.html
        └── 06-feedback-acknowledgement.html
```

---

## Why email-only (no SMS)

- Twilio / phone number provisioning is paid + region-restricted (need DLT registration in India).
- GHL ships with email out of the box — no extra account, no per-message cost on most plans.
- Email handles long content (cancel links, calendar attachments, personalization) better than SMS.
- If the bar wants to add SMS later, GHL workflows can dual-channel without changing any code on the website.

---

## Manual steps you can't automate

These three things require a human in a browser, sorry:

1. **Custom fields in GHL** (one-time, 5 min) — see [`ghl/01-custom-fields.md`](./ghl/01-custom-fields.md)
2. **Pipeline + stages in GHL** (one-time, 5 min) — see [`ghl/02-pipeline.md`](./ghl/02-pipeline.md)
3. **Workflows + email templates in GHL** (one-time, 25 min) — see [`ghl/03-workflows.md`](./ghl/03-workflows.md)

Everything else (Supabase schema, RPCs, RLS, seed data) is SQL we run once via the Supabase SQL Editor or via the MCP.
