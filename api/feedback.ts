import type { VercelRequest, VercelResponse } from '@vercel/node';
import { feedbackSchema } from './_lib/schemas.js';
import { getSupabaseServer } from './_lib/supabase.js';
import { upsertContact } from './_lib/ghl.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'validation_failed',
      issues: parsed.error.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }
  const { name, email, topic, message } = parsed.data;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('submit_feedback', {
    p_name: name, p_email: email, p_topic: topic, p_message: message,
  });
  if (error) {
    console.error('[feedback] supabase rpc error', error);
    return res.status(500).json({ error: 'storage_failed' });
  }
  const feedbackId = data?.[0]?.feedback_id ?? null;

  try {
    // Pass only email — GHL dedupes on email when no phone is provided.
    // (Earlier we faked phone=email which GHL rejects as a non-phone string.)
    await upsertContact({
      firstName: name,
      email,
      tags: ['feedback-submitted', `topic-${topic}`],
    });
  } catch (e) {
    console.error('[feedback] ghl upsert failed (non-fatal)', e);
  }

  return res.status(200).json({ ok: true, feedback_id: feedbackId });
}
