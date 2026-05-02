// GlareHover — a cream-swipe on hover. CSS-only implementation via the
// `.glare-hover` class in src/styles.css (which fires on :hover, so
// there's no JS event-timing race). The component just feeds the class
// inline CSS custom properties for palette + size + duration.
import React from 'react';

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  /** Gradient layer size as % of the root. 200–300 is a good range. */
  glareSize?: number;
  transitionDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = 'auto',
  height = 'auto',
  background = 'transparent',
  borderRadius = 'inherit',
  borderColor = 'transparent',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.85,
  glareAngle = -35,
  glareSize = 260,
  transitionDuration = 700,
  className = '',
  style = {},
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const customProps = {
    '--gh-color': rgba,
    '--gh-angle': `${glareAngle}deg`,
    '--gh-size': `${glareSize}%`,
    '--gh-duration': `${transitionDuration}ms`,
  } as React.CSSProperties;

  return (
    <span
      className={`glare-hover ${className}`}
      style={{
        width,
        height,
        background,
        borderRadius,
        borderColor,
        ...customProps,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default GlareHover;
