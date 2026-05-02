import ScrollVelocity from '../reactbits/ScrollVelocity';
import { signatureDishes } from '../../data/menu';

const Dot = () => (
  <span
    aria-hidden="true"
    className="mx-8 inline-block h-2 w-2 translate-y-[-0.2em] rounded-full bg-amber align-middle shadow-[0_0_14px_rgba(212,165,96,0.7)]"
  />
);

const Row = ({ dishes }: { dishes: string[] }) => (
  <span className="inline-flex items-center">
    {dishes.map((d, i) => (
      <span key={i} className="inline-flex items-center">
        <span>{d}</span>
        <Dot />
      </span>
    ))}
  </span>
);

export default function DishesMarquee() {
  // Two rows, opposite directions — outline then solid
  const rowTopText = <Row dishes={signatureDishes} />;
  const rowBottomText = (
    <Row dishes={[...signatureDishes].reverse()} />
  );

  return (
    <section
      aria-labelledby="dishes-marquee-heading"
      className="relative -mt-6 overflow-hidden border-y border-line/60 bg-base pt-5 pb-8 md:-mt-10 md:pt-7 md:pb-10"
    >
      <h2 id="dishes-marquee-heading" className="sr-only">
        Signature dishes and cocktails
      </h2>

      {/* Outlined (top row) — scrolls LEFT at fixed speed, ignores scroll
          direction. Smaller clamp + extra vertical padding so italic
          descenders (g, y, p) don't clip against the overflow-hidden. */}
      <div className="[&_.scroller]:text-[clamp(0.95rem,2.6vw,2rem)] [&_.scroller]:font-light [&_.scroller]:italic [&_.scroller]:!leading-[1.2]">
        <ScrollVelocity
          texts={[rowTopText]}
          velocity={-55}
          numCopies={5}
          fixedDirection
          scrollerClassName="scroller text-transparent [-webkit-text-stroke:1px_theme(colors.amber)] [text-stroke:1px_theme(colors.amber)]"
          parallaxClassName="py-2"
        />
      </div>

      {/* Filled (bottom row) — scrolls RIGHT at fixed speed, opposite the top. */}
      <div className="mt-2 [&_.scroller]:text-[clamp(0.95rem,2.6vw,2rem)] [&_.scroller]:font-light [&_.scroller]:!leading-[1.2]">
        <ScrollVelocity
          texts={[rowBottomText]}
          velocity={55}
          numCopies={5}
          fixedDirection
          scrollerClassName="scroller text-ink/90"
          parallaxClassName="py-2"
        />
      </div>
    </section>
  );
}
