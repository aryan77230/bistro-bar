// Source: https://reactbits.dev/components/bounce-cards (Tailwind variant)
// Fetched via ReactBits MCP on 2026-04-23
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BounceCardsProps {
  className?: string;
  images?: string[];
  captions?: string[];
  containerWidth?: number;
  containerHeight?: number;
  /** Width of each card in px. Default 200. */
  cardWidth?: number;
  /** Height of each card in px. If omitted, cards are square (matches cardWidth). */
  cardHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = '',
  images = [],
  captions = [],
  containerWidth = 400,
  containerHeight = 400,
  cardWidth = 200,
  cardHeight,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)',
  ],
  enableHover = false,
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bounce-card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [animationDelay, animationStagger, easeType]);

  /**
   * Natural depth stack — center card sits at the highest z-index, cards further
   * from the centre sit progressively behind. Creates the "hand of cards with the
   * middle one held forward" effect even without any hover.
   */
  const getBaseZ = (i: number): number => {
    const center = (images.length - 1) / 2;
    const distance = Math.abs(i - center);
    return Math.max(1, images.length - Math.round(distance * 2));
  };

  /**
   * Hover-lift transform. Appends translateY + scale WITHOUT touching the rotation
   * or translate in the base transform, so the card lifts in its natural tilted shape.
   */
  const getLiftedTransform = (baseTransform: string): string => {
    if (baseTransform === 'none') return 'translateY(-40px) scale(1.08)';
    return `${baseTransform} translateY(-40px) scale(1.08)`;
  };

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    }
    return baseTransform === 'none'
      ? `translate(${offsetX}px)`
      : `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    // The center/front card has the highest base z-index. Anything hovered
    // that *isn't* that front card rises to just below it — never above it.
    const centerZ = Math.max(...images.map((_, i) => getBaseZ(i)));

    images.forEach((_, i) => {
      const selector = q(`.bounce-card-${i}`);
      gsap.killTweensOf(selector);
      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const isCenter = getBaseZ(i) === centerZ;
        const hoverZ = isCenter ? centerZ : centerZ - 1;

        // Hovered card: single clean overshoot pop — no oscillation.
        gsap.to(selector, {
          transform: getLiftedTransform(baseTransform),
          zIndex: hoverZ,
          duration: 0.14,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } else {
        // Siblings slide with gentle overshoot, cascading outward.
        const offsetX = i < hoveredIdx ? -60 : 60;
        gsap.to(selector, {
          transform: getPushedTransform(baseTransform, offsetX),
          zIndex: getBaseZ(i),
          duration: 0.14,
          ease: 'power3.out',
          delay: 0,
          overwrite: 'auto',
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const selector = q(`.bounce-card-${i}`);
      gsap.killTweensOf(selector);
      // Return with a gentle single-wobble settle — noticeable but not jittery.
      gsap.to(selector, {
        transform: transformStyles[i] || 'none',
        zIndex: getBaseZ(i),
        // Reset has a quick bounce/overshoot so cards visibly recoil
        // when they collapse back — back.out(2.6) gives a punchy
        // snap-and-bounce. Short duration keeps it from feeling slow.
        duration: 0.28,
        ease: 'back.out(2.6)',
        overwrite: 'auto',
      });
    });
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((src, idx) => (
        <div
          key={idx}
          className={`bounce-card bounce-card-${idx} group absolute overflow-hidden rounded-[32px] bg-elevated shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(212,165,96,0.08)] ring-1 ring-amber/5`}
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight ?? cardWidth}px`,
            transform: transformStyles[idx] || 'none',
            zIndex: getBaseZ(idx),
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
        >
          <img
            className="h-full w-full object-cover [filter:contrast(1.08)_saturate(0.95)_brightness(0.95)]"
            src={src}
            alt={captions[idx] ?? `Bottle ${idx + 1}`}
            loading="lazy"
          />
          {/* Subtle top-to-bottom wash so text/captions remain legible over any image */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/40 via-transparent to-transparent"
          />
          {/* Warm amber glow on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          {captions[idx] && (
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-base/95 via-base/55 to-transparent px-4 pb-4 pt-10">
              <span className="truncate text-center font-display text-[15px] italic text-ink">
                {captions[idx]}
              </span>
            </figcaption>
          )}
        </div>
      ))}
    </div>
  );
}
