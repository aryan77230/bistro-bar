import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * Custom amber dot cursor. Scales up on interactive elements.
 * Only active on fine-pointer devices and when reduced motion isn't requested.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer || reduced) return;

    document.documentElement.classList.add('has-custom-cursor');

    let rafId = 0;
    let rafScheduled = false;
    let mouseX = 0;
    let mouseY = 0;
    // Wait for the first real mousemove before rendering the cursor.
    // Activating on mount would paint the dot + ring at (0, 0) because
    // the transforms haven't been written yet, which shows up as a
    // stray amber ring glued to the top-left corner of the page.
    let activated = false;
    let ringX = 0;
    let ringY = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!activated) {
        // Seed the ring at the current cursor so it doesn't lerp across
        // the page from (0, 0) on first render.
        ringX = mouseX;
        ringY = mouseY;
        activated = true;
        setActive(true);
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      }
      // Kick the RAF chain only when there's something to animate.
      // Without this guard the loop ran every frame even when the
      // cursor wasn't moving, costing ~60 useless writes per second.
      if (!rafScheduled) {
        rafScheduled = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
      }
      // Stop the loop once the ring has caught up to the cursor —
      // restarting it on the next mousemove. 0.4px is below the
      // sub-pixel threshold so the user can't see motion stop.
      if (Math.abs(mouseX - ringX) < 0.4 && Math.abs(mouseY - ringY) < 0.4) {
        rafScheduled = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const handleOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest('a, button, [role="button"], input, textarea, select, [data-magnetic]');
      setHovering(Boolean(interactive));
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseover', handleOver);
    // RAF only starts once the user moves the cursor (handled in
    // `handleMove`). No initial schedule — saves ~60 frames/sec
    // while the page is idle.

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  if (!active) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 rounded-full bg-amber"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99] h-9 w-9 rounded-full border border-amber/40 transition-[width,height,opacity,border-color,background-color] duration-300 ease-out"
        style={{
          willChange: 'transform',
          width: hovering ? '56px' : '36px',
          height: hovering ? '56px' : '36px',
          marginLeft: hovering ? '-10px' : '0',
          marginTop: hovering ? '-10px' : '0',
          backgroundColor: hovering ? 'rgba(212, 165, 96, 0.08)' : 'transparent',
          borderColor: hovering ? 'rgba(212, 165, 96, 0.8)' : 'rgba(212, 165, 96, 0.35)',
        }}
      />
    </>
  );
}
