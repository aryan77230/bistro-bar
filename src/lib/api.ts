interface AvailabilitySlot {
  slot_starts_at: string;
  tables_left: number;
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
}

export interface CreateBookingRequest {
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  party_size: number;
  slot_starts_at: string;
  special_requests?: string;
}

export interface CreateBookingResponse {
  ok: true;
  booking_id: string;
  cancel_token: string;
  cancel_url: string;
  table_label: string;
  date_label: string;
  time_label: string;
}

export interface GetBookingResponse {
  ok: true;
  booking: {
    guest_name: string;
    party_size: number;
    table_label: string;
    status: 'booked' | 'seated' | 'completed' | 'cancelled' | 'no_show';
    special_requests: string | null;
    can_cancel: boolean;
    slot_starts_at: string;
    slot_ends_at: string;
    date_label: string;
    time_label: string;
  };
}

export interface FeedbackRequest {
  name: string;
  email: string;
  topic: 'feedback' | 'reservation' | 'press' | 'other';
  message: string;
}

class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, json.error ?? 'unknown_error', json.detail);
  }
  return json as T;
}

export function getAvailability(date: string, party: number): Promise<AvailabilityResponse> {
  return apiFetch<AvailabilityResponse>(`/api/availability?date=${date}&party=${party}`);
}

export function createBooking(input: CreateBookingRequest): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getBookingByToken(token: string): Promise<GetBookingResponse> {
  return apiFetch<GetBookingResponse>(`/api/bookings/${encodeURIComponent(token)}`);
}

export function cancelBooking(token: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/bookings/${encodeURIComponent(token)}/cancel`, {
    method: 'POST',
  });
}

export function submitFeedback(input: FeedbackRequest): Promise<{ ok: true; feedback_id: string }> {
  return apiFetch<{ ok: true; feedback_id: string }>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export { ApiError };
