import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBookingSchema } from '../_lib/schemas.js';
import { getSupabaseServer } from '../_lib/supabase.js';
import { upsertContact, updateContactFields, createOpportunity } from '../_lib/ghl.js';
import { formatBookingDate, formatBookingTime } from '../_lib/format.js';
import { loadEnv } from '../_lib/env.js';

const AVG_SPEND_PER_GUEST = 1500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', issues: parsed.error.errors });
  }
  const { guest_name, guest_phone, guest_email, party_size, slot_starts_at, special_requests } = parsed.data;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('create_booking', {
    p_guest_name: guest_name,
    p_guest_phone: guest_phone,
    p_guest_email: guest_email || null,
    p_party_size: party_size,
    p_slot_starts_at: slot_starts_at,
    p_special_requests: special_requests || null,
  });

  if (error) {
    console.error('[bookings] create_booking rpc error', error);
    if (/no tables available/i.test(error.message)) {
      return res.status(409).json({ error: 'no_tables_available' });
    }
    if (/slot must be|party_size/.test(error.message)) {
      return res.status(400).json({ error: 'invalid_slot', detail: error.message });
    }
    return res.status(500).json({ error: 'create_failed' });
  }

  const row = data?.[0];
  if (!row) return res.status(500).json({ error: 'no_row_returned' });
  const { booking_id, cancel_token, table_label } = row as { booking_id: string; cancel_token: string; table_label: string };

  const env = loadEnv();
  const cancelLink = `${env.PUBLIC_SITE_URL}/b/${cancel_token}`;
  const dateLabel = formatBookingDate(slot_starts_at);
  const timeLabel = formatBookingTime(slot_starts_at);
  const isoDate = slot_starts_at.slice(0, 10);

  const [firstName, ...rest] = guest_name.trim().split(/\s+/);
  const lastName = rest.join(' ') || undefined;

  try {
    const contactId = await upsertContact({
      firstName,
      lastName,
      email: guest_email || undefined,
      phone: guest_phone,
      tags: ['bistro-bar-guest', `booking-${isoDate}`],
    });

    await updateContactFields(contactId, {
      lastBookingDate: isoDate,
      bookingTime: timeLabel,
      lastPartySize: party_size,
      cancelLink,
      specialRequests: special_requests || '',
      tableLabel: table_label,
    });

    const opportunityId = await createOpportunity({
      contactId,
      name: `${guest_name} — ${dateLabel} ${timeLabel}`,
      monetaryValue: party_size * AVG_SPEND_PER_GUEST,
    });

    await supabase.rpc('set_booking_ghl_ids', {
      p_booking_id: booking_id,
      p_ghl_contact_id: contactId,
      p_ghl_opportunity_id: opportunityId,
    });
  } catch (e) {
    console.error('[bookings] GHL sync failed (booking still saved)', e);
  }

  return res.status(200).json({
    ok: true,
    booking_id,
    cancel_token,
    cancel_url: cancelLink,
    table_label,
    date_label: dateLabel,
    time_label: timeLabel,
  });
}
