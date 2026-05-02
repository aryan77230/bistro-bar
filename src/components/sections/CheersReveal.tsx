import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BeerMug from '../BeerMug';
import ClickSpark from '../reactbits/ClickSpark';
import BeerDrops from '../BeerDrops';
import barInterior from '../../assets/lanyard/bar-interior.jpg';

gsap.registerPlugin(ScrollTrigger);

/**
 * CheersReveal — two beer mugs at viewport edges slide in and clink.
 *
 * Timing (section is 200vh total, sticky inner content holds mugs):
 *   scroll 0 → 50vh     : mugs slide from edges to centre + tilt (scrubbed, fast)
 *   scroll 50vh → 100vh : held — mugs clinked, spark visible
 *   scroll 100 → 200vh  : Menu rises up from bottom, covering the clink
 *
 * The Menu section uses `-mt-[100vh]` in App.tsx so it overlaps the last
 * 100vh of this section.
 */
// Mug dimensions are now resolved responsively from viewport width —
// see `useResponsiveMugSize` below. The constants here are the desktop
// reference used to derive mobile values proportionally.
const MUG_HEIGHT = 560;
const OVERLAP_PX = 30; // rims overlap at centre by this much (per side)

/**
 * Returns mug height + overlap + rim-offset scaled to the current
 * viewport so the cheers scene fits cleanly on phones (where the
 * 560-tall desktop mug overflows the screen vertically).
 */
