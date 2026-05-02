import { useState } from 'react';

export interface Details {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface Props {
  initial: Details;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (d: Details) => void;
  onBack: () => void;
}

export default function DetailsForm({ initial, submitting, errorMessage, onSubmit, onBack }: Props) {
  const [form, setForm] = useState<Details>(initial);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="grid gap-5">
      <Field label="Your Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
      <Field
        label="Phone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm({ ...form, phone: v })}
        required
        placeholder="+91 9876543210"
      />
      <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
      <label className="block">
        <span className="block font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">
          Anything we should know? (optional)
        </span>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-line bg-base/60 px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
          placeholder="Birthday, dietary needs, seating preference…"
        />
      </label>
      {errorMessage && <p className="font-mono text-xs text-amber/80">{errorMessage}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim hover:text-ink"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-amber px-7 py-3 font-mono text-[12px] uppercase tracking-[0.28em] text-base disabled:opacity-50"
        >
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

function Field({ label, value, onChange, type = 'text', required, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-base/60 px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </label>
  );
}
