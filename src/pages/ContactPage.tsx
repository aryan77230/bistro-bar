import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, Check, AlertCircle } from 'lucide-react';
import { submitFeedback, type FeedbackRequest } from '../lib/api';
import Nav from '../components/sections/Nav';
import Footer from '../components/sections/Footer';
import barBgImg from '../assets/lanyard/bar-interior.jpg';

interface ContactBlockProps {
  eyebrow: string;
  icon: React.ReactNode;
  lines: { label: string; href?: string }[];
}

function ContactBlock({ eyebrow, icon, lines }: ContactBlockProps) {
  return (
    <div className="border-t border-amber/40 pt-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="text-amber">{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber">
          {eyebrow}
        </span>
      </div>
      <div className="mt-6 space-y-2 font-display text-[clamp(1.15rem,1.8vw,1.5rem)] italic leading-tight text-ink">
        {lines.map((l, i) =>
          l.href ? (
            <a
              key={i}
              href={l.href}
              className="block transition-colors hover:text-amber"
            >
              {l.label}
            </a>
          ) : (
            <span key={i} className="block">
              {l.label}
            </span>
          )
        )}
      </div>
    </div>
  );
}

/**
 * ContactPage — dedicated route with contact blocks, a feedback form,
 * hours, and a map-less location marker. The feedback form is a
 * pure client-side demo (no backend wiring) — on submit it shows a
 * success state so the UX is complete.
 */
export default function ContactPage() {
  const [form, setForm] = useState<FeedbackRequest>({
    name: '',
    email: '',
    topic: 'feedback',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      await submitFeedback(form);
      setStatus('ok');
      setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', topic: 'feedback', message: '' });
      }, 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };


  return (
    <>
      <Nav />
      <main className="relative overflow-hidden pt-32 md:pt-40">
        {/* Ambient bar-interior photo — anchored to the top of the page
            and stretched down past the end of the feedback form, then
            faded to the base colour over the last stretch. Sits at z-0
            (above body bg, below content sections that carry `relative
            z-10`). Non-interactive. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[210vh] overflow-hidden"
        >
          <img
            src={barBgImg}
            alt=""
            className="h-full w-full object-cover opacity-[0.14] [filter:brightness(0.8)_saturate(0.85)]"
          />
          {/* Fade-out scrim — fully transparent for most of the image so
              it reads clearly through the hero + contact blocks + form,
              then dissolves to solid base by the end of the form. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(26,11,14,0.35) 0%, rgba(26,11,14,0.55) 50%, rgba(26,11,14,0.75) 82%, #1A0B0E 100%)',
            }}
          />
          {/* Soft warm radial so the contact headline feels lit. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_18%,rgba(212,165,96,0.2),transparent_55%)]" />
        </div>

        {/* Back link */}
        <section className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.35em] text-ink-dim transition-colors hover:text-amber"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back home
          </Link>

          <div className="mt-12 flex items-center justify-center gap-4">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
              Contact
            </span>
            <span className="h-[1px] w-10 bg-amber" />
          </div>
          <h1 className="mx-auto mt-8 max-w-6xl text-center font-display text-[clamp(1.5rem,4.4vw,4rem)] font-light leading-[1.2] tracking-tight text-ink sm:leading-[1.05]">
            Say hello.{' '}
            <span className="italic text-ink-dim">Book a table.</span>
            <br />
            <span>Leave a kind note — or a complaint.</span>
            <br />
            <span className="italic text-amber">We read them all.</span>
          </h1>
        </section>

        {/* 3-up contact blocks */}
        <section className="relative z-10 mx-auto mt-20 max-w-[1440px] px-6 md:mt-28 md:px-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            <ContactBlock
              eyebrow="Write"
              icon={<Mail size={16} strokeWidth={1.5} />}
              lines={[{ label: 'bistrobar@gmail.com', href: 'mailto:bistrobar@gmail.com' }]}
            />
            <ContactBlock
              eyebrow="Call"
              icon={<Phone size={16} strokeWidth={1.5} />}
              lines={[{ label: '+91 73892 22111', href: 'tel:+917389222111' }]}
            />
            <ContactBlock
              eyebrow="Visit"
              icon={<MapPin size={16} strokeWidth={1.5} />}
              lines={[{ label: 'Durg, Chhattisgarh' }, { label: 'India · 491001' }]}
            />
          </div>
        </section>

        {/* Feedback / enquiry form */}
        <section className="relative z-10 mx-auto mt-28 max-w-[1440px] px-6 md:mt-36 md:px-10">
          {/* Centered feedback heading */}
          <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
              Feedback
            </span>
            <span className="h-[1px] w-12 bg-amber/60" />
          </div>

          <form
            onSubmit={onSubmit}
            className="mx-auto w-full max-w-3xl rounded-2xl border border-amber/60 bg-elevated/50 p-6 shadow-[0_10px_50px_-15px_rgba(212,165,96,0.45)] backdrop-blur-sm md:p-10"
          >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field
                  label="Your name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  required
                />
              </div>

              <div className="mt-6">
                <label className="mb-3 block font-mono text-[10px] uppercase tracking-[0.35em] text-ink-dim">
                  Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'feedback', label: 'Feedback' },
                    { key: 'reservation', label: 'Reservation' },
                    { key: 'press', label: 'Press' },
                    { key: 'other', label: 'Other' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setForm({ ...form, topic: opt.key as FeedbackRequest['topic'] })}
                      className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] transition-colors ${
                        form.topic === opt.key
                          ? 'border-amber bg-amber text-base'
                          : 'border-line text-ink-dim hover:border-amber/60 hover:text-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-3 block font-mono text-[10px] uppercase tracking-[0.35em] text-ink-dim">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind…"
                  className="w-full resize-none rounded-xl border border-line bg-base/60 px-4 py-3 font-sans text-[15px] leading-relaxed text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending' || status === 'ok'}
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-amber px-7 py-3.5 font-mono text-[12px] font-semibold uppercase tracking-[0.28em] text-base shadow-[0_8px_30px_-8px_rgba(212,165,96,0.6)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#E5BA72] disabled:cursor-not-allowed disabled:bg-green-700 disabled:text-ink"
              >
                {status === 'sending' && <>Sending…</>}
                {status === 'ok' && (
                  <>
                    <Check size={15} strokeWidth={2} /> Sent — thank you
                  </>
                )}
                {status === 'error' && (
                  <>
                    <AlertCircle size={15} strokeWidth={2} /> Try again
                  </>
                )}
                {status === 'idle' && (
                  <>
                    Send note
                    <Send size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
          </form>
        </section>

      </main>
      <Footer />
    </>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}
function Field({ label, value, onChange, type = 'text', required }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.35em] text-ink-dim">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-base/60 px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </label>
  );
}
