// StarBorder v3 — orbit-the-border variant.
//
// Strategy: place a SQUARE conic-gradient layer behind the button,
// oversized (200% of the button's larger dimension) so it covers the
// button regardless of pill aspect ratio. A nested inner <span> rotates
// continuously via a transform-based keyframe. The button's inner
// content surface sits on top and covers the middle, so only a thin
// ring around the edge exposes the rotating conic — the visible effect
// is a light that travels around the perimeter.
//
// Keyframe `star-border-spin` lives in src/styles.css.
import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  /** Colour of the orbiting comet. Any CSS colour. */
  color?: string;
  /** One full lap duration. Longer = slower orbit. */
  speed?: React.CSSProperties['animationDuration'];
  /** Ring thickness in px — width of the visible glowing border. */
  thickness?: number;
  /** Tailwind/CSS classes applied to the inner content surface. */
  innerClassName?: string;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = '#EF4444',
  speed = '10s',
  thickness = 3,
  innerClassName = 'bg-amber text-base',
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = (as || 'button') as React.ElementType;

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-full ${className}`}
      {...(rest as Record<string, unknown>)}
    >
      {/* Oversized square container, centered on the button. Its children
          do the actual rotation — this span stays put. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '50%',
          left: '50%',
          width: '250%',
          aspectRatio: '1',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Rotating conic — inset:0 fills its square parent, so rotation
            never exposes empty corners. The parent pill's overflow-hidden
            clips whatever falls outside. Tailwind's
            `animate-star-border-spin` utility is registered via
            @theme in src/styles.css; we just override the duration
            inline so the `speed` prop works. */}
        <span
          className="absolute inset-0 animate-star-border-spin"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 240deg, ${color} 290deg, ${color} 340deg, transparent 360deg)`,
            animationDuration: speed as string,
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </span>

      {/* Inner surface — offset inwards by `thickness` on every side so
          the rotating conic is exposed only as a thin ring. */}
      <span
        className={`relative block rounded-full text-center text-[14px] font-medium uppercase tracking-[0.12em] ${innerClassName}`}
        style={{ margin: `${thickness}px` }}
      >
        {children}
      </span>
    </Component>
  );
};

export default StarBorder;
