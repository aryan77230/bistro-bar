import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { getAvailability } from '../../lib/api';

interface Slot {
  slot_starts_at: string;
  tables_left: number;
}

interface Props {
  date: string;
  party: number;
  value: string | null;
  onChange: (iso: string) => void;
}

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

// Some en-US Intl outputs use U+202F (narrow no-break space) between time and
// AM/PM, others use regular space — that's why some times wrap and others
// don't. Normalize to a single regular space so `whitespace-nowrap` works.
function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso)).replace(/\s+/g, ' ');
}

export default function TimeSlotGrid({ date, party, value, onChange }: Props) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setError(null);
    getAvailability(date, party)
      .then((res) => {
        if (!cancelled) setSlots(res.slots);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'lookup failed');
      });
    return () => {
      cancelled = true;
    };
  }, [date, party]);

  if (error) {
    return (
      <p className="text-center font-mono text-xs text-amber/80">
        Couldn't load availability — try again in a moment.
      </p>
    );
  }
  if (!slots) {
    return <p className="text-center font-mono text-xs text-ink-dim">Loading slots…</p>;
  }

  return (
    <div className="relative mx-auto max-w-[560px]">
      {/* Ambient amber glow behind the box */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(212,165,96,0.22),transparent_70%)] blur-2xl"
      />

      {/* Box container — matches DatePicker styling */}
      <div className="relative overflow-hidden rounded-3xl border border-amber/40 bg-elevated/30 p-3 shadow-[0_20px_60px_-20px_rgba(212,165,96,0.4),_inset_0_1px_0_rgba(245,231,208,0.06)] backdrop-blur-sm sm:p-4">
        {/* Calendar-paper grid pattern (faint amber lines, vignette-masked) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,165,96,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,165,96,0.07) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.95), rgba(0,0,0,0.3) 75%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.95), rgba(0,0,0,0.3) 75%, transparent 100%)',
          }}
        />

        {/* Inner gradient wash for depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber/5 via-transparent to-amber/5"
        />

        <div className="relative grid grid-cols-4 gap-2">
          {slots.map((s, i) => (
            <SlotCard
              key={s.slot_starts_at}
              slot={s}
              index={i}
              label={formatTime(s.slot_starts_at)}
              isSelected={!disabled(s) && value === s.slot_starts_at}
              onClick={() => !disabled(s) && onChange(s.slot_starts_at)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function disabled(s: Slot): boolean {
  return s.tables_left === 0;
}

interface SlotCardProps {
  slot: Slot;
  index: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function SlotCard({ slot, index, label, isSelected, onClick }: SlotCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const isDisabled = disabled(slot);

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      onMouseMove={handleMove}
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 360,
        damping: 26,
      }}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl px-2 py-3.5',
        'border-2',
        isDisabled
          ? 'cursor-not-allowed border-line/40 bg-elevated/30 opacity-40'
          : isSelected
            ? 'border-amber bg-amber text-base shadow-[0_10px_36px_-10px_rgba(212,165,96,0.75),_inset_0_1px_0_rgba(255,255,255,0.30)]'
            : 'border-amber/40 bg-elevated/50 text-ink shadow-[inset_0_3px_10px_rgba(212,165,96,0.28),_inset_0_-2px_6px_rgba(212,165,96,0.10)] hover:-translate-y-[3px] hover:border-amber hover:bg-elevated/70 hover:shadow-[0_12px_32px_-10px_rgba(212,165,96,0.6)]'
      )}
    >
      {/* Cursor spotlight on hover (only on enabled, non-selected cards) */}
      {!isSelected && !isDisabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(220px circle at var(--x, 50%) var(--y, 0%), rgba(212,165,96,0.28), transparent 60%)',
          }}
        />
      )}

      <span className="flex flex-col items-center gap-1">
        <span
          className={clsx(
            'whitespace-nowrap font-display text-xl leading-none',
            isSelected ? 'text-base' : isDisabled ? 'text-ink-dim' : 'text-ink'
          )}
        >
          {label}
        </span>
        <span
          className={clsx(
            'font-mono text-[9px] uppercase tracking-[0.22em]',
            isSelected ? 'text-base/70' : isDisabled ? 'text-ink-dim/70' : 'text-amber/85'
          )}
        >
          {isDisabled ? 'Full' : slot.tables_left === 1 ? 'Last' : `${slot.tables_left} left`}
        </span>
      </span>
    </motion.button>
  );
}
