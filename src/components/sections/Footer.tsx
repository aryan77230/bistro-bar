import CircularText from '../reactbits/CircularText';
import { LogoMark } from '../Logo';

/**
 * Footer — minimal landing-page footer.
 *
 * Centrepiece: the Bistro Bar crest inside a slow-orbiting amber
 * ring of marquee-style text ("BISTRO BAR · DURG · CHHATTISGARH · EST 2024 ·")
 * rendered with React Bits' CircularText. Below the mark sits a tight
 * row of page links and the copyright line.
 */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-amber/30 bg-base py-12 md:py-16">
      {/* Warm amber wash behind the ring so the crest reads as lit. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,165,96,0.14),transparent_65%)] blur-3xl"
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 md:gap-8 md:px-10">
        {/* Logo surrounded by circular orbiting text */}
        <div className="relative flex h-[118px] w-[118px] items-center justify-center sm:h-[160px] sm:w-[160px]">
          {/* Circular orbiting text — sits on the outer ring */}
          <CircularText
            text="BISTRO BAR  ·  EST 2024  ·  "
            spinDuration={24}
            onHover="slowDown"
            className="!h-[118px] !w-[118px] !font-mono !font-semibold !tracking-[0.22em] text-amber [&>span]:!text-[11px] sm:!h-[160px] sm:!w-[160px] sm:[&>span]:!text-[15px]"
          />
          {/* Static crest at the centre, above the rotating ring */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full border border-amber/40 bg-base/80 shadow-[0_0_45px_-10px_rgba(212,165,96,0.55)] backdrop-blur-sm sm:h-[108px] sm:w-[108px]">
              <div className="origin-center scale-[0.74] sm:scale-100">
                <LogoMark size={60} className="text-ink" />
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="max-w-md text-center font-display text-xl italic text-ink-dim md:text-2xl">
          A kitchen on fire. A bar with intent.
        </p>

        {/* Hours + legal — centred stack */}
        <div className="w-full space-y-2 border-t border-line/60 pt-5 text-center">
          <p className="flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.4em] text-amber">
            Hours
            <span className="font-display text-base italic normal-case tracking-normal text-ink">
              Tue – Sun · 6 pm – 11 pm
            </span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink-dim">
            © 2024 Bistro Bar · Durg, Chhattisgarh
          </p>
        </div>
      </div>
    </footer>
  );
}
