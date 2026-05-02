import beerMugImg from '../assets/beer-mug.png';

interface BeerMugProps {
  className?: string;
  /** Mirror horizontally — use for the right-side mug of a cheers pair. */
  mirror?: boolean;
  /** Desired mug HEIGHT in px. Width follows the image's intrinsic aspect. */
  size?: number | string;
}

/**
 * BeerMug — renders the frosty-amber glass PNG. Wrapping element's width
 * tracks the image's natural aspect so `offsetWidth` reflects the actual
 * visible mug width (important for the CheersReveal translation math).
 */
export default function BeerMug({ className, mirror = false, size = 520 }: BeerMugProps) {
  const h = typeof size === 'number' ? size : parseFloat(size);
  return (
    <img
      src={beerMugImg}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={className}
      style={{
        height: h,
        width: 'auto',
        display: 'block',
        transform: mirror ? 'scaleX(-1)' : undefined,
        userSelect: 'none',
      }}
    />
  );
}
