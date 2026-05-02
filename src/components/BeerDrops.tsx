import MetaBalls from './reactbits/MetaBalls';

interface BeerDropsProps {
  /** Tailwind class for positioning / opacity on the wrapping layer. */
  className?: string;
  /** Visual variant — controls color, clump, and speed. */
  variant?: 'lager' | 'stout' | 'foam';
  /** Ball count — fewer for subtle, more for full pour feel. Default 10. */
  ballCount?: number;
  /** Disable cursor interaction for purely ambient usage. */
  interactive?: boolean;
}

// Bar-themed presets. Keep the colours inside the site palette so the drops
// read as "liquid in the room" rather than a random shader dropped in.
const PRESETS: Record<
  NonNullable<BeerDropsProps['variant']>,
  {
    color: string;
    cursorBallColor: string;
    speed: number;
    clumpFactor: number;
    animationSize: number;
    cursorBallSize: number;
  }
> = {
  // Golden draft lager — warm amber body, creamy foam highlight.
  lager: {
    color: '#D4A560',
    cursorBallColor: '#F5E7D0',
    speed: 0.28,
    clumpFactor: 1.05,
    animationSize: 28,
    cursorBallSize: 3,
  },
  // Stout / dark beer — deep merlot body, caramel-foam highlight.
  stout: {
    color: '#7C2835',
    cursorBallColor: '#E8C88A',
    speed: 0.22,
    clumpFactor: 1.15,
    animationSize: 30,
    cursorBallSize: 2.5,
  },
  // Foam — cream-on-cream, feels like head of a pint.
  foam: {
    color: '#F5E7D0',
    cursorBallColor: '#E8C88A',
    speed: 0.35,
    clumpFactor: 0.95,
    animationSize: 26,
    cursorBallSize: 2.5,
  },
};

/**
 * BeerDrops — bar-themed MetaBalls preset used as an ambient background.
 * Absolutely positioned by its parent; pass `className` to control size/opacity.
 */
export default function BeerDrops({
  className = '',
  variant = 'lager',
  ballCount = 10,
  interactive = true,
}: BeerDropsProps) {
  const preset = PRESETS[variant];
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div className={interactive ? 'pointer-events-auto h-full w-full' : 'h-full w-full'}>
        <MetaBalls
          color={preset.color}
          cursorBallColor={preset.cursorBallColor}
          speed={preset.speed}
          clumpFactor={preset.clumpFactor}
          animationSize={preset.animationSize}
          cursorBallSize={preset.cursorBallSize}
          ballCount={ballCount}
          hoverSmoothness={0.08}
          enableTransparency
          enableMouseInteraction={interactive}
        />
      </div>
    </div>
  );
}