function useResponsiveMugSize() {
  const [size, setSize] = useState(() => ({
    height: MUG_HEIGHT,
    overlap: OVERLAP_PX,
    rimOffset: 130,
  }));
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      // Mug scale per viewport.
      const scale = w < 480 ? 0.45 : w < 768 ? 0.65 : w < 1024 ? 0.85 : 1;
      // Overlap is the visual "clink" depth at centre. On mobile the
      // mugs are tilted, so a small linearly-scaled overlap leaves a
      // visible gap between rims at progress=1. Hardcode larger
      // overlaps on small screens so they actually clink.
      const overlap = w < 480 ? 50 : w < 768 ? 42 : Math.round(OVERLAP_PX * scale);
      setSize({
        height: Math.round(MUG_HEIGHT * scale),
        overlap,
        rimOffset: Math.round(130 * scale),
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}
/** Vertical offset from viewport centre UP to where the mug rims touch. */

export default function CheersReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftMugRef = useRef<HTMLDivElement>(null);
  const rightMugRef = useRef<HTMLDivElement>(null);
  const sparkWrapperRef = useRef<HTMLDivElement>(null);
  const hasClinked = useRef<boolean>(false);
  const mugSize = useResponsiveMugSize();
  // Mirror the responsive size into a ref so the GSAP closure (which
  // is set up once in useLayoutEffect) always reads the current value
  // when ScrollTrigger.refresh() re-evaluates positions on resize.
  const mugSizeRef = useRef(mugSize);
  mugSizeRef.current = mugSize;

  // When the responsive scale changes (resize crossing a breakpoint),
  // poke ScrollTrigger so the function-based `x` targets re-evaluate
  // with the new mug width / overlap.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [mugSize.height, mugSize.overlap]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(leftMugRef.current, { x: 0, yPercent: -50, rotate: -4 });
      gsap.set(rightMugRef.current, { x: 0, yPercent: -50, rotate: 4 });

      // Pixel targets computed at runtime from the live viewport + mug width.
      const compute = () => {
        const vw = window.innerWidth;
        const mugW = leftMugRef.current?.offsetWidth ?? mugSizeRef.current.height * 0.8;
        return {
          leftTarget: vw / 2 - mugW + mugSizeRef.current.overlap,
          rightTarget: -(vw / 2 - mugW + mugSizeRef.current.overlap),
        };
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          // Animation starts when the mugs first peek in from below and
          // extends over 200vh of scroll — roughly twice the prior range.
          // That makes the approach feel slow and deliberate instead of
          // snapping together within the first few scrolls.
          // Pushed later: mugs hold off until the section is more in
          // view (`top 55%` instead of `top 75%`) so there's a beat of
          // anticipation before they begin closing in.
          start: 'top 55%',
          // Section was shrunk to 180vh, so the mug timeline must end
          // before sticky releases (~179vh into the section). 170vh
          // keeps the clink visible while the inner content is still
          // pinned in view.
          // Mug timeline ends sooner so the clink happens earlier in
          // the scroll. Menu cover is timed to 5–6vh after this.
          end: '+=120vh',
          // Higher scrub = more inertia / catch-up smoothing, so the
          // mug motion glides instead of locking 1:1 to the wheel.
          // Tighter scrub catch-up (was 1.0s). Combined with Lenis's
          // own smoothing, the previous value left the mug motion
          // running ~1.5s behind the wheel, which read as choppy /
          // stepped frames during slow scroll. 0.4 keeps the glide
          // smooth while staying responsive frame-to-frame.
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress >= 0.95 && !hasClinked.current) {
              hasClinked.current = true;
              fireClink();
            } else if (self.progress < 0.75 && hasClinked.current) {
              hasClinked.current = false;
            }
          },
        },
      });

      tl.to(
        leftMugRef.current,
        {
          x: () => compute().leftTarget,
          yPercent: -50,
          rotate: 20,
          ease: 'none',
          duration: 1,
        },
        0
      );

      tl.to(
        rightMugRef.current,
        {
          x: () => compute().rightTarget,
          yPercent: -50,
          rotate: -20,
          ease: 'none',
          duration: 1,
        },
        0
      );

      // Menu fast-rise — after the clink, the menu panel covers the viewport
      // in 40vh of scroll (instead of the natural 100vh it would take flowing
      // with the document).
      //
      // Section height is 265vh. Menu wrapper has `-mt-[100vh]` in App.tsx,
      // so its natural doc top = section.top + 165vh.
      //
      // Math: menu starts OFFSET 60vh down from its flow position (hidden
      // below viewport). At anim start (scroll = section.top + 125vh, same
      // as clink), menu.visual.top = section.top + 225vh — just at viewport
      // bottom. Over 40vh of scroll the tween interpolates y from 60vh → 0,
      // so by scroll = section.top + 165vh the menu is at its natural flow
      // position (visual.top = section.top + 165vh = viewport top) fully
      // covering the viewport. No residual translate after — avoids a layout
      // jump when the section ends 100vh later.
      gsap.fromTo(
        '[data-menu-cover]',
        // Start the menu fully BELOW the viewport so it doesn't peek
        // into the cheers scene before the tween fires. With the
        // section's `-mt-[100vh]` placing the menu's flow top at
        // `section.top + 80vh`, an offset of 160vh keeps the menu's
        // visible top a clean 10vh below the viewport bottom even at
        // tween start (~130vh into the section), so the mug bottoms
        // are never cropped by an early menu peek.
        { y: '160vh' },

        {
          // Overshoot well past 0 so the menu fully covers within the
          // tween range itself — without overshoot, the natural flow
          // position (section.top + 80vh) becomes the earliest the
          // menu can cover regardless of how short the tween is.
          // Tween ENDS at y=0 (menu's natural flow position) — no
          // permanent shift, no hidden top content. The 21vh scroll
          // gap between clink (sectionTop+59vh) and natural flow
          // (sectionTop+80vh) is unavoidable layout math, BUT
          // power4.out front-loads the motion so the menu visually
          // snaps up in the first ~5vh of scroll past the clink, then
          // settles smoothly into place over the remaining 16vh.
          y: 0,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            // With the section now 180vh and `-mt-[100vh]` on the menu
            // wrapper, the menu's natural full-cover scroll is
            // `section.top + 80vh`. Tween end MUST equal that scroll
            // so the menu actually finishes covering at tween end (any
            // earlier and the user has to keep scrolling for natural
            // motion to bring it up). Start at 60vh + 20vh duration =
            // tween ends at 80vh — a sharp 20vh-long snap that fires
            // partway through the cheers approach.
            // Mug timeline: start 'top 55%' = scroll sectionTop-55vh,
            // end '+=120vh' = scroll sectionTop+65vh, clink at progress
            // 0.95 = scroll sectionTop+59vh.
            // Menu cover MUST start at the clink, not 60vh later.
            // Trigger fires at sectionTop+59vh, overshoots y to -50vh
            // so menu fully covers within ~5vh of scroll past the clink.
            start: 'top+=59vh top',
            // End at the menu's natural flow position (sectionTop+80vh)
            // so y lands exactly at 0 — clean handoff to natural scroll.
            end: 'top+=80vh top',
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /** Double-dispatch a synthetic click at the ClickSpark wrapper's centre
   *  so ClickSpark's onClick handler fires twice with a small gap — a more
   *  pronounced double-clink burst. */
  const fireClink = () => {
    const wrapper = sparkWrapperRef.current;
    if (!wrapper) return;
    const clickDiv = wrapper.firstElementChild as HTMLElement | null;
    if (!clickDiv) return;
    const dispatch = () => {
      const rect = clickDiv.getBoundingClientRect();
      clickDiv.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        })
      );
    };
    dispatch();
    setTimeout(dispatch, 160);
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Cheers transition into menu"
      className="relative h-[180vh] bg-base"
    >
      {/* Sticky scene container — sized just to the mug area on
          mobile so there's almost no empty bar bg above or below.
          The bg image, vignette, and mug positions all live in this
          container, so cutting its height collapses the gaps. */}
      <div className="sticky top-0 flex h-[42vh] items-center overflow-hidden sm:h-screen">
        {/* Ambient bar-interior background — heavily dimmed + blurred so it
            reads as "room atmosphere" rather than a featured photograph. */}
        <img
          src={barInterior}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.35] [filter:brightness(0.75)_saturate(1)_blur(1px)]"
        />
        {/* Dark vignette — lighter so the photo reads more clearly, still
            dark enough around the mugs that they remain the focus. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,11,14,0.35)_30%,rgba(26,11,14,0.65)_75%,rgba(26,11,14,0.88)_100%)]"
        />
        {/* Warm amber wash at the centre — same as before */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,165,96,0.1),transparent_65%)]"
        />

        {/* Wine-coloured metaball drops framing the cheers scene. Low opacity
            + edge positioning so they hug the corners and don't crowd the
            mugs. Non-interactive — they drift on their own. */}
        <div className="pointer-events-none absolute -left-20 -top-20 hidden h-[420px] w-[420px] opacity-30 blur-[1px] md:block">
          <BeerDrops variant="stout" ballCount={7} interactive={false} />
        </div>
        <div className="pointer-events-none absolute -right-24 top-1/4 hidden h-[360px] w-[360px] opacity-25 blur-[1.5px] md:block">
          <BeerDrops variant="stout" ballCount={6} interactive={false} />
        </div>
        <div className="pointer-events-none absolute -bottom-20 left-1/4 hidden h-[380px] w-[380px] opacity-25 blur-[2px] md:block">
          <BeerDrops variant="stout" ballCount={6} interactive={false} />
        </div>
        <div className="pointer-events-none absolute -right-20 -bottom-24 hidden h-[400px] w-[400px] opacity-30 blur-[1px] lg:block">
          <BeerDrops variant="stout" ballCount={7} interactive={false} />
        </div>

        {/* Left mug */}
        <div
          ref={leftMugRef}
          className="absolute left-0 top-1/2"
          style={{ transformOrigin: 'bottom center' }}
        >
          <BeerMug size={mugSize.height} mirror />
        </div>

        {/* Right mug */}
        <div
          ref={rightMugRef}
          className="absolute right-0 top-1/2"
          style={{ transformOrigin: 'bottom center' }}
        >
          <BeerMug size={mugSize.height} />
        </div>

        {/* Spark at rim meeting point — ABOVE centre, above mugs (z-50). */}
        <div
          ref={sparkWrapperRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-50"
          style={{
            width: '280px',
            height: '280px',
            transform: `translate(-50%, calc(-50% - ${mugSize.rimOffset}px))`,
          }}
        >
          <ClickSpark
            sparkColor="#F5E7D0"
            sparkSize={32}
            sparkRadius={90}
            sparkCount={18}
            duration={900}
            easing="ease-out"
            extraScale={1.5}
          >
            <div className="h-full w-full" />
          </ClickSpark>
        </div>
      </div>
    </section>
  );
}
