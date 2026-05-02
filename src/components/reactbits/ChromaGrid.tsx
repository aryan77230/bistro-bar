// Source: https://reactbits.dev/components/chroma-grid (Tailwind variant)
// Fetched via ReactBits MCP on 2026-04-23
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export interface ChromaItem {
  image?: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  price?: string;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  damping?: number;
  /** @deprecated retained for API compatibility — fade overlay was removed. */
  fadeOut?: number;
  ease?: string;
}

type SetterFn = (v: number | string) => void;

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = '',
  radius = 320,
  damping = 0.45,
  ease = 'power3.out',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  const data = items ?? [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
  };

  const handleLeave = () => {
    // Fade overlay removed; nothing to do on pointer leave.
  };

  const handleCardClick = (url?: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const c = e.currentTarget as HTMLElement;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative flex w-full flex-wrap items-start justify-center gap-4 ${className}`}
      style={{
        '--r': `${radius}px`,
        '--x': '50%',
        '--y': '50%',
      } as React.CSSProperties}
    >
      {data.map((c, i) => (
        <article
          key={i}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          className="group relative flex h-[520px] w-[290px] cursor-pointer flex-col overflow-hidden rounded-[20px] border-2 border-transparent transition-colors duration-300"
          style={{
            '--card-border': c.borderColor || 'transparent',
            background: c.gradient,
            '--spotlight-color': 'rgba(212,165,96,0.28)',
          } as React.CSSProperties}
        >
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)',
            }}
          />
          {c.image && (
            <div className="relative z-10 box-border h-[360px] shrink-0 p-3">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="h-full w-full rounded-[12px] object-cover"
              />
            </div>
          )}
          {/* Footer — title centered, description centered under it,
              price absolute-positioned in the bottom-right corner. The
              handle (e.g. "HOUSE · 02") is intentionally dropped. */}
          <footer className="relative z-10 flex flex-1 flex-col items-center px-4 pb-10 pt-3 font-sans text-ink">
            <h3 className="m-0 text-center font-display text-[1.15rem] font-medium tracking-tight">
              {c.title}
            </h3>
            <p className="m-0 mt-2 text-center text-[0.85rem] leading-snug text-ink-dim">
              {c.subtitle}
            </p>
            {c.price && (
              <span className="absolute bottom-3 right-4 font-mono text-[0.85rem] tracking-[0.1em] text-amber">
                {c.price}
              </span>
            )}
          </footer>
        </article>
      ))}
      {/* Spotlight + reveal overlays removed — they darkened the whole
          grid with a brightness(0.55) backdrop-filter whenever the
          cursor was outside the radius, which read as a big black box
          behind the cards. Per-card hover spotlights (the per-article
          radial-gradient on line ~116) still provide interactivity. */}
    </div>
  );
};

export default ChromaGrid;
