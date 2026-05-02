import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Nav from '../components/sections/Nav';
import Footer from '../components/sections/Footer';
import DatePicker from '../components/reserve/DatePicker';
import PartySizePicker from '../components/reserve/PartySizePicker';
import TimeSlotGrid from '../components/reserve/TimeSlotGrid';
import DetailsForm, { type Details } from '../components/reserve/DetailsForm';
import ConfirmationCard from '../components/reserve/ConfirmationCard';
import { createBooking, ApiError, type CreateBookingResponse } from '../lib/api';

type Step = 'date' | 'party' | 'time' | 'details' | 'done';

export default function ReservePage() {
  const [step, setStep] = useState<Step>('date');
  const [date, setDate] = useState<string | null>(null);
  const [party, setParty] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<CreateBookingResponse | null>(null);

  const submit = async (d: Details) => {
    if (!slot || !party) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createBooking({
        guest_name: d.name,
        guest_phone: d.phone.replace(/[^\d+]/g, ''),
        guest_email: d.email,
        party_size: party,
        slot_starts_at: slot,
        special_requests: d.notes || undefined,
      });
      setConfirmed(res);
      setStep('done');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'no_tables_available') {
        setError('That slot just filled. Pick another time?');
        setStep('time');
      } else {
        setError('Something went wrong. Please try again or call us.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24 md:px-10">
        {step !== 'done' && (
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">Reserve a Table</span>
            <span className="h-[1px] w-10 bg-amber" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'date' && (
            <motion.section
              key="date"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="mb-8 text-center font-display text-4xl font-light italic text-ink">Pick a date.</h1>
              <DatePicker
                value={date}
                onChange={(d) => {
                  setDate(d);
                  setStep('party');
                }}
              />
            </motion.section>
          )}

          {step === 'party' && (
            <motion.section
              key="party"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="mb-8 text-center font-display text-4xl font-light italic text-ink">How many of you?</h1>
              <PartySizePicker
                value={party}
                onChange={(n) => {
                  setParty(n);
                  setStep('time');
                }}
              />
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setStep('date')}
                  className="rounded-full border border-amber/50 bg-elevated/40 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.28em] text-amber transition-colors duration-150 hover:-translate-y-[2px] hover:border-amber hover:bg-amber hover:text-base hover:shadow-[0_10px_28px_-12px_rgba(212,165,96,0.55)]"
                >
                  ← Change date
                </button>
              </div>
            </motion.section>
          )}

          {step === 'time' && date && party && (
            <motion.section
              key="time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="mb-8 text-center font-display text-4xl font-light italic text-ink">When?</h1>
              <TimeSlotGrid
                date={date}
                party={party}
                value={slot}
                onChange={(iso) => {
                  setSlot(iso);
                  setStep('details');
                }}
              />
              {error && <p className="mt-4 font-mono text-xs text-amber/80">{error}</p>}
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setStep('party')}
                  className="rounded-full border border-amber/50 bg-elevated/40 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.28em] text-amber transition-colors duration-150 hover:-translate-y-[2px] hover:border-amber hover:bg-amber hover:text-base hover:shadow-[0_10px_28px_-12px_rgba(212,165,96,0.55)]"
                >
                  ← Change party size
                </button>
              </div>
            </motion.section>
          )}

          {step === 'details' && (
            <motion.section
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="mb-8 text-center font-display text-4xl font-light italic text-ink">Almost there.</h1>
              <DetailsForm
                initial={{ name: '', phone: '', email: '', notes: '' }}
                submitting={submitting}
                errorMessage={error}
                onSubmit={submit}
                onBack={() => setStep('time')}
              />
            </motion.section>
          )}

          {step === 'done' && confirmed && party && (
            <motion.section
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ConfirmationCard booking={confirmed} partySize={party} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
