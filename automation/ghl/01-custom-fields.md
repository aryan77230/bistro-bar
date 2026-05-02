# Step 1 — Custom Fields on Contact

These 7 fields hold per-guest reservation data that the email templates personalize on. Without them the emails will say "Your booking on  at " with empty merge tags.

> **Status (verified 2026-04-27):** All 7 required fields are **already created** in your location `xxxxxxxxxxxxxxxxxxxx`. This document is now reference-only — read it for the field-key map at the bottom (used inside email templates and `.env.local`).

---

## Verification

Run this against the GHL API (or use the `get_location_custom_fields` MCP tool) to confirm the 7 fields below exist on the contact model. They were created/discovered during the 2026-04-27 setup.

---

## Required fields & their actual IDs

| # | Field Name | Type | Folder | ID | Source |
|---|---|---|---|---|---|
| 1 | `Last Booking Date` | DATE | Reservations | `xxxxxxxxxxxxxxxxxxxx` | created earlier |
| 2 | `Booking Time` | TEXT (Single Line) | Reservations | `xxxxxxxxxxxxxxxxxxxx` | created earlier |
| 3 | `Party Size` *(used as Last Party Size)* | NUMERICAL | (legacy folder) | `xxxxxxxxxxxxxxxxxxxx` | reused existing field |
| 4 | `Total Visits` | NUMERICAL | (auto folder) | `xxxxxxxxxxxxxxxxxxxx` | created via MCP 2026-04-27 |
| 5 | `Cancel Link` | TEXT (Single Line) | (auto folder) | `xxxxxxxxxxxxxxxxxxxx` | created via MCP 2026-04-27 |
| 6 | `Special Requests` | LARGE_TEXT (Multi Line) | (auto folder) | `xxxxxxxxxxxxxxxxxxxx` | created via MCP 2026-04-27 |
| 7 | `Table Label` | TEXT (Single Line) | (auto folder) | `xxxxxxxxxxxxxxxxxxxx` | created via MCP 2026-04-27 |

> **Folder note.** GHL placed the 4 newly-created fields into a default folder (`qUFjP6b2w4WEhh43OkfP`) instead of the existing `Reservations` folder (`mlipLolrwyZi9hQ2LBPr`) where `Last Booking Date` + `Booking Time` live. This is purely organizational — fields work the same. If you want them grouped, drag-drop in GHL Settings → Custom Fields.

---

## Merge-tag reference (used by email templates)

The HTML email templates in `automation/ghl/email-templates/` reference these contact merge-tags. These are auto-derived from the field name:

| Display name | Merge tag in template |
|---|---|
| Last Booking Date | `{{contact.last_booking_date}}` |
| Booking Time | `{{contact.booking_time}}` |
| Party Size *(reused as Last Party Size)* | `{{contact.party_size}}` ⚠️ |
| Total Visits | `{{contact.total_visits}}` |
| Cancel Link | `{{contact.cancel_link}}` |
| Special Requests | `{{contact.special_requests}}` |
| Table Label | `{{contact.table_label}}` |

> ⚠️ **Important:** the email templates currently use `{{contact.last_party_size}}`. Since we reused the existing `Party Size` field (key = `party_size`, not `last_party_size`), you must EITHER:
> - Edit each email template to use `{{contact.party_size}}` instead, OR
> - Rename the GHL field from "Party Size" → "Last Party Size" so its auto-key becomes `last_party_size`
>
> The first option is faster. Do it once when importing templates.

---

## Field-IDs in `.env.local`

Already populated:

```bash
GHL_FIELD_LAST_BOOKING_DATE=xxxxxxxxxxxxxxxxxxxx
GHL_FIELD_BOOKING_TIME=xxxxxxxxxxxxxxxxxxxx
GHL_FIELD_LAST_PARTY_SIZE=xxxxxxxxxxxxxxxxxxxx
GHL_FIELD_TOTAL_VISITS=xxxxxxxxxxxxxxxxxxxx
GHL_FIELD_CANCEL_LINK=xxxxxxxxxxxxxxxxxxxx
GHL_FIELD_SPECIAL_REQUESTS=xxxxxxxxxxxxxxxxxxxx
GHL_FIELD_TABLE_LABEL=xxxxxxxxxxxxxxxxxxxx
```

✅ Done. Move on to [`02-pipeline.md`](./02-pipeline.md).
