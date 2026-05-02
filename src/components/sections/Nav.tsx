import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { LogoWordmark } from '../Logo';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact', href: '/contact' },
];

function NavLinks() {
  const location = useLocation();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Derive the active nav item from the current URL so the pill stays
  // in sync with route changes (clicking, back/forward, deep-linking).
  // Hash links like '/#menu' match when on '/' AND hash equals '#menu';
  // route links like '/about' match when pathname equals that path.
  const activeIdx = LINKS.findIndex((l) => {
    const [path, hash] = l.href.split('#');
    const linkPath = path || '/';
    if (hash !== undefined) {
      return location.pathname === linkPath && location.hash === `#${hash}`;
    }
    return location.pathname === linkPath;
  });

  const highlightIdx = hoverIdx ?? activeIdx;

  return (
    <ul
      className="relative flex items-center gap-0.5"
      onMouseLeave={() => setHoverIdx(null)}
    >
      {LINKS.map((l, i) => {
        const isHighlighted = highlightIdx === i;
        const isActive = activeIdx === i;
        return (
          <li key={l.href} className="relative">
            {/* All links route via react-router Link — including hash
                links like /#menu — so SPA navigation is preserved and
                the PageLoader doesn't re-fire. A hash-aware scroll
                effect in App.tsx handles in-page jumps. */}
            <Link
              to={l.href}
              onMouseEnter={() => setHoverIdx(i)}
              className={clsx(
                'relative z-10 inline-block rounded-full px-5 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.22em] transition-colors duration-300',
                isActive
                  ? 'text-base'
                  : isHighlighted
                    ? 'text-ink'
                    : 'text-ink/85 hover:text-ink'
              )}
            >
              {isHighlighted && !isActive && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 -z-[1] rounded-full bg-ink/5"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-[1] rounded-full bg-amber shadow-[0_0_24px_-4px_rgba(212,165,96,0.6)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-out',
        'pt-6 md:pt-8'
      )}
    >
      <div
        className={clsx(
          'mx-auto flex max-w-[1440px] items-center justify-between px-4 md:px-8',
          scrolled ? '' : ''
        )}
      >
        {/* === Glass pill wrapper ===
            Backdrop glow is now PERMANENT — always show the warm amber wash
            under the pill. `scrolled` only tightens the border / backdrop-blur. */}
        <div
          className={clsx(
            'flex w-full items-center justify-between gap-4 rounded-full border backdrop-blur-xl transition-all duration-500 ease-out',
            'px-4 py-2 md:px-6 md:py-3',
            // Stronger warm glow + higher-contrast surface so the nav reads
            // clearly against both the Hero backdrop and the photo behind.
            'shadow-[0_14px_55px_-6px_rgba(212,165,96,0.55),_inset_0_1px_0_0_rgba(245,231,208,0.1)]',
            scrolled
              ? 'border-amber/65 bg-base/90'
              : 'border-amber/45 bg-base/80'
          )}
        >
          {/* Wordmark with crest logo */}
          <a
            href="#top"
            className="group shrink-0 pl-2 pr-1 transition-opacity group-hover:opacity-80"
            aria-label="Bistro Bar — home"
          >
            <LogoWordmark markSize={30} textSize="18px" />
          </a>

          {/* Center: animated pill links (desktop only) */}
          <div className="hidden flex-1 justify-center md:flex">
            <NavLinks />
          </div>

          {/* Reserve CTA — desktop. Simple solid amber pill. */}
          <div className="hidden shrink-0 md:block">
            <Link
              to="/reserve"
              aria-label="Reserve a table"
              className="inline-flex cursor-pointer items-center rounded-full bg-amber px-7 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.28em] text-base shadow-[0_8px_30px_-8px_rgba(212,165,96,0.6)] ring-1 ring-amber/40 transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#E5BA72] hover:shadow-[0_12px_36px_-6px_rgba(212,165,96,0.75)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber/60"
            >
              Reserve
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="relative flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={clsx(
                'h-[1.5px] w-5 bg-ink transition-transform duration-300',
                mobileOpen && 'translate-y-[6.5px] rotate-45'
              )}
            />
            <span
              className={clsx(
                'h-[1.5px] w-5 bg-ink transition-opacity duration-300',
                mobileOpen && 'opacity-0'
              )}
            />
            <span
              className={clsx(
                'h-[1.5px] w-5 bg-ink transition-transform duration-300',
                mobileOpen && '-translate-y-[6.5px] -rotate-45'
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          'mx-4 mt-3 overflow-hidden rounded-[28px] border border-amber/20 bg-base/95 backdrop-blur-xl transition-[max-height,opacity,transform] duration-500 ease-out md:hidden',
          mobileOpen ? 'max-h-[75vh] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        )}
      >
        <ul className="flex flex-col px-6 py-6">
          {LINKS.map((l) => (
            <li key={l.href} className="border-b border-line/50 last:border-0">
              <Link
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-5 font-display text-2xl text-ink transition-colors hover:text-amber"
              >
                <span>{l.label}</span>
              </Link>
            </li>
          ))}
          <li className="mt-6">
            <Link
              to="/reserve"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-full border border-amber px-6 py-4 text-center font-mono text-[12px] uppercase tracking-[0.25em] text-amber transition-colors hover:bg-amber hover:text-base"
            >
              Reserve a Table
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
