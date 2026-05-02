import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../components/sections/Nav';
import Footer from '../components/sections/Footer';
import {
  getBookingByToken,
  cancelBooking,
  type GetBookingResponse,
  ApiError,
} from '../lib/api';

type State =
  | { status: 'loading' }
  | { status: 'loaded'; booking: GetBookingResponse['booking'] }
  | { status: 'cancelling'; booking: GetBookingResponse['booking'] }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

export default function CancelBookingPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', message: 'Missing token.' });
      return;
    }
    getBookingByToken(token)
      .then((res) => setState({ status: 'loaded', booking: res.booking }))
      .catch((e: unknown) =>
        setState({
          status: 'error',
          message:
            e instanceof ApiError && e.status === 404
              ? "This booking link isn't valid."
              : "Couldn't load booking.",
        })
      );
  }, [token]);

  const onCancel = async () => {
    if (!token || state.status !== 'loaded') return;
    setState({ status: 'cancelling', booking: state.booking });
    try {
      await cancelBooking(token);
      setState({ status: 'cancelled' });
    } catch (e: unknown) {
      setState({
        status: 'error',
        message:
          e instanceof ApiError && /too late/i.test(e.code)
            ? 'Too late to cancel online — please call us.'
            : "Couldn't cancel. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-32 pb-24 md:px-10">
        {state.status === 'loading' && (
          <p className="font-mono text-xs text-ink-dim">Loading…</p>
        )}

        {state.status === 'error' && (
          <div className="rounded-3xl border border-amber/30 bg-elevated/40 p-10 text-center">
            <h2 className="font-display text-3xl italic text-ink">{state.message}</h2>
          </div>
        )}

        {(state.status === 'loaded' || state.status === 'cancelling') && (
          <div className="rounded-3xl border border-amber/30 bg-elevated/40 p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-amber">
              Your reservation
            </p>
            <h2 className="mt-4 font-display text-4xl font-light italic text-ink">
              Hi {state.booking.guest_name}.
            </h2>
            <p className="mt-4 font-sans text-[15px] text-ink-dim">
              {state.booking.status === 'cancelled'
                ? 'This booking has already been cancelled.'
                : `We have you booked for ${state.booking.party_size} on ${state.booking.date_label} at ${state.booking.time_label} (Table ${state.booking.table_label}).`}
            </p>
            {state.booking.status === 'booked' && (
              <div className="mt-8 flex flex-col items-start gap-3">
                {state.booking.can_cancel ? (
                  <button
                    onClick={onCancel}
                    disabled={state.status === 'cancelling'}
                    className="rounded-full border border-amber px-6 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-colors hover:bg-amber hover:text-base disabled:opacity-50"
                  >
                    {state.status === 'cancelling' ? 'Cancelling…' : 'Cancel reservation'}
                  </button>
                ) : (
                  <p className="font-mono text-xs text-ink-dim">
                    Less than 24h remaining — please call us to cancel.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {state.status === 'cancelled' && (
          <div className="rounded-3xl border border-amber/30 bg-elevated/40 p-10 text-center">
            <h2 className="font-display text-3xl italic text-ink">Cancelled.</h2>
            <p className="mt-3 font-sans text-[15px] text-ink-dim">
              We've freed up the table. We'll miss you — come back soon.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
