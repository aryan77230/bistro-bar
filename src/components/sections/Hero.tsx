import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import Aurora from '../reactbits/Aurora';
import LightRays from '../reactbits/LightRays';
import heroBarImg from '../../assets/hero-bar.jpg';
import SplitText from '../reactbits/SplitText';
import DecryptedText from '../reactbits/DecryptedText';
import RotatingText from '../reactbits/RotatingText';
import BounceCards from '../reactbits/BounceCards';
import ScrollVelocity from '../reactbits/ScrollVelocity';
import Lanyard from '../reactbits/Lanyard';

// Portrait-cropped drink imagery — swap URLs freely, pairings below are by index.
const bottleImages = [
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=640&h=1000&q=80', // wine bottle, dark
  'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=640&h=1000&q=80', // aged whiskey, amber
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=640&h=1000&q=80', // cocktail hero shot (center)
  'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=640&h=1000&q=80', // wine glass / pinot noir (verified 200)
  'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=640&h=1000&q=80', // beer glass, tall
];

const bottleCaptions = [
  'Vintage Red',
  'Aged Whiskey',
  'House Cocktail',
  'Pinot Noir',
  'Craft Lager',
];

// Fan with "depth of field" — center card scales larger (feels forward), outer cards
// scale smaller (feel further back). Combined with z-index stacking in BounceCards,
// this gives the main-front-card-with-followers look from the reference.
// translate(X) stays single-arg so BounceCards' hover-push regex still works.
const bottleTransforms = [
  'rotate(-10deg) translate(-340px) translateY(28px)  scale(0.88)',
  'rotate(-5deg)  translate(-175px) translateY(10px)  scale(0.95)',
  'rotate(0deg)   translate(0px)    translateY(-20px) scale(1.05)',
  'rotate(5deg)   translate(175px)  translateY(10px)  scale(0.95)',
  'rotate(10deg)  translate(340px)  translateY(28px)  scale(0.88)',
];

/**
 * HERO — dark cinematic, layered atmosphere.
 * Layer stack (bottom → top):
 *   1. Base background color
 *   2. Aurora (wine ↔ amber, slow drift)
 *   3. LightRays (top-center, amber, mouse-reactive)
 *   4. Vignette + bottom gradient scrim
 *   5. Content
 */
