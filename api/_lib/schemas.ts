import { z } from 'zod';

const phoneRegex = /^\+?[0-9]{7,15}$/;

export const feedbackSchema = z.object({
  name: z.string().min(2, 'name too short').max(120),
  email: z.string().email('invalid email').max(200),
  topic: z.enum(['feedback', 'reservation', 'press', 'other']),
  message: z.string().min(5, 'message too short').max(4000),
});
export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const createBookingSchema = z.object({
  guest_name: z.string().min(2).max(120),
  guest_phone: z.string().regex(phoneRegex, 'invalid phone'),
  guest_email: z.string().email().max(200).optional().or(z.literal('')),
  party_size: z.number().int().min(1).max(6),
  slot_starts_at: z.string().datetime({ offset: true }),
  special_requests: z.string().max(500).optional().or(z.literal('')),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  party: z.coerce.number().int().min(1).max(6),
});
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
