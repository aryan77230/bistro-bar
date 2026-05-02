import { useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import CardSwap, { Card } from '../reactbits/CardSwap';
import TiltedCard from '../reactbits/TiltedCard';
import StaggeredVideoReveal from '../reactbits/StaggeredVideoReveal';
import ScrollVelocity from '../reactbits/ScrollVelocity';
import BeerDrops from '../BeerDrops';
import { wines, cocktails, plates, type WineLabel } from '../../data/menu';
import { X, ArrowUpRight } from 'lucide-react';

type TabKey = 'plates' | 'cocktails' | 'wine';
const TABS: { key: TabKey; label: string; count: number }[] = [
  { key: 'plates', label: 'Plates', count: plates.length },
  { key: 'cocktails', label: 'Cocktails', count: cocktails.length },
  { key: 'wine', label: 'Wine', count: wines.length },
];

function WineCardFace({ w }: { w: (typeof wines)[number] }) {
  return (
    <div
      // Outer card: gradient backdrop, amber border ring, and a warm
      // amber drop-shadow so the card lifts off the dark page bg.
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-amber/40 shadow-[0_18px_60px_-18px_rgba(212,165,96,0.55)]"
      style={{
        background: `linear-gradient(160deg, ${w.colorStops[0]} 0%, ${w.colorStops[1]} 60%, #1A0B0E 100%)`,
      }}
    >
      {/* Inset framed image — pushed to the top of the card now that
          the vintage / variety labels have moved below. */}
      {w.image && (
        <div className="relative mx-7 mt-7 mb-5 flex-1 overflow-hidden rounded-xl border border-amber/30 shadow-[inset_0_0_0_1px_rgba(245,231,208,0.05),0_8px_30px_-8px_rgba(0,0,0,0.6)] md:mx-9 md:mt-9">
          <img
            src={w.image}
            alt={w.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      )}

      {/* Bottom — name centered, then vintage · variety · region in a
          single side-by-side row beneath. */}
      <div className="px-7 pb-7 text-center md:px-9 md:pb-9">
        <h3 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light italic leading-[1.05] tracking-tight text-ink drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {w.name}
        </h3>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.28em] text-amber/90">
          <span>vintage {w.vintage}</span>
          <span className="text-ink-dim">·</span>
          <span>{w.variety}</span>
          <span className="text-ink-dim">·</span>
          <span>{w.region}</span>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [active, setActive] = useState<TabKey>('plates');
  // Wine selected for the focus modal — null means modal is closed.
  const [openWine, setOpenWine] = useState<WineLabel | null>(null);

  return (
    <section
      id="menu"
      className="relative overflow-hidden border-y border-line/60 bg-base pt-28 pb-10 md:pt-40 md:pb-14"
    >
      {/* soft radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[800px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(124,40,53,0.22),transparent_65%)]" />

      {/* Ambient "liquid pour" — amber beer drops on the left, wine drops on
          the right. Low opacity so they read as room atmosphere behind the
          content, not a focal element. Mouse interactive. */}
      <div className="pointer-events-none absolute left-0 top-20 -z-0 hidden h-[420px] w-[420px] opacity-40 md:block">
        <BeerDrops variant="lager" ballCount={8} />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-20 -z-0 hidden h-[380px] w-[380px] opacity-35 md:block">
        <BeerDrops variant="stout" ballCount={7} />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        {/* Section header — tabs are the main/primary bar element */}
        <div className="flex flex-col items-center gap-10 md:gap-12">
          {/* Eyebrow — small supporting framing above the main bar */}
          <div className="flex items-center gap-4">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
              02 — The Menu
            </span>
            <span className="h-[1px] w-10 bg-amber" />
          </div>

          {/* Tabs — enlarged, centered, the main focal bar of this section */}
          <div
            role="tablist"
            aria-label="Menu category"
            className="relative flex items-center gap-1 rounded-full border border-line bg-elevated/80 px-4 py-2 shadow-[0_0_80px_-25px_rgba(212,165,96,0.45)] backdrop-blur-sm md:px-3"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={active === t.key}
                onClick={() => setActive(t.key)}
                className={clsx(
                  'relative z-10 rounded-full px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.28em] transition-colors duration-300 md:px-10 md:py-4 md:text-[13px] md:tracking-[0.32em]',
                  active === t.key ? 'text-base' : 'text-ink-dim hover:text-ink'
                )}
              >
                {active === t.key && (
                  <motion.span
                    layoutId="menu-tab-pill"
                    className="absolute inset-0 -z-[1] rounded-full bg-amber shadow-[0_0_30px_-5px_rgba(212,165,96,0.55)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {t.label}
                  <span
                    className={clsx(
                      'font-mono text-[10px] md:text-[11px]',
                      active === t.key ? 'text-base/70' : 'text-ink-dim/70'
                    )}
                  >
                    0{t.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab panels */}
        <div className="mt-14 md:mt-20">
          {/* `initial={false}` disables the entrance animation for
              whichever tab is active on first mount — otherwise the
              default-active "plates" panel can get stuck at opacity:0
              because AnimatePresence never fires its enter transition
              when there's no previous child to wait on. Switching tabs
              still animates normally. */}
          <AnimatePresence mode="wait" initial={false}>
            {/* ============ PLATES ============ */}
            {active === 'plates' && (
              <motion.div
                key="plates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-y-5 gap-x-3 sm:gap-y-10 sm:gap-x-7 lg:grid-cols-3 lg:gap-y-14 lg:gap-x-9"
              >
                {plates.map((p) => (
                  <article
                    key={p.name}
                    className="group relative mx-auto flex w-full max-w-[200px] flex-col rounded-[18px] border-[1.5px] transition-shadow duration-500 hover:shadow-[0_18px_60px_-15px_rgba(212,165,96,0.45)] sm:max-w-[380px] sm:rounded-[24px] sm:border-2"
                    style={{
                      background: p.gradient,
                      borderColor: p.borderColor || 'transparent',
                    }}
                  >
                    <div className="relative m-2 overflow-hidden rounded-[10px] sm:m-[17px] sm:rounded-[16px]">
                      <TiltedCard
                        imageSrc={p.image}
                        altText={p.name}
                        captionText={p.name}
                        containerHeight="clamp(130px, 36vw, 305px)"
                        containerWidth="100%"
                        imageHeight="clamp(130px, 36vw, 305px)"
                        imageWidth="100%"
                        scaleOnHover={1.04}
                        rotateAmplitude={10}
                        showTooltip={false}
                      />
                    </div>

                    <div className="flex flex-col px-3 pb-3 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:pb-5">
                      <div className="min-w-0 sm:flex-1">
                        <h3 className="truncate text-center font-display text-[13px] font-light tracking-tight text-ink transition-colors group-hover:text-amber sm:overflow-visible sm:whitespace-normal sm:text-left sm:text-2xl sm:leading-tight">
                          {p.name}
                        </h3>
                        <p className="mt-1 text-center font-sans text-[10.5px] leading-[1.4] text-ink-dim sm:mt-2 sm:text-left sm:text-[13.5px] sm:leading-[1.55]">
                          {p.description}
                        </p>
                      </div>
                      <div className="mt-2 flex justify-center sm:mt-0 sm:block sm:text-right">
                        <span className="rounded-full border border-amber/30 px-2 py-0.5 font-mono text-[9px] tracking-[0.05em] text-amber sm:shrink-0 sm:px-3 sm:py-1.5 sm:text-[12px] sm:tracking-[0.08em]">
                          {p.price}
                        </span>
                      </div>
                    </div>

                    <span className="absolute inset-x-0 -bottom-2 h-[1px] origin-left scale-x-0 bg-amber transition-transform duration-700 ease-out group-hover:scale-x-100" />
                  </article>
                ))}
                {/* tail index ghost */}
                <div className="hidden items-center justify-center rounded-[20px] border border-dashed border-amber/25 p-12 font-display text-3xl italic text-ink-dim/85 md:flex lg:col-span-3">
                  +  {plates.length.toString().padStart(2, '0')}  seasonal plates rotate nightly
                </div>
              </motion.div>
            )}

            {/* ============ COCKTAILS ============ */}
            {active === 'cocktails' && (
              <motion.div
                key="cocktails"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-y-5 gap-x-3 sm:gap-y-10 sm:gap-x-7 lg:grid-cols-3 lg:gap-y-14 lg:gap-x-9"
              >
                {cocktails.map((c) => (
                  <article
                    key={c.title}
                    className="group relative mx-auto flex w-full max-w-[200px] flex-col rounded-[18px] border-[1.5px] transition-shadow duration-500 hover:shadow-[0_18px_60px_-15px_rgba(212,165,96,0.45)] sm:max-w-[380px] sm:rounded-[24px] sm:border-2"
                    style={{
                      background: c.gradient,
                      borderColor: c.borderColor || 'transparent',
                    }}
                  >
                    <div className="relative m-2 h-[clamp(130px,36vw,305px)] overflow-hidden rounded-[10px] sm:m-[17px] sm:rounded-[16px]">
                      {c.image && c.video ? (
                        // Hover the framed image to trigger a staggered
                        // colour reveal that finishes by playing a short
                        // cocktail-making clip on top of the photo.
                        <StaggeredVideoReveal
                          videoSrc={c.video}
                          colors={[c.borderColor, c.gradient.match(/#[0-9A-F]{6}/i)?.[0] || '#1A0B0E', '#1A0B0E']}
                        >
                          <TiltedCard
                            imageSrc={c.image}
                            altText={c.title}
                            captionText={c.title}
                            containerHeight="clamp(130px, 36vw, 305px)"
                            containerWidth="100%"
                            imageHeight="clamp(130px, 36vw, 305px)"
                            imageWidth="100%"
                            scaleOnHover={1.04}
                            rotateAmplitude={10}
                            showTooltip={false}
                          />
                        </StaggeredVideoReveal>
                      ) : (
                        c.image && (
                          <TiltedCard
                            imageSrc={c.image}
                            altText={c.title}
                            captionText={c.title}
                            containerHeight="clamp(130px, 36vw, 305px)"
                            containerWidth="100%"
                            imageHeight="clamp(130px, 36vw, 305px)"
                            imageWidth="100%"
                            scaleOnHover={1.04}
                            rotateAmplitude={10}
                            showTooltip={false}
                          />
                        )
                      )}
                    </div>

                    <div className="flex flex-col px-3 pb-3 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:pb-5">
                      <div className="min-w-0 sm:flex-1">
                        <h3 className="truncate text-center font-display text-[13px] font-light tracking-tight text-ink transition-colors group-hover:text-amber sm:overflow-visible sm:whitespace-normal sm:text-left sm:text-2xl sm:leading-tight">
                          {c.title}
                        </h3>
                        <p className="mt-1 text-center font-sans text-[10.5px] leading-[1.4] text-ink-dim sm:mt-2 sm:text-left sm:text-[13.5px] sm:leading-[1.55]">
                          {c.subtitle}
                        </p>
                      </div>
                      <div className="mt-2 flex justify-center sm:mt-0 sm:block sm:text-right">
                        <span className="rounded-full border border-amber/30 px-2 py-0.5 font-mono text-[9px] tracking-[0.05em] text-amber sm:shrink-0 sm:px-3 sm:py-1.5 sm:text-[12px] sm:tracking-[0.08em]">
                          {c.price}
                        </span>
                      </div>
                    </div>

                    <span className="absolute inset-x-0 -bottom-2 h-[1px] origin-left scale-x-0 bg-amber transition-transform duration-700 ease-out group-hover:scale-x-100" />
                  </article>
                ))}
              </motion.div>
            )}

            {/* ============ WINE ============ */}
            {active === 'wine' && (
              <motion.div
                key="wine"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1.1fr_1fr]"
              >
                {/* Mobile/tablet: 2-column wine card grid — same shape
                    as plates/cocktails. Hidden on lg+ where the
                    editorial list + CardSwap take over. */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-3 sm:gap-y-10 sm:gap-x-7 lg:hidden">
                  {wines.map((w) => (
                    <button
                      key={w.name}
                      type="button"
                      onClick={() => setOpenWine(w)}
                      aria-label={`Open ${w.name}`}
                      className="group relative mx-auto flex w-full max-w-[200px] flex-col rounded-[18px] border-[1.5px] border-amber/30 transition-shadow duration-500 hover:shadow-[0_18px_60px_-15px_rgba(212,165,96,0.45)] sm:max-w-[380px] sm:rounded-[24px] sm:border-2"
                      style={{
                        background: `linear-gradient(160deg, ${w.colorStops[0]} 0%, ${w.colorStops[1]} 60%, #1A0B0E 100%)`,
                      }}
                    >
                      <div className="relative m-2 flex h-[clamp(130px,36vw,305px)] items-center justify-center overflow-hidden rounded-[10px] sm:m-[17px] sm:rounded-[16px]">
                        {w.image && (
                          <img
                            src={w.image}
                            alt={w.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex flex-col px-3 pb-3 pt-1 sm:px-5 sm:pb-5">
                        <div className="min-w-0">
                          <h3 className="truncate text-center font-display text-[13px] font-light italic tracking-tight text-ink transition-colors group-hover:text-amber sm:text-2xl">
                            {w.name}
                          </h3>
                          <p className="mt-1 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-dim sm:mt-2 sm:text-[11px] sm:tracking-[0.25em]">
                            {w.variety} · {w.region}
                          </p>
                        </div>
                        <div className="mt-2 flex justify-center">
                          <span className="rounded-full border border-amber/30 px-2 py-0.5 font-mono text-[9px] tracking-[0.05em] text-amber sm:px-3 sm:py-1.5 sm:text-[12px] sm:tracking-[0.08em]">
                            {w.price}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Corkage note — sits below the card grid on mobile,
                      spans both columns. */}
                  <div className="col-span-2 mt-4 flex items-center justify-center gap-3">
                    <span className="inline-block h-[5px] w-[5px] rounded-full bg-amber" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-dim sm:text-[11px] sm:tracking-[0.35em]">
                      corkage · ₹ 600 · bring what you love
                    </span>
                  </div>
                </div>

                {/* Left: editorial copy + wine list (desktop only) */}
                <div className="hidden lg:block">
                  <ul className="ml-12 max-w-[540px] divide-y divide-line/70 border-y border-line/70">
                    {wines.map((w) => (
                      <li
                        key={w.name}
                        className="group cursor-pointer"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenWine(w)}
                          aria-label={`Open ${w.name}`}
                          className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 py-5 text-left transition-colors hover:bg-wine/10 focus:outline-none focus-visible:bg-wine/10"
                        >
                          <span className="font-mono text-[12px] text-amber/80">
                            {w.vintage}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display text-2xl font-light italic leading-tight text-ink transition-colors group-hover:text-amber">
                              {w.name}
                            </h4>
                            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">
                              {w.variety} · {w.region}
                            </p>
                          </div>
                          <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[13px] tracking-[0.06em] text-amber">
                            {w.price}
                            {/* Arrow appears on hover/focus as a click
                                affordance so users see the row opens
                                a detail card. */}
                            <ArrowUpRight
                              size={14}
                              strokeWidth={1.5}
                              className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                            />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 flex items-center gap-5">
                    <span className="inline-block h-[6px] w-[6px] rounded-full bg-amber" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-dim">
                      corkage  ·  ₹ 600  ·  bring what you love
                    </span>
                  </div>
                </div>

                {/* Right: CardSwap bottle stack — pulled up with a
                    negative top margin so the stack sits roughly even
                    with the wine list rather than dropping below it.
                    Container is sized for the visible stack, with
                    bottom margin to keep the bottommost card off the
                    marquee strip. */}
                {/* CardSwap inner anchors to bottom-right of this
                    container (with a 5%/20% translate). To put the
                    visible card stack roughly even with the top of the
                    wine list, the container is sized just to the card
                    height; the swap drop overflow is absorbed by the
                    bottom margin below. */}
                <div className="relative -mt-16 mb-56 hidden h-[520px] -translate-x-16 overflow-visible lg:block">
                  <CardSwap
                    width={440}
                    height={520}
                    cardDistance={48}
                    verticalDistance={56}
                    delay={4200}
                    skewAmount={5}
                    easing="elastic"
                    pauseOnHover
                  >
                    {wines.slice(0, 5).map((w) => (
                      <Card key={w.name}>
                        <WineCardFace w={w} />
                      </Card>
                    ))}
                  </CardSwap>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Foot — full-width amber ticker. Always moves left
          (velocity negative + fixedDirection), hairline amber borders
          above and below, mono uppercase face with wide tracking for a
          vintage ticker feel. */}
      <div className="mt-20 border-y border-amber/40 bg-base/40 py-1.5 [&_.scroller]:font-mono [&_.scroller]:text-[clamp(0.85rem,1.6vw,1.25rem)] [&_.scroller]:font-medium [&_.scroller]:uppercase [&_.scroller]:tracking-[0.35em] [&_.scroller]:text-amber">
        <ScrollVelocity
          texts={['The full carte runs ~40 items  ·  We email the nightly list to regulars']}
          velocity={-40}
          numCopies={6}
          fixedDirection
          className="pr-24"
          scrollerClassName="scroller"
          parallaxClassName="py-0"
        />
      </div>

      {/* Wine focus modal — rendered into document.body via a React
          Portal. The Menu sits inside a GSAP-transformed wrapper which
          creates its own stacking context; without the portal, even
          `z-[300]` was being sandboxed inside that context (effectively
          z-20 from the body's perspective) and the Nav at z-50 sat on
          top. The portal hops the modal out of that subtree entirely. */}
      {createPortal(
        <AnimatePresence>
          {openWine && (
            <motion.div
              key="wine-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setOpenWine(null)}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-base/65 px-6 py-10 backdrop-blur-md"
            >
              <motion.div
                key="wine-modal-card"
                initial={{ opacity: 0, scale: 0.92, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative h-full max-h-[88vh] w-full max-w-[440px] [aspect-ratio:11/16]"
              >
                <WineCardFace w={openWine} />
                <button
                  type="button"
                  onClick={() => setOpenWine(null)}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber/40 bg-base/80 text-amber transition-colors hover:bg-amber hover:text-base"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
