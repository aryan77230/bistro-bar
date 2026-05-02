import { motion } from 'motion/react';
import { useRef } from 'react';
import { clsx } from 'clsx';

interface Props {
  value: string | null;
  onChange: (date: string) => void;
}

const dayLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
const dateLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric' });
const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'short' });

interface DayInfo {
  iso: string;
  day: string;
  date: string;
  month: string;
  isToday: boolean;
  isWeekend: boolean;
}

export default function DatePicker({ value, onChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: DayInfo[] = Array.from({ length: 16 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dow = d.getDay();
    return {
      iso: `${yyyy}-${mm}-${dd}`,
      day: dayLabel.format(d),
      date: dateLabel.format(d),
      month: monthLabel.format(d),
      isToday: i === 0,
      isWeekend: dow === 5 || dow === 6,
    };
  });

  return (
    <div className="relative mx-auto max-w-[560px]">
      {/* Ambient amber glow behind the box */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(212,165,96,0.22),transparent_70%)] blur-2xl"
      />

      {/* Box container — amber border, padded, subtle inner gradient */}
      <div
        className="relative overflow-hidden rounded-3xl border border-amber/40 bg-elevated/30 p-3 shadow-[0_20px_60px_-20px_rgba(212,165,96,0.4),_inset_0_1px_0_rgba(245,231,208,0.06)] backdrop-blur-sm sm:p-4"
      >
        {/* Calendar-paper grid pattern — faint amber lines forming a planner-grid feel */}
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
          {days.map((d, i) => (
            <DateCard
              key={d.iso}
              day={d}
              index={i}
              isSelected={value === d.iso}
              onClick={() => onChange(d.iso)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DateCardProps {
  day: DayInfo;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

function DateCard({ day, index, isSelected, onClick }: DateCardProps) {
  // Cursor-tracking spotlight (SpotlightCard pattern from React Bits).
  const ref = useRef<HTMLButtonElement>(null);

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
      onClick={onClick}
      onMouseMove={handleMove}
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.03,
        type: 'spring',
        stiffness: 360,
        damping: 26,
      }}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        'date-card group relative overflow-hidden rounded-2xl px-2 py-3 hover:-translate-y-[3px]',
        'border-2',
        isSelected
          ? 'border-amber bg-amber text-base shadow-[0_10px_36px_-10px_rgba(212,165,96,0.75),_inset_0_1px_0_rgba(255,255,255,0.30)]'
          : 'border-amber/40 bg-elevated/50 text-ink shadow-[inset_0_3px_10px_rgba(212,165,96,0.28),_inset_0_-2px_6px_rgba(212,165,96,0.10)] hover:border-amber hover:bg-elevated/70 hover:shadow-[0_12px_32px_-10px_rgba(212,165,96,0.6)]'
      )}
    >
      {/* Cursor spotlight — visible only on hover for non-selected cards */}
      {!isSelected && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(220px circle at var(--x, 50%) var(--y, 0%), rgba(212,165,96,0.28), transparent 60%)',
          }}
        />
      )}

      {/* Subtle weekend tint on the back panel */}
      {!isSelected && day.isWeekend && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[2] bg-gradient-to-b from-amber/8 to-transparent"
        />
      )}

      {/* Today pulse dot */}
      {day.isToday && !isSelected && (
        <span className="absolute right-2 top-2">
          <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-amber/70" />
          <span className="relative block h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_6px_rgba(212,165,96,0.8)]" />
        </span>
      )}

      <span className="flex flex-col items-center gap-1">
        <span
          className={clsx(
            'font-mono text-[10px] uppercase tracking-[0.28em]',
            isSelected ? 'text-base/70' : 'text-amber/85'
          )}
        >
          {day.day}
        </span>
        <span
          className={clsx(
            'font-display text-[26px] leading-none',
            isSelected ? 'text-base' : 'text-ink'
          )}
        >
          {day.date}
        </span>
        <span
          className={clsx(
            'font-mono text-[10px] uppercase tracking-[0.25em]',
            isSelected ? 'text-base/70' : 'text-ink-dim'
          )}
        >
          {day.month}
        </span>
      </span>
    </motion.button>
  );
}