export default function Hero() {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setClock(`${hh}:${mm}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-base"
    >
      {/* === 1. Aurora === */}
      <div className="absolute inset-0 z-[1] opacity-55">
        <Aurora
          colorStops={['#7C2835', '#D4A560', '#7C2835']}
          amplitude={0.95}
          blend={0.6}
          speed={0.55}
        />
      </div>

      {/* === 2. Light Rays === */}
      <div className="absolute inset-0 z-[2] opacity-70 mix-blend-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#D4A560"
          raysSpeed={0.9}
          lightSpread={1.3}
          rayLength={1.8}
          fadeDistance={1.1}
          saturation={1.1}
          followMouse
          mouseInfluence={0.18}
          noiseAmount={0.05}
          distortion={0.05}
        />
      </div>

      {/* === 2.5. Ambient bar interior photo ===
          Covers the full hero, anchored to the right-centre so the warm bar
          focal point sits behind the lanyard card area (right half) rather
          than behind the headline. Normal blending + higher opacity so the
          scene reads as a real photo instead of a smeared gradient. The
          left-side scrim below (2.6) protects text legibility. */}
      <img
        src={heroBarImg}
        alt=""
        aria-hidden="true"
        style={{ objectPosition: '70% 50%' }}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover opacity-[0.42] [filter:brightness(0.82)_saturate(0.95)_contrast(1.05)]"
      />

      {/* === 3. Vignette + bottom scrim === */}
      <div className="pointer-events-none absolute inset-0 z-[3] vignette" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[45%] bg-gradient-to-t from-base via-base/80 to-transparent"
        aria-hidden="true"
      />
      {/* Left-edge scrim — protects headline legibility now that the bar
          photo is rendered at full opacity with no blend mode. Fades off
          well before the lanyard area on the right. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[55%] bg-gradient-to-r from-base via-base/75 to-transparent md:w-[52%]"
        aria-hidden="true"
      />

      {/* === Content === */}
      <div className="relative z-10 mx-auto w-full max-w-[1540px] px-6 pt-36 pb-32 md:px-10 md:pt-40 md:pb-40">
        {/* ============ TOP: 2-col grid — text left, hanging Lanyard right (lg+) ============ */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          {/* LEFT: text column */}
          <div className="w-full">
          {/* Headline */}
          <div className="mt-8 space-y-1 md:mt-10 md:space-y-2">
            <SplitText
              text="Craft plates."
              tag="h1"
              textAlign="left"
              splitType="chars"
              delay={28}
              duration={1.15}
              ease="power3.out"
              from={{ opacity: 0, y: 60 }}
              to={{ opacity: 1, y: 0 }}
              className="font-display text-[clamp(2.5rem,6.8vw,7.5rem)] font-light leading-[1.02] text-ink"
            />
            <SplitText
              text="Low light."
              tag="h1"
              textAlign="left"
              splitType="chars"
              delay={28}
              duration={1.15}
              ease="power3.out"
              from={{ opacity: 0, y: 60 }}
              to={{ opacity: 1, y: 0 }}
              className="font-display italic text-[clamp(2.5rem,6.8vw,7.5rem)] font-light leading-[1.02] text-ink-dim"
            />

            {/* Third line — "Loud [rotating]." */}
            <div className="flex flex-wrap items-baseline gap-x-[0.2em]">
              <SplitText
                text="Loud"
                tag="span"
                textAlign="left"
                splitType="chars"
                delay={28}
                duration={1.15}
                ease="power3.out"
                from={{ opacity: 0, y: 60 }}
                to={{ opacity: 1, y: 0 }}
                className="font-display text-[clamp(2.5rem,6.8vw,7.5rem)] font-light leading-[1.02] text-amber"
              />
              {/* Rotating word — inline-block with generous leading + padding
                  so descenders (g, y) on "nights.", "stories." aren't clipped. */}
              <span className="relative inline-block overflow-hidden pb-[0.18em] align-baseline font-display text-[clamp(2.5rem,6.8vw,7.5rem)] font-light italic leading-[1.15] text-amber">
                <RotatingText
                  texts={['flavor.', 'smoke.', 'nights.', 'hours.', 'stories.']}
                  rotationInterval={2400}
                  transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                  splitBy="characters"
                  staggerDuration={0.01}
                  mainClassName="inline-flex"
                />
              </span>
            </div>
          </div>

          {/* Marquee moved out of the text column — now sits below the grid, full width. */}

          <div className="mt-10 flex flex-nowrap items-center gap-3 md:flex-wrap md:gap-6">
            {/* Primary CTA — solid amber pill with a cursor-tracking
                cream spotlight INSIDE the button. The spotlight position
                is driven by `--mx`/`--my` CSS variables updated in the
                onMouseMove handler, giving the same "bloom follows the
                pointer" effect as ShapeBlur but correctly shaped for a
                wide pill (ShapeBlur's shader is normalized to a square
                and doesn't fit pill geometry). */}
            <Link
              to="/reserve"
              aria-label="Book a table"
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('--mx', '50%');
                e.currentTarget.style.setProperty('--my', '50%');
              }}
              style={{
                backgroundImage:
                  'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,237,205,0.95) 0%, rgba(232,188,120,0.95) 30%, rgba(212,165,96,1) 70%)',
              }}
              className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-base shadow-[0_10px_40px_-10px_rgba(212,165,96,0.7)] ring-1 ring-amber/50 transition-[transform,box-shadow] duration-300 hover:-translate-y-[2px] hover:shadow-[0_18px_55px_-8px_rgba(212,165,96,0.85)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber/60 md:ml-10 md:gap-3 md:px-9 md:py-4 md:text-[12px] md:tracking-[0.28em]"
            >
              {/* Soft inner bloom layer — multiplies the cursor spotlight
                  for a stronger glow right under the pointer. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,245,220,0.55), transparent 55%)',
                }}
              />
              <span className="relative z-10">Book a Table</span>
              <span
                aria-hidden="true"
                className="relative z-10 hidden h-[1px] w-6 bg-base/70 transition-all duration-300 group-hover:w-9 group-hover:bg-base md:inline-block"
              />
            </Link>

            {/* Secondary CTA — outlined amber pill that jumps to the
                Menu section further down the landing page. */}
            <a
              href="#menu"
              aria-label="See the menu"
              className="group inline-flex items-center gap-2 rounded-full border border-amber/55 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber transition-all duration-300 hover:-translate-y-[1px] hover:border-amber hover:bg-amber/10 md:gap-3 md:px-7 md:py-3.5 md:text-[12px] md:tracking-[0.28em]"
            >
              <span className="relative z-10">See Menu</span>
              <span
                aria-hidden="true"
                className="hidden h-[1px] w-5 bg-amber/60 transition-all duration-300 group-hover:w-8 group-hover:bg-amber md:inline-block"
              />
            </a>
          </div>
          </div>
          {/* END LEFT text column */}

          {/* RIGHT: hanging 3D lanyard card. Only on lg+ — the drag physics
              is a desktop experience; on small screens it'd be heavy + awkward. */}
          <div className="pointer-events-auto relative hidden h-[560px] w-full lg:block xl:h-[640px]">
            <Lanyard position={[0, 0, 18]} gravity={[0, -40, 0]} fov={20} />
          </div>
        </div>
        {/* END 2-col grid */}

        {/* ============ MARQUEE — full width divider strip ============ */}
        <div className="relative mt-14 -mx-6 overflow-hidden border-y border-amber/25 py-5 md:-mx-10 md:mt-20 md:py-6">
          {/* Edge fades so the text softly vanishes at the frame edges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base to-transparent md:w-28"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base to-transparent md:w-28"
          />
          <ScrollVelocity
            texts={[
              '  A neighborhood bistro built around seasonal plates  ·  A bar program that takes cocktails as seriously as the kitchen takes dinner  · ',
            ]}
            velocity={-42}
            numCopies={4}
            fixedDirection
            className="px-4 font-display italic text-[clamp(1rem,1.8vw,1.5rem)] tracking-[0.01em] text-[#E6D6B3]"
          />
        </div>

        {/* ============ BOTTLE FAN — below the marquee ============ */}
        <div className="relative mt-16 w-full md:mt-20 lg:mt-24">
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-dim">
              tonight's pour
            </span>
            <span className="h-[1px] w-10 bg-amber" />
          </div>

          {/* Wrapper height is locked to each breakpoint's scaled
              output — CSS scale doesn't shrink layout, so without this
              the wrapper kept reserving the full 460px for the
              unscaled cards and left huge gaps above/below on mobile.
              Each height = 460 × scale at that breakpoint. */}
          <div className="mb-6 flex h-[260px] w-full items-center justify-center overflow-hidden px-10 pb-3 pt-10 sm:mb-8 sm:h-[340px] sm:px-16 sm:pb-4 sm:pt-12 md:h-[440px] md:px-20 md:pb-5 md:pt-14 lg:h-[510px] xl:h-[520px] 2xl:h-[560px]">
            <div className="origin-center scale-[0.34] sm:scale-[0.55] md:scale-[0.82] lg:scale-95 xl:scale-100 2xl:scale-[1.08]">
              <BounceCards
                images={bottleImages}
                captions={bottleCaptions}
                transformStyles={bottleTransforms}
                containerWidth={960}
                containerHeight={460}
                cardWidth={220}
                cardHeight={360}
                animationDelay={1.1}
                animationStagger={0.08}
                easeType="elastic.out(1, 0.6)"
                enableHover
                className="[&_.bounce-card]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-left: live status */}
      <div className="absolute bottom-8 left-6 z-10 flex items-center gap-4 md:bottom-10 md:left-10">
        <span aria-hidden="true" className="relative inline-flex h-[8px] w-[8px]">
          <span className="absolute inset-0 animate-ping rounded-full bg-amber/60" />
          <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-amber" />
        </span>
        <DecryptedText
          text={`OPEN NOW · ${clock || '--:--'} · DURG`}
          animateOn="view"
          sequential
          revealDirection="start"
          speed={32}
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink"
          encryptedClassName="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim"
        />
      </div>

      {/* Bottom-right: scroll cue */}
      <a
        href="#intro"
        className="group absolute bottom-8 right-6 z-10 flex flex-col items-center gap-3 md:bottom-10 md:right-10"
        aria-label="Scroll to next section"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-dim transition-colors group-hover:text-amber [writing-mode:vertical-rl]">
          scroll
        </span>
        <span aria-hidden="true" className="relative block h-14 w-[1px] overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-6 w-[1px] -translate-y-full animate-[scrollCue_2.4s_ease-in-out_infinite] bg-amber" />
        </span>
        <ArrowDown size={14} className="text-ink-dim transition-colors group-hover:text-amber" />
      </a>

      <style>{`
        @keyframes scrollCue {
          0%   { transform: translateY(-100%); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateY(260%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
