import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface Props {
  value: number | null;
  onChange: (n: number) => void;
}

export default function PartySizePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6].map((n, i) => {
          const isSelected = value === n;
          return (
            <motion.button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.04,
                type: 'spring',
                stiffness: 380,
                damping: 26,
              }}
              whileTap={{ scale: 0.94 }}
              className={clsx(
                'group relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 font-display text-xl hover:-translate-y-[3px] sm:h-16 sm:w-16 sm:text-2xl',
                isSelected
                  ? 'border-amber bg-amber text-base shadow-[0_10px_36px_-10px_rgba(212,165,96,0.75),_inset_0_1px_0_rgba(255,255,255,0.30)]'
                  : 'border-amber/45 bg-elevated/50 text-ink shadow-[inset_0_3px_10px_rgba(212,165,96,0.28),_inset_0_-2px_6px_rgba(212,165,96,0.10)] hover:border-amber hover:bg-elevated/70 hover:shadow-[0_12px_32px_-10px_rgba(212,165,96,0.6)]'
              )}
            >
              {n}
            </motion.button>
          );
        })}
      </div>
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">
        Max party of 6 — for larger groups, please call.
      </p>
    </div>
  );
}
