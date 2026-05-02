import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from '../../_lib/supabase.js';
import { formatBookingDate, formatBookingTime } from '../../_lib/format.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = String(req.query.token ?? '');
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(token)) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('get_booking_by_token', { p_token: token });
  if (error) {
    console.error('[booking-by-token] rpc error', error);
    return res.status(500).json({ error: 'lookup_failed' });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'not_found' });
  }

  const b = data[0];
  return res.status(200).json({
    ok: true,
    booking: {
      guest_name: b.guest_name,
      party_size: b.party_size,
      table_label: b.table_label,
      status: b.status,
      special_requests: b.special_requests,
      can_cancel: b.can_cancel,
      slot_starts_at: b.slot_starts_at,
      slot_ends_at: b.slot_ends_at,
      date_label: formatBookingDate(b.slot_starts_at),
      time_label: formatBookingTime(b.slot_starts_at),
    },
  });
}
