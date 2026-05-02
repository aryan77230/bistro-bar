import { describe, it, expect } from 'vitest';
import { formatBookingDate, formatBookingTime, slotEndsAt } from './format';

describe('formatBookingDate', () => {
  it('formats in IST', () => {
    expect(formatBookingDate('2026-05-01T12:30:00.000Z')).toBe('1 May 2026');
  });
});

describe('formatBookingTime', () => {
  it('6:00 PM IST', () => {
    expect(formatBookingTime('2026-05-01T12:30:00.000Z')).toBe('6:00 PM');
  });
  it('9:00 PM IST', () => {
    expect(formatBookingTime('2026-05-01T15:30:00.000Z')).toBe('9:00 PM');
  });
});

describe('slotEndsAt', () => {
  it('+120 min', () => {
    const end = slotEndsAt(new Date('2026-05-01T12:30:00.000Z'));
    expect(end.toISOString()).toBe('2026-05-01T14:30:00.000Z');
  });
});
