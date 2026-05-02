import { clsx } from 'clsx';

interface LogoMarkProps {
  className?: string;
  size?: number | string;
  /** Show the terracotta accent dot inside the glass. Default true. */
  showDot?: boolean;
}

/**
 * LogoMark — Bistro Bar crest.
 *
 * A circular frame containing an abstract martini-glass silhouette:
 *   - outer + inner rings (restaurant-crest feel)
 *   - V-shape bowl, stem, base line
 *   - a terracotta dot inside the bowl representing the cocktail/olive
 *
 * Uses `currentColor` for the linework so it inherits the surrounding text colour.
 * Scales cleanly from favicon (16px) up to hero banner (240px).
 */
export function LogoMark({ className, size = 40, showDot = true }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer crest ring */}
      <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      {/* Inner subtle ring */}
      <circle cx="30" cy="30" r="22" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      {/* Martini-glass bowl V */}
      <path
        d="M17 18 L30 34 L43 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stem */}
      <line
        x1="30"
        y1="34"
        x2="30"
        y2="44"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Base plate */}
      <line
        x1="22"
        y1="44"
        x2="38"
        y2="44"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Fine flourish above the glass */}
      <line
        x1="24"
        y1="12"
        x2="36"
        y2="12"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.35"
      />
      {/* Brass accent dot — the olive / cocktail */}
      {showDot && <circle cx="30" cy="23" r="1.8" fill="#D4A560" />}
    </svg>
  );
}

interface LogoWordmarkProps {
  className?: string;
  markSize?: number;
  textSize?: string;
  showAnimatedDot?: boolean;
}

/**
 * LogoWordmark — LogoMark + "BISTRO · BAR" typography. For nav, footer, loader.
 */
export function LogoWordmark({
  className,
  markSize = 32,
  textSize = '19px',
  showAnimatedDot = true,
}: LogoWordmarkProps) {
  return (
    <div className={clsx('inline-flex items-center gap-3', className)}>
      <LogoMark size={markSize} className="text-ink" />
      <div
        className="flex items-baseline gap-2 font-display font-medium leading-none tracking-[0.04em] text-ink"
        style={{ fontSize: textSize }}
      >
        <span>BISTRO</span>
        <span
          aria-hidden="true"
          className="relative flex h-[6px] w-[6px] items-center justify-center"
        >
          {showAnimatedDot && (
            <span className="absolute inset-0 animate-ping rounded-full bg-amber/60" />
          )}
          <span className="relative h-[6px] w-[6px] rounded-full bg-amber shadow-[0_0_14px_rgba(212,165,96,0.9)]" />
        </span>
        <span>BAR</span>
      </div>
    </div>
  );
}
