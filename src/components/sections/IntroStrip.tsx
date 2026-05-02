import BeerDrops from '../BeerDrops';
import ScrollFloat from '../reactbits/ScrollFloat';

/**
 * IntroStrip — "The Ethos" section.
 *
 * Editorial three-line quote with asymmetric left/right alignment, soft
 * gold-accented emphasis words, and a quiet amber hairline label. Dimmer
 * BeerDrops now sit BEHIND the text at heavy opacity reduction + blur so they
 * feel like room atmosphere, not a distraction from the copy.
 */
export default function IntroStrip() {
  return (
    <section
      id="intro"
      className="relative overflow-hidden border-t border-line/60 bg-base py-28 md:py-36 lg:py-44"
    >
      {/* ——— ATMOSPHERE — drops sit far behind the content, heavily blurred
          and dimmed so the text always reads cleanly. ——— */}
      <div className="pointer-events-none absolute -right-24 top-10 hidden h-[380px] w-[380px] opacity-[0.12] blur-[2px] md:block">
        <BeerDrops variant="lager" ballCount={6} interactive={false} />
      </div>
      <div className="pointer-events-none absolute -left-24 bottom-10 hidden h-[320px] w-[320px] opacity-[0.10] blur-[3px] md:block">
        <BeerDrops variant="foam" ballCount={5} interactive={false} />
      </div>

      {/* Interactive drops — now in a neutral, non-text zone on the far right
          so the user can still poke them without ruining copy readability. */}
      <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[260px] w-[260px] -translate-y-1/2 opacity-30 lg:block">
        <BeerDrops variant="lager" ballCount={5} interactive />
      </div>

      {/* ——— CONTENT ——— */}
      <div className="relative z-10 mx-auto grid max-w-[1300px] grid-cols-12 gap-y-6 px-6 md:gap-y-10 md:px-10 lg:gap-y-12">
        {/* Section eyebrow — left aligned, col 1-6 */}
        <div className="col-span-12 flex items-center gap-4 md:col-span-6">
          <span className="h-[1px] w-12 bg-amber" />
          <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-amber">
            01 — The Ethos
          </span>
        </div>

        {/* Secondary micro-meta on the right — adds editorial structure */}
        <div className="col-span-12 hidden items-center justify-end gap-4 md:col-span-6 md:flex">
          <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-ink-dim">
            Durg · Chhattisgarh
          </span>
          <span className="h-[1px] w-10 bg-ink-dim/50" />
        </div>

        {/* Line 1 — cream, left-aligned, starts at column 1 */}
        <div className="col-span-12 md:col-span-11">
          <ScrollFloat
            animationDuration={0.8}
            stagger={0.015}
            ease="back.inOut(1.4)"
            textClassName="font-display italic text-[clamp(2rem,5.2vw,4.2rem)] font-light leading-[1.1] tracking-tight"
          >
            We cook like it is someone's last good meal.
          </ScrollFloat>
        </div>

        {/* Line 2 — dimmer cream, indented from left, ends right */}
        <div className="col-span-12 md:col-span-10 md:col-start-3 md:text-right">
          <ScrollFloat
            animationDuration={0.8}
            stagger={0.015}
            ease="back.inOut(1.4)"
            textClassName="font-display italic text-[clamp(2rem,5.2vw,4.2rem)] font-light leading-[1.1] tracking-tight text-ink-dim"
          >
            We pour like it is someone's first.
          </ScrollFloat>
        </div>

        {/* Footer — attribution on right */}
        <div className="col-span-12 mt-4 flex items-center justify-end gap-4 md:mt-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-dim">
            — Chef's Note
          </span>
          <span className="h-[1px] w-10 bg-ink-dim/60" />
        </div>
      </div>
    </section>
  );
}
