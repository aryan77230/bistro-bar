import type { VercelRequest, VercelResponse } from '@vercel/node';
import { availabilityQuerySchema } from './_lib/schemas.js';
import { getSupabaseServer } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = availabilityQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', issues: parsed.error.errors });
  }
  const { date, party } = parsed.data;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('get_availability', {
    p_date: date,
    p_party_size: party,
  });
  if (error) {
    console.error('[availability] rpc error', error);
    return res.status(500).json({ error: 'lookup_failed' });
  }

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=30');
  return res.status(200).json({ slots: data ?? [] });
}
