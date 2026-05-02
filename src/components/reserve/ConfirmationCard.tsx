import type { CreateBookingResponse } from '../../lib/api';

interface Props {
  booking: CreateBookingResponse;
  partySize: number;
}

export default function ConfirmationCard({ booking, partySize }: Props) {
  return (
    <div className="rounded-3xl border border-amber/40 bg-elevated/40 p-10 text-center shadow-[0_0_60px_-20px_rgba(212,165,96,0.45)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-amber">Reservation confirmed</p>
      <h2 className="mt-4 font-display text-4xl font-light italic text-ink">Your table is booked.</h2>
      <p className="mt-4 font-sans text-[15px] text-ink-dim">
        Check your email for the confirmation. We'll send a reminder 24h and 2h before your seating.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-y-3 text-left">
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Date</dt>
        <dd className="font-display text-lg text-ink">{booking.date_label}</dd>
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Time</dt>
        <dd className="font-display text-lg text-ink">{booking.time_label}</dd>
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Party</dt>
        <dd className="font-display text-lg text-ink">{partySize}</dd>
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Table</dt>
        <dd className="font-display text-lg text-ink">{booking.table_label}</dd>
      </dl>
      <a
        href={booking.cancel_url}
        className="mt-8 inline-block rounded-full border border-amber px-6 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-colors hover:bg-amber hover:text-base"
      >
        Manage Booking
      </a>
    </div>
  );
}
