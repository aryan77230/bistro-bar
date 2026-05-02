import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  GHL_LOCATION_ID: z.string().min(1),
  GHL_PIT: z.string().min(1),
  GHL_PIPELINE_ID: z.string().min(1),
  GHL_STAGE_BOOKED: z.string().min(1),
  GHL_STAGE_SEATED: z.string().min(1),
  GHL_STAGE_COMPLETED: z.string().min(1),
  GHL_STAGE_CANCELLED: z.string().min(1),
  GHL_STAGE_NOSHOW: z.string().min(1),
  GHL_FIELD_LAST_BOOKING_DATE: z.string().min(1),
  GHL_FIELD_BOOKING_TIME: z.string().min(1),
  GHL_FIELD_LAST_PARTY_SIZE: z.string().min(1),
  GHL_FIELD_TOTAL_VISITS: z.string().min(1),
  GHL_FIELD_CANCEL_LINK: z.string().min(1),
  GHL_FIELD_SPECIAL_REQUESTS: z.string().min(1),
  GHL_FIELD_TABLE_LABEL: z.string().min(1),
  PUBLIC_SITE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid environment: ${missing}`);
  }
  cached = result.data;
  return cached;
}

export function _resetEnvCache() {
  cached = null;
}
