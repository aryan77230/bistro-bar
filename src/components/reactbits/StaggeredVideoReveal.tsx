// StaggeredVideoReveal — hover-triggered video overlay for cards.
//
// Adapted from React Bits' StaggeredMenu. Instead of a fullscreen
// menu opening on click, this fills its parent on `mouseenter` with
// a staggered slide of coloured layers followed by a `<video>` panel
// that autoplays the supplied `videoSrc`. On `mouseleave` everything
// slides back out and the video pauses.
//
// Usage:
//   <div className="relative h-[305px]">
//     <StaggeredVideoReveal
//       videoSrc="/path/to/clip.mp4"
//       colors={['#7C2835', '#3A1810', '#1A0B0E']}
//     >
//       <img src="..." />  {/* base content */}
//     </StaggeredVideoReveal>
//   </div>
//
// `colors` are the underlay layers that slide in before the video.
// Default direction is right-to-left.

import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface StaggeredVideoRevealProps {
  videoSrc: string;
  colors?: string[];
  /** Where the layers slide in from. */
  direction?: 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export default function StaggeredVideoReveal({
  videoSrc,
  colors = ['#7C2835', '#3A1810', '#1A0B0E'],
  direction = 'right',
  className = '',
  children,
}: StaggeredVideoRevealProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const isOpenRef = useRef(false);

  const offscreen = direction === 'left' ? -100 : 100;

  // Initial state — everything offscreen.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const layers = preLayersRef.current?.children ?? [];
      gsap.set([...Array.from(layers), panelRef.current], {
        xPercent: offscreen,
      });
    }, wrapperRef);
    return () => ctx.revert();
  }, [offscreen]);

  const playOpen = useCallback(() => {
    if (isOpenRef.current) return;
    isOpenRef.current = true;
    closeTweenRef.current?.kill();
    openTlRef.current?.kill();

    const layers = Array.from(preLayersRef.current?.children ?? []);
    const panel = panelRef.current;
    if (!panel) return;

    const tl = gsap.timeline({
      onStart: () => {
        // Kick off video playback at open. Browsers require muted
        // for programmatic play().
        videoRef.current?.play().catch(() => {});
      },
    });

    layers.forEach((layer, i) => {
      tl.fromTo(
        layer,
        { xPercent: offscreen },
        { xPercent: 0, duration: 0.5, ease: 'power4.out' },
        i * 0.07,
      );
    });

    const lastLayerTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: 0.55, ease: 'power4.out' },
      lastLayerTime + (layers.length ? 0.08 : 0),
    );

    openTlRef.current = tl;
  }, [offscreen]);

  const playClose = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    openTlRef.current?.kill();

    const layers = Array.from(preLayersRef.current?.children ?? []);
    const panel = panelRef.current;
    if (!panel) return;

    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([panel, ...layers], {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          // Rewind so re-hover starts from the top.
          videoRef.current.currentTime = 0;
        }
      },
    });
  }, [offscreen]);

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      onMouseEnter={playOpen}
      onMouseLeave={playClose}
    >
      {/* Base content (the card image) */}
      <div className="absolute inset-0">{children}</div>

      {/* Staggered colour underlays */}
      <div
        ref={preLayersRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5]"
      >
        {colors.map((c, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Video panel — slides in last */}
      <div
        ref={panelRef}
        className="pointer-events-none absolute inset-0 z-[10] bg-black"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
