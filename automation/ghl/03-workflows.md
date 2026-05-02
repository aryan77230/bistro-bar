# Step 3 — Workflows (the email automations)

Build 6 workflows in GHL. Total time: ~25 minutes once. Each workflow follows the same pattern, so the first one is the longest — the rest are copy-paste.

> **Pre-flight check.** Before starting, confirm:
> - ✅ All 7 contact custom fields exist (see [`01-custom-fields.md`](./01-custom-fields.md))
> - ✅ Pipeline `Restaurant Sales Pipeline` has the 5 stages: `Reservation Confirmed`, `Checked In`, `Won - Completed`, `No Show`, `Cancelled` (see [`02-pipeline.md`](./02-pipeline.md))
> - ✅ All 6 email templates uploaded with `Bistro —` prefix (Marketing → Emails → Templates)
> - ✅ Sender domain verified in **Settings → Email Services** (otherwise emails won't deliver)

---

## The 6 workflows at a glance

| # | Workflow Name | Trigger | Email Template Used |
|---|---|---|---|
| 1 | `Bistro — 01 Booking Confirmation` | Tag `bistro-bar-guest` added | `Bistro — 01 Booking Confirmation` |
| 2 | `Bistro — 02 Reminder 24h Before` | Custom Date Reminder on `Last Booking Date`, 1 day before — fires at GHL default time | `Bistro — 02 Reminder 24h Before` |
| 3 | `Bistro — 03 Day-of Reminder` | Custom Date Reminder on `Last Booking Date`, 0 days before — fires same morning | `Bistro — 03 Reminder 2h Before` |
| 4 | `Bistro — 04 Cancellation` | Tag starts-with `cancelled-` added | `Bistro — 04 Cancellation Acknowledgement` |
| 5 | `Bistro — 05 Post-Visit Review` | Pipeline stage = `Won - Completed` | `Bistro — 05 Post-Visit Review` (after 24h delay) |
| 6 | `Bistro — 06 Feedback Acknowledgement` | Tag `feedback-submitted` added | `Bistro — 06 Feedback Acknowledgement` |
| 7 | `Bistro — 07 No-Show Recovery` | Pipeline stage = `No Show` | `Bistro — 07 No-Show Recovery` |

---

## How to navigate

Every workflow starts the same way:

1. **Sidebar → Automation → Workflows**
2. **+ Create Workflow** button (top-right)
3. **Start from Scratch** (don't pick a recipe)
4. Name the workflow as listed in the table above
5. Click **Save** at the top
6. Add trigger and actions as detailed below
7. Top-right toggle **Status: Draft** → **Status: Published**

---

## Workflow 1 — Booking Confirmation (immediate)

**Purpose:** Sends the confirmation email the moment someone completes the booking on the website.

### Trigger

- Click **"Add New Trigger"** in left panel
- Search and pick: **"Contact Tag"**
- Configure:
  - **Trigger Name:** Tag added — bistro-bar-guest
  - **Add Filters:** click **+ Add Filters**
    - **Filter:** `Tag` `is added`
    - **Tag:** select `bistro-bar-guest`
- Click **Save Trigger**

### Action — Send Email

- Click the `+` icon below the trigger box
- Pick **"Send Email"** (under "Communication" group)
- Configure:
  - **Action Name:** Send confirmation
  - **From Email:** your verified sender (e.g., `bistrobar@gmail.com`)
  - **From Name:** `Bistro Bar`
  - **Subject:** `Your table is booked, {{contact.first_name}}.`
  - **Email Builder:** click the **Templates** dropdown → select **`Bistro — 01 Booking Confirmation`**
  - Preview — verify merge tags are visible (they show as `{{contact.first_name}}` etc. in the editor)
- Click **Save Action**

### Publish

Top-right → toggle **Draft** → **Published**

---

## Workflow 2 — 24-hour Reminder

**Purpose:** Day-before nudge so guests don't forget.

### Trigger

- **+ Add New Trigger**
- Search and pick: **"Custom Date Reminder"**
- Configure:
  - **Trigger Name:** Reminder 24h before booking
  - **Filters** (use the **+ Add Filters** button — these are the only available options):
    - **Contact Date Field:** `Last Booking Date`
    - **Before no. of days:** `1`
    - **Has Tag:** `bistro-bar-guest`
- Click **Save Trigger**

> **About the fire time:** GHL's Custom Date Reminder doesn't expose a "specify time of day" option in this UI — it fires at GHL's default time (~9 AM in your location's timezone). For a 24h-before reminder, "the morning before" works perfectly.

> **About excluding cancelled bookings:** GHL doesn't expose a `does NOT have tag` filter on this trigger. We handle that with an If/Else inside the workflow (next section).

### Action 1 — If/Else (skip cancelled)

- Click `+` below the trigger box
- Pick **"If/Else"** (under Conditional)
- **Action Name:** has cancelled tag
- **Branch YES condition:**
  - Field: `Tags`
  - Operator: `Includes`
  - Value: `bistro-cancelled`
- Save

### Action 2 — End workflow on YES branch

- Click `+` under the **YES** path
- Pick **"End Workflow"** (under Workflow Actions)
- Save

### Action 3 — Send email on NO (None) branch

- Click `+` under the **None** / NO path
- Pick **"Send Email"**
- Configure:
  - **Subject:** `Tomorrow at Bistro Bar — see you {{contact.booking_time}}.`
  - **From Email:** your verified sender
  - **From Name:** `Bistro Bar`
  - **Template:** `Bistro — 02 Reminder 24h Before`
- Save

### Publish

Top-right toggle: **Draft → Published**.

---

## Workflow 3 — Day-of Reminder ("see you tonight")

**Purpose:** A same-day nudge — "we're prepping your table".

> **Important constraint to know first:** GHL's Custom Date Reminder triggers off a **DATE-only** field (`Last Booking Date`), not a datetime. The custom-field `Booking Time` is just text ("7:30 PM"), which GHL can't do math against. So GHL physically cannot fire "exactly 2 hours before each guest's individual slot start."
>
> Three honest options to choose from:
>
> | Option | Precision | Setup effort |
> |---|---|---|
> | **A. Static fire time, all slots** | Fires once at GHL's default time on the booking day for every guest | This doc |
> | **B. Multiple per-slot workflows** | 7 workflows, each filters by `Booking Time` value (`6:00 PM`, `6:30 PM`, etc.) | Tedious — 7 copies of the same workflow |
> | **C. Skip Workflow 3 entirely** | No same-day reminder at all | Just don't build it |
>
> **This guide builds Option A.** Most restaurants get good coverage from a single fire on the booking day; the email is framed as "we're prepping your table tonight" rather than a strict countdown.

### Trigger

- **+ Add New Trigger**
- Search and pick: **"Custom Date Reminder"**
- Configure:
  - **Trigger Name:** Reminder day-of
  - **Filters:**
    - **Contact Date Field:** `Last Booking Date`
    - **Before no. of days:** `0` (= same day)
    - **Has Tag:** `bistro-bar-guest`
- Save

### Actions (same If/Else pattern as Workflow #2)

1. **If/Else** with branch YES → `Tags Includes bistro-cancelled`
2. YES branch → **End Workflow**
3. NO (None) branch → **Send Email**:
   - **Subject:** `Tonight at Bistro Bar — your table is ready at {{contact.booking_time}}.`
   - **Template:** `Bistro — 03 Reminder 2h Before`

### Publish

Toggle to **Published**.

> **Final note on timing:** The day-of reminder will land in inboxes at GHL's default morning fire time (~9 AM IST). For an evening dining experience, that means guests get a "tonight" reminder at breakfast — clear, actionable, and not annoying. If you'd rather it land closer to the booking (e.g., afternoon), open the trigger after creation and look for any "send time" option that may appear; otherwise live with default-morning.

---

## Workflow 4 — Cancellation Acknowledgement

**Purpose:** Confirms cancellation as soon as the user clicks "Cancel reservation" on the website.

> **How tagging works:** Our cancel API adds **two** tags to the contact: a constant `bistro-cancelled` (for triggering this workflow) and a date-suffixed `cancelled-{YYYY-MM-DD}` (purely for history). Trigger only on the constant — clean and reliable.

### Trigger

- **+ Add New Trigger**
- Search and pick: **"Contact Tag"**
- Configure:
  - **Trigger Name:** Tag added — bistro-cancelled
  - **Tag Action:** `Tag added`
  - **Tag:** select `bistro-cancelled`
- Save

### Action — Send Email

- `+` → **Send Email**
- **Subject:** `Your booking is cancelled.`
- **Template:** `Bistro — 04 Cancellation Acknowledgement`
- Save

### Publish

Toggle to **Published**.

---

## Workflow 5 — Post-Visit Review Request

**Purpose:** When staff drag the opportunity to `Won - Completed` (after the guest has dined and left), trigger a thank-you + review-ask email 24 hours later.

### Trigger

- **+ Add New Trigger**
- Search and pick: **"Pipeline Stage Changed"** (sometimes called "Opportunity Status Changed")
- Configure:
  - **Trigger Name:** Visit completed
  - **Pipeline:** `Restaurant Sales Pipeline`
  - **Stage From:** `Any` (or leave blank)
  - **Stage To:** `Won - Completed`
- Save

### Action 1 — Wait

- `+` → **"Wait"** (under "Conditional" or "Timer" group)
- Configure:
  - **Wait For:** `1 day`
- Save

### Action 2 — Send Email

- `+` → **Send Email**
- **Subject:** `How was Bistro Bar, {{contact.first_name}}?`
- **Template:** `Bistro — 05 Post-Visit Review`
- Save

### Publish

Toggle to **Published**.

> **Customize the review CTA:** the template has a placeholder Google review link (`https://g.page/r/CN_BISTRO_BAR_GOOGLE_REVIEW_LINK/review`). Edit the template once via Marketing → Emails → Templates → click `Bistro — 05 Post-Visit Review` → HTML view → find that URL → replace with your actual Google Business profile review link.

---

## Workflow 6 — Feedback Form Acknowledgement

**Purpose:** Confirms the feedback form submission, lets the guest know a human will read it.

### Trigger

- **+ Add New Trigger**
- Search and pick: **"Contact Tag"**
- Configure:
  - **Trigger Name:** Tag added — feedback-submitted
  - **Tag Action:** `Tag added`
  - **Tag:** `feedback-submitted`
- Save

### Action 1 — Send Email

- `+` → **Send Email**
- **Subject:** `Thanks for the note, {{contact.first_name}}.`
- **Template:** `Bistro — 06 Feedback Acknowledgement`
- Save

### Action 2 (optional) — Internal Notification

- `+` → **"Internal Notification"** or **"Send Internal Email"**
- **Send To:** the bar manager's email (e.g., `info@bistrobar.com`)
- **Subject:** `New feedback from {{contact.first_name}}`
- **Body:**
  ```
  New feedback submitted via the website.
  
  Name: {{contact.first_name}} {{contact.last_name}}
  Email: {{contact.email}}
  Phone: {{contact.phone}}
  ```
- Save

### Publish

Toggle to **Published**.

---

## Workflow 7 — No-Show Recovery

**Purpose:** When staff drag the opportunity to `No Show` (because the guest didn't arrive), send a gentle "we missed you, come back anytime" email with a small return-incentive code.

### Trigger

- **+ Add New Trigger**
- Search and pick: **"Pipeline Stage Changed"** (sometimes called "Opportunity Status Changed")
- Configure:
  - **Trigger Name:** No-show recovery
  - **Pipeline:** `Restaurant Sales Pipeline`
  - **Stage From:** `Any` (or leave blank)
  - **Stage To:** `No Show`
- Save

### Action 1 — Wait

A short delay so the email doesn't fire the literal second staff click — gives time for "actually they just walked in late" corrections.

- Click `+` below the trigger box
- Pick **"Wait"** (under Conditional or Timer group)
- Configure:
  - **Wait For:** `1 hour`
- Save

### Action 2 — If/Else (skip if they actually checked in after the no-show was marked)

Optional but recommended — if staff accidentally moved to No Show then back to Checked In, this skips the email.

- `+` → **"If/Else"**
- **Action Name:** still in no-show stage
- **Branch YES condition:**
  - Field: `Opportunity Stage`
  - Operator: `Equals`
  - Value: `No Show`
- Save

### Action 3 — Send Email (YES branch only)

- Click `+` under the **YES** branch
- Pick **"Send Email"**
- Configure:
  - **Subject:** `We held your table tonight, {{contact.first_name}}.`
  - **From Email:** your verified sender
  - **From Name:** `Bistro Bar`
  - **Template:** `Bistro — 07 No-Show Recovery`
- Save

### Action 4 — End workflow on NO branch

- `+` under the **None** / NO branch → **"End Workflow"**
- Save

### Publish

Toggle to **Published**.

> **Customize the comp code:** the template uses `WELCOMEBACK` as the appetizer comp code. If you'd rather not offer a freebie (or want a different code/discount), open Marketing → Emails → Templates → `Bistro — 07 No-Show Recovery` → edit the HTML → find `WELCOMEBACK` → replace with your wording. Keep the dashed border box for visual punch.

---

## Tag system reference (what tags trigger what)

| Tag added | Set by | Triggers workflow |
|---|---|---|
| `bistro-bar-guest` | API: `/api/bookings` | #1 (immediate confirmation) |
| `booking-{YYYY-MM-DD}` | API: `/api/bookings` | (informational, no trigger) |
| `bistro-cancelled` (constant) | API: `/api/bookings/{token}/cancel` | #4 (cancellation ack) |
| `cancelled-{YYYY-MM-DD}` | API: `/api/bookings/{token}/cancel` | (informational, no trigger) |
| `feedback-submitted` | API: `/api/feedback` | #6 (feedback ack) |
| Stage move → `Won - Completed` | Manual drag in GHL Opportunities | #5 (post-visit review) |
| Stage move → `No Show` | Manual drag in GHL Opportunities | #7 (no-show recovery) |

---

## End-to-end smoke test

After publishing all 6:

1. **Make a real booking** at http://localhost:3000/reserve with a real email you can check
   - **Expected:** within 30s — email #1 (confirmation) lands in your inbox
2. **Submit the feedback form** at http://localhost:3000/contact with the same email
   - **Expected:** within 30s — email #6 (acknowledgement) lands
3. **Cancel the booking** at the cancel link
   - **Expected:** within 30s — email #4 (cancellation) lands
4. **Manually move an opportunity to `Won - Completed`** in GHL Opportunities (use a test booking that hasn't been cancelled)
   - **Expected:** 24h later — email #5 (post-visit review) lands

If any step fails, see "Troubleshooting" below.

---

## Troubleshooting

**Email never arrives**
- GHL → **Conversations** → search the contact → does the email appear with status `Sent`?
- If `Failed`: sender domain isn't verified. Settings → Email Services → verify SPF/DKIM/DMARC.
- If `Sent` but not received: check spam folder. Domain auth fixes deliverability.

**Tag added but workflow didn't trigger**
- Workflow → Settings (top-right) → confirm **Status: Published** (not Draft)
- Workflow → click the **clock icon** at top → execution log shows every fire attempt for the last 7 days
- Tag spelling must match exactly (case-sensitive)

**Reminder fires at the wrong time**
- GHL stores times in the location's timezone
- Settings → **Business Profile** → confirm Timezone = `Asia/Kolkata`

**Custom field merge tags show as literals (e.g., `{{contact.party_size}}`)**
- The merge-tag key in the email template doesn't match GHL's auto-generated field key
- Open Settings → Custom Fields → click the field → check "Field Key"
- Must match exactly: lowercase, snake_case, no spaces

**Workflow #5 fires for the wrong opportunities**
- Make sure the trigger has **Stage To = `Won - Completed`** specifically
- Cancelled opportunities go through `Cancelled` stage, not `Won - Completed`, so they won't fire #5

**You see two confirmation emails per booking**
- You probably created Workflow #1 twice (or there's an old `New Reservation Flow` still published)
- Disable/delete the duplicate

---

## What we deliberately skipped (and why)

| Skipped | Reason |
|---|---|
| SMS workflows | Email-only, per design (no Twilio cost, no DLT registration) |
| `No Show` follow-up email | Not in the 6-template plan; can be added later as Workflow 7 if desired |
| Birthday / anniversary triggers | Custom fields exist (`Birthday Month`, `Guest Anniversary`) but workflows are out of v1 scope |
| Loyalty / VIP tier | Same — `Total Visits` is tracked, but no auto-tier workflow yet |

Add these as workflows 7+ once the core flow proves out.

---

✅ All 6 workflows published. The Bistro Bar booking system is now fully wired:
**website → Supabase → GHL → email**, end-to-end.
