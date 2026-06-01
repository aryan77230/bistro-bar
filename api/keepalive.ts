import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from('tables').select('label').limit(1);

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, sampled: data?.[0]?.label ?? null, ts: new Date().toISOString() });
}
