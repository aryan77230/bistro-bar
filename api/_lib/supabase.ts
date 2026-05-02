import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from './env.js';

let serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client (service-role key — bypasses RLS).
 * Never import this from any file under src/.
 */
export function getSupabaseServer(): SupabaseClient {
  if (serverClient) return serverClient;
  const env = loadEnv();
  serverClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}
