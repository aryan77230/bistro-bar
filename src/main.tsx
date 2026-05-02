import { lazy, Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import App from './App';
import './styles.css';

// Disable the browser's default scroll-restoration so a page refresh
// always opens at the top of the document, regardless of where the
// user was previously scrolled. Without this, refreshing while
// scrolled down (e.g. at the footer) leaves the viewport there after
// reload, which feels broken alongside the PageLoader curtain.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
// Force a fresh scroll to (0, 0) at boot — covers browsers that
// restore scroll before scripts run and catches cached navigations.
if (typeof window !== 'undefined') {
  window.scrollTo(0, 0);
}

// Secondary pages are code-split so the landing route bundles light.
// React.lazy() defers fetching AboutPage / ContactPage until the user
// actually navigates there.
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ReservePage = lazy(() => import('./pages/ReservePage'));
const CancelBookingPage = lazy(() => import('./pages/CancelBookingPage'));

/**
 * Resets scroll to the top of the viewport on every route change so
 * landing on /contact from the footer of / doesn't drop the user into
 * the Contact page's footer. Hash-only changes are skipped — App.tsx
 * owns those (e.g. /#menu).
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

// React.StrictMode intentionally omitted: it double-invokes effects
// (useEffect, useLayoutEffect) in dev, which noticeably compounds the
// cost of the heavy WebGL + rapier + GSAP mounts on the landing page
// and makes route transitions feel sluggish. Production builds never
// run Strict Mode, so removing it only affects dev ergonomics.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ScrollToTop />
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1A0B0E' }} />}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reserve" element={<ReservePage />} />
        <Route path="/b/:token" element={<CancelBookingPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
