import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from '../../_lib/supabase.js';
import { addTags, moveOpportunityToCancelled } from '../../_lib/ghl.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = String(req.query.token ?? '');
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(token)) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('cancel_booking', { p_token: token });
  if (error) {
    console.error('[cancel] rpc error', error);
    return res.status(500).json({ error: 'cancel_failed' });
  }

  const row = data?.[0];
  if (!row?.success) {
    const reason = row?.message ?? 'unknown';
    const status = /not found/.test(reason) ? 404 : /too late/.test(reason) ? 409 : 400;
    return res.status(status).json({ ok: false, reason });
  }

  if (row.ghl_contact_id) {
    const isoDate = new Date().toISOString().slice(0, 10);
    // Two tags: a constant `bistro-cancelled` for GHL workflow triggering
    // (since GHL tag filters don't support starts-with patterns), and a
    // date-suffixed `cancelled-{date}` purely for human-readable history.
    try { await addTags(row.ghl_contact_id, ['bistro-cancelled', `cancelled-${isoDate}`]); }
    catch (e) { console.error('[cancel] addTags failed', e); }
  }

  const { data: bookingData } = await supabase
    .from('bookings')
    .select('ghl_opportunity_id')
    .eq('id', row.booking_id)
    .single();
  if (bookingData?.ghl_opportunity_id) {
    try { await moveOpportunityToCancelled(bookingData.ghl_opportunity_id); }
    catch (e) { console.error('[cancel] move opp failed', e); }
  }

  return res.status(200).json({ ok: true });
}
