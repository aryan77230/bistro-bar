import { describe, it, expect } from 'vitest';
import { feedbackSchema, createBookingSchema, availabilityQuerySchema } from './schemas';

describe('feedbackSchema', () => {
  const valid = { name: 'Alice', email: 'a@b.com', topic: 'feedback' as const, message: 'Loved the food.' };
  it('accepts valid', () => expect(feedbackSchema.safeParse(valid).success).toBe(true));
  it('rejects short name', () => expect(feedbackSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false));
  it('rejects bad email', () => expect(feedbackSchema.safeParse({ ...valid, email: 'x' }).success).toBe(false));
  it('rejects unknown topic', () => expect(feedbackSchema.safeParse({ ...valid, topic: 'spam' }).success).toBe(false));
  it('rejects short msg', () => expect(feedbackSchema.safeParse({ ...valid, message: 'no' }).success).toBe(false));
});

describe('createBookingSchema', () => {
  const base = {
    guest_name: 'Alice',
    guest_phone: '+919876543210',
    guest_email: 'a@b.com',
    party_size: 4,
    slot_starts_at: '2026-05-01T18:00:00.000Z',
    special_requests: 'window',
  };
  it('accepts valid', () => expect(createBookingSchema.safeParse(base).success).toBe(true));
  it('rejects party 0', () => expect(createBookingSchema.safeParse({ ...base, party_size: 0 }).success).toBe(false));
  it('rejects party 7', () => expect(createBookingSchema.safeParse({ ...base, party_size: 7 }).success).toBe(false));
  it('rejects bad phone', () => expect(createBookingSchema.safeParse({ ...base, guest_phone: 'abc' }).success).toBe(false));
  it('rejects bad iso', () => expect(createBookingSchema.safeParse({ ...base, slot_starts_at: 'tomorrow' }).success).toBe(false));
});

describe('availabilityQuerySchema', () => {
  it('coerces party to number', () => {
    const r = availabilityQuerySchema.safeParse({ date: '2026-05-01', party: '4' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.party).toBe(4);
  });
  it('rejects bad date', () => expect(availabilityQuerySchema.safeParse({ date: '01-05-2026', party: '4' }).success).toBe(false));
});
