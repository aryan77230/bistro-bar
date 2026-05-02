import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LogoMark } from './Logo';

/**
 * Intro curtain — black full-screen overlay with the Bistro Bar crest
 * fading + rising in. Lifts after ~2s, then unmounts.
 *
 * Plays ONLY on cold page load (hard refresh / first tab open). SPA
 * route transitions re-mount this component, but the module-level
 * `hasShownLoader` flag suppresses the curtain so users don't see it
 * on every nav click. Flag resets naturally when the JS VM is reset
 * (page refresh).
 */
let hasShownLoader = false;

export default function PageLoader() {
  const [visible, setVisible] = useState(!hasShownLoader);

  useEffect(() => {
    if (hasShownLoader) return;
    hasShownLoader = true;
    // 2.6s gives Hero's WebGL stack (Aurora shader, LightRays, the
    // Rapier physics world for Lanyard) enough time to compile and
    // paint behind the curtain. Curtain previously dropped at 2.0s,
    // which exposed a brief blank frame as it slid up before those
    // canvases were ready.
    setTimeout(() => setVisible(false), 2600);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-base"
          initial={false}
          // Combined slide-up + fade. The slide gives the curtain its
          // signature exit, but a parallel opacity fade softens the
          // trailing edge so it doesn't expose a hard reveal line as
          // it leaves the viewport.
          exit={{ y: '-100%', opacity: 0 }}
          transition={{
            y: { duration: 0.95, ease: [0.83, 0, 0.17, 1] },
            opacity: { duration: 0.55, delay: 0.4, ease: 'easeOut' },
          }}
          aria-hidden="true"
        >
          {/* Crest */}
          <motion.div
            initial={false}
            className="text-ink"
          >
            <LogoMark size={96} />
          </motion.div>

          {/* Wordmark underneath */}
          <motion.div
            initial={false}
            className="mt-6 flex items-baseline gap-2 font-display text-xl md:text-2xl tracking-[0.32em] text-ink"
          >
            <span>BISTRO</span>
            <span className="relative flex h-[5px] w-[5px] items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber/60" />
              <span className="relative h-[5px] w-[5px] rounded-full bg-amber" />
            </span>
            <span>BAR</span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={false}
            className="mt-5 font-mono text-[10px] uppercase tracking-[0.5em] text-amber"
          >
            est. 2024 — durg
          </motion.p>

          {/* Corner status lines */}
          <div className="absolute bottom-10 left-10 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-dim">
            loading
            <span className="ml-2 inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-amber align-middle" />
          </div>
          <div className="absolute bottom-10 right-10 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-dim">
            chhattisgarh · in
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
