import { loadEnv } from './env.js';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function authHeaders() {
  const env = loadEnv();
  return {
    Authorization: `Bearer ${env.GHL_PIT}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function ghlFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {
      // body not readable — drop detail
    }
    throw new Error(`GHL ${path} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as T;
}

// ────────────── Contacts ──────────────

export interface UpsertContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** At least one of `email` or `phone` must be set (GHL dedup key). */
  phone?: string;
  tags?: string[];
}

export async function upsertContact(input: UpsertContactInput): Promise<string> {
  const env = loadEnv();
  try {
    const data = await ghlFetch<{ contact: { id: string } }>('/contacts/upsert', {
      method: 'POST',
      body: JSON.stringify({
        locationId: env.GHL_LOCATION_ID,
        source: 'website',
        ...input,
      }),
    });
    return data.contact.id;
  } catch (e) {
    throw new Error(`GHL upsert failed: ${(e as Error).message}`);
  }
}

export async function addTags(contactId: string, tags: string[]): Promise<void> {
  await ghlFetch(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
}

export interface ContactFields {
  lastBookingDate?: string;
  bookingTime?: string;
  lastPartySize?: number;
  totalVisits?: number;
  cancelLink?: string;
  specialRequests?: string;
  tableLabel?: string;
}

export async function updateContactFields(contactId: string, fields: ContactFields): Promise<void> {
  const env = loadEnv();
  const customFields: Array<{ id: string; value: unknown }> = [];
  if (fields.lastBookingDate !== undefined) customFields.push({ id: env.GHL_FIELD_LAST_BOOKING_DATE, value: fields.lastBookingDate });
  if (fields.bookingTime !== undefined)     customFields.push({ id: env.GHL_FIELD_BOOKING_TIME, value: fields.bookingTime });
  if (fields.lastPartySize !== undefined)   customFields.push({ id: env.GHL_FIELD_LAST_PARTY_SIZE, value: fields.lastPartySize });
  if (fields.totalVisits !== undefined)     customFields.push({ id: env.GHL_FIELD_TOTAL_VISITS, value: fields.totalVisits });
  if (fields.cancelLink !== undefined)      customFields.push({ id: env.GHL_FIELD_CANCEL_LINK, value: fields.cancelLink });
  if (fields.specialRequests !== undefined) customFields.push({ id: env.GHL_FIELD_SPECIAL_REQUESTS, value: fields.specialRequests });
  if (fields.tableLabel !== undefined)      customFields.push({ id: env.GHL_FIELD_TABLE_LABEL, value: fields.tableLabel });

  if (customFields.length === 0) return;

  await ghlFetch(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify({ customFields }),
  });
}

// ────────────── Opportunities ──────────────

export interface CreateOpportunityInput {
  contactId: string;
  name: string;
  monetaryValue?: number;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
}

/**
 * Upsert an opportunity for a contact in our pipeline.
 *
 * GHL refuses to create a second opportunity for the same contact in the
 * same pipeline (even if the existing one is cancelled). So we use the
 * upsert endpoint which:
 *   - creates a new opportunity if the contact has none in this pipeline
 *   - reuses + updates the existing one if there is one (re-booking case)
 *
 * Cancellation history stays preserved in the contact tags
 * (`cancelled-{date}` is added on each cancel), even though the opportunity
 * row itself gets repurposed for the new booking.
 */
export async function upsertOpportunity(input: CreateOpportunityInput): Promise<string> {
  const env = loadEnv();
  const data = await ghlFetch<{ opportunity: { id: string } }>('/opportunities/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId: env.GHL_LOCATION_ID,
      pipelineId: env.GHL_PIPELINE_ID,
      pipelineStageId: env.GHL_STAGE_BOOKED,
      status: input.status ?? 'open',
      contactId: input.contactId,
      name: input.name,
      monetaryValue: input.monetaryValue ?? 0,
    }),
  });
  return data.opportunity.id;
}

// Backwards-compat alias — bookings handler still calls this name
export const createOpportunity = upsertOpportunity;

export async function moveOpportunityToCancelled(opportunityId: string): Promise<void> {
  const env = loadEnv();
  await ghlFetch(`/opportunities/${opportunityId}`, {
    method: 'PUT',
    body: JSON.stringify({
      pipelineId: env.GHL_PIPELINE_ID,
      pipelineStageId: env.GHL_STAGE_CANCELLED,
      status: 'abandoned',
    }),
  });
}
