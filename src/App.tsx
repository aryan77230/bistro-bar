import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from './lib/useLenis';
import GrainOverlay from './components/GrainOverlay';
import Cursor from './components/Cursor';
import PageLoader from './components/PageLoader';
import Nav from './components/sections/Nav';
import Hero from './components/sections/Hero';
import IntroStrip from './components/sections/IntroStrip';
import DishesMarquee from './components/sections/DishesMarquee';
import CheersReveal from './components/sections/CheersReveal';
import Menu from './components/sections/Menu';
import Footer from './components/sections/Footer';

export default function App() {
  useLenis();
  const location = useLocation();

  // Hash-aware scroll — when location.hash changes (e.g. user clicks
  // Menu link from /contact, landing here with `#menu`), scroll the
  // corresponding section into view. Delay one frame so the target
  // element is mounted before we try to find it.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    // Tiny timeout gives Lenis + freshly mounted sections a tick to settle.
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <>
      <PageLoader />
      <GrainOverlay />
      <Cursor />

      <Nav />

      <main>
        <Hero />
        <IntroStrip />
        <DishesMarquee />
        <CheersReveal />
        {/* Menu overlaps the last 100vh of CheersReveal. As the user scrolls
            through the second half of CheersReveal, the mugs finish their
            clink animation while Menu rises up from below to cover them.
            Reverses smoothly on scroll-up. */}
        <div className="relative z-20 -mt-[100vh]" data-menu-cover>
          <Menu />
        </div>
      </main>

      {/* Landing footer — Bistro crest centred inside an orbiting amber
          CircularText ring, nav links + copyright below. About and
          Contact are now standalone routes at /about and /contact. */}
      <Footer />
    </>
  );
}
