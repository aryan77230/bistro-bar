import Noise from './reactbits/Noise';

/**
 * Site-wide film grain. Sits above all content, below modals.
 * Uses mix-blend so it tints rather than washing out the image.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[40] opacity-[0.06]"
    >
      <Noise patternAlpha={22} patternRefreshInterval={3} />
    </div>
  );
}
