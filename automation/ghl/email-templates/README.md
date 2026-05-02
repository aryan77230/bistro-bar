# Email Templates

6 production-ready HTML templates that match the Bistro Bar visual identity (dark base, amber accents, italic display type, monospace eyebrows).

---

## Templates

| File | Purpose | Triggered by |
|---|---|---|
| `01-booking-confirmation.html` | "Your table is booked" — sent immediately on booking | Workflow 1 |
| `02-reminder-24h.html` | Day-before nudge | Workflow 2 |
| `03-reminder-2h.html` | "We're prepping your table" | Workflow 3 |
| `04-cancelled.html` | Cancellation acknowledgement | Workflow 4 |
| `05-post-visit-review.html` | "How was your visit?" w/ Google review CTA | Workflow 5 |
| `06-feedback-acknowledgement.html` | "Thanks for the note" | Workflow 6 |

---

## How to import into GHL

GHL doesn't accept raw HTML files. You'll paste the **HTML content** into a new email template:

1. GHL sidebar → **Marketing** → **Emails** → **Templates** tab → **+ New** → **Blank Template**
2. **Name** the template exactly as in the table above (e.g., `01-booking-confirmation`) — workflow Step 3 expects these names
3. Click the **`< >`** (HTML / source code) icon in the editor toolbar — this is critical, the WYSIWYG view will mangle our layout
4. Open the corresponding `.html` file in this folder, **copy the entire contents**, paste into the HTML view
5. Click **Save**
6. Repeat for all 6 templates

> **Tip:** Some GHL skins call HTML mode "Custom Code Editor". Look for an icon that looks like `</>` or `{ }`.

---

## Merge tags used (must exist as custom fields)

All templates use these contact fields. Make sure they exist (see [`../01-custom-fields.md`](../01-custom-fields.md)):

| Tag in template | Custom field |
|---|---|
| `{{contact.first_name}}` | (built-in) |
| `{{contact.email}}` | (built-in) |
| `{{contact.last_booking_date}}` | Last Booking Date |
| `{{contact.booking_time}}` | Booking Time |
| `{{contact.last_party_size}}` | Last Party Size |
| `{{contact.cancel_link}}` | Cancel Link |
| `{{contact.special_requests}}` | Special Requests |
| `{{contact.table_label}}` | Table Label |
| `{{location.full_address}}` | (built-in — set via Settings → Business Profile) |
| `{{location.phone}}` | (built-in) |

---

## Test rendering before going live

GHL has a **Send Test** button at the top of the template editor. Use it to send each template to your own inbox before activating the workflows.

> Test emails will show literal `{{contact.first_name}}` because they have no contact context. To see merge tags resolve, instead trigger the workflow with a test contact (Workflow → Test Run → pick a contact).

---

## Brand spec (in case you edit)

| Token | Value |
|---|---|
| Background | `#0d0608` (page) / `#1A0B0E` (card) |
| Amber accent | `#D4A560` |
| Ink (primary text) | `#F5E7D0` |
| Ink dim (secondary) | `#C9B79B` |
| Muted | `#8B7E6F` |
| Display font (web-safe fallback) | `Georgia, 'Playfair Display', serif` |
| Body font | `'Helvetica Neue', Arial, sans-serif` |
| Mono eyebrow | `'Courier New', monospace` |

All templates use **table-based layout + inline CSS** (the only layout reliably supported in Outlook, Gmail, Yahoo, Apple Mail).
