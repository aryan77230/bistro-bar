import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Nav from '../components/sections/Nav';
import Footer from '../components/sections/Footer';
import RotatingText from '../components/reactbits/RotatingText';
import aboutBgImg from '../assets/hero-bar.jpg';

/**
 * AboutPage — a dedicated full page for Bistro Bar's story. Editorial
 * layout mixing long-form copy, a pressed-quote pull, founder credit,
 * a numbered awards / press strip, and a wood-fired process section.
 */
export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden pt-32 md:pt-40">
        {/* Ambient bar photo backdrop — same treatment as ContactPage:
            anchored to the top, low opacity, fades into the base by
            the time content reaches the long-form copy. Different
            image (hero-bar.jpg) so the two pages feel related but
            distinct. Sits at z-0; content sections carry `relative
            z-10` to stack above. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[210vh] overflow-hidden"
        >
          <img
            src={aboutBgImg}
            alt=""
            className="h-full w-full object-cover opacity-[0.16] [filter:brightness(0.85)_saturate(0.9)]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(26,11,14,0.35) 0%, rgba(26,11,14,0.55) 50%, rgba(26,11,14,0.75) 82%, #1A0B0E 100%)',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_18%,rgba(212,165,96,0.2),transparent_55%)]" />
        </div>

        {/* HERO */}
        <section className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.35em] text-ink-dim transition-colors hover:text-amber"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back home
          </Link>

          <div className="mt-12 flex items-center justify-center gap-4">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
              The Bistro Bar Story
            </span>
            <span className="h-[1px] w-10 bg-amber" />
          </div>

          <h1 className="mx-auto mt-8 max-w-6xl font-display text-[clamp(1.4rem,4vw,3.5rem)] font-light leading-[1.2] tracking-tight text-ink sm:leading-[1.15]">
            <span className="block text-center">
              Two rooms.{' '}
              <span className="italic text-ink-dim">One kitchen.</span>
            </span>
            <span className="mt-3 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center sm:gap-x-3">
              A shared stubborn belief in
              <RotatingText
                texts={['fire.', 'salt.', 'time.']}
                rotationInterval={2400}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-110%', opacity: 0 }}
                splitBy="characters"
                staggerDuration={0.01}
                mainClassName="inline-flex italic text-amber"
                elementLevelClassName="inline-block"
              />
            </span>
          </h1>
        </section>

        {/* Three-stat strip */}
        <section className="relative z-10 mx-auto mt-28 max-w-[1440px] px-6 md:px-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 md:gap-x-10">
            {[
              { n: '2024', l: 'Year opened' },
              { n: '42', l: 'Seats, no more' },
              { n: '7', l: 'Cooks on the line' },
              { n: '84°C', l: 'Water at the pass' },
            ].map((s) => (
              <div key={s.l} className="border-t border-amber/40 pt-5">
                <p className="font-display text-5xl font-light text-ink md:text-6xl">{s.n}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-dim">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pull quote */}
        <section className="relative z-10 mx-auto mt-28 max-w-[1100px] px-6 text-center md:px-10">
          <div className="mx-auto h-[1px] w-16 bg-amber" />
          <blockquote className="mt-10 font-display text-[clamp(1.8rem,3.5vw,3rem)] font-light italic leading-[1.25] text-ink">
            "You can taste when a kitchen is afraid of itself. Ours isn't. We
            cook from the pilot light up, and we let the room smell like
            Sunday every single night."
          </blockquote>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
            Aarav Mitra — Chef &amp; Proprietor
          </p>
        </section>

        {/* Process section */}
        <section className="relative z-10 mx-auto mt-32 max-w-[1440px] px-6 md:px-10">
          <div className="flex items-center justify-center gap-4">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
              02 — Process
            </span>
            <span className="h-[1px] w-10 bg-amber" />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-center font-display text-[clamp(1.5rem,4.5vw,3.5rem)] font-light leading-[1.15] tracking-tight text-ink sm:leading-[1.05]">
            Fire on one side.{' '}
            <span className="italic text-ink-dim">Ice on the other.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Sourcing',
                b: 'Three dockside fishers. Two farms within 80km. One butcher who still calls before he slaughters. The carte is written the morning it prints.',
              },
              {
                n: '02',
                t: 'Fire',
                b: 'A custom-built sal-wood hearth runs the length of the pass. Everything that needs char gets char. Everything that doesn\'t gets butter, quietly.',
              },
              {
                n: '03',
                t: 'Bar',
                b: 'Ingredients macerate for weeks. Ice is hand-cut from a 14kg block nightly. Negronis wait twenty-four hours in oak. Nothing is rushed.',
              },
            ].map((c) => (
              <article
                key={c.n}
                className="rounded-2xl border border-line/60 bg-elevated/40 p-8 transition-colors duration-300 hover:border-amber/50"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
                  {c.n}
                </span>
                <h3 className="mt-5 font-display text-2xl font-light italic text-ink">
                  {c.t}
                </h3>
                <p className="mt-4 font-sans text-[14px] leading-[1.7] text-ink/80">
                  {c.b}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Press strip */}
        <section className="relative z-10 mx-auto mt-32 max-w-[1440px] px-6 md:px-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">
            03 — Press &amp; Recognition
          </span>
          <div className="mt-10 space-y-4">
            {[
              {
                y: '2025',
                p: 'Condé Nast Traveller India',
                q: '"The most surprising twelve seats in Chhattisgarh."',
              },
              {
                y: '2025',
                p: 'Outlook Responsible Tourism',
                q: '"A case study in slow cooking, short menus, and longer evenings."',
              },
              {
                y: '2024',
                p: 'The Hindu Weekend',
                q: '"Aarav Mitra cooks as though his grandmother is still at the pass."',
              },
              {
                y: '2024',
                p: 'Asia\'s 50 Best Discovery List',
                q: 'Featured — Emerging Regional Kitchens.',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="group grid grid-cols-12 items-baseline gap-4 border-t border-line/60 py-6 transition-colors hover:border-amber/40"
              >
                <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.35em] text-amber">
                  {p.y}
                </span>
                <span className="col-span-10 font-display text-xl italic text-ink md:col-span-3">
                  {p.p}
                </span>
                <span className="col-span-12 font-sans text-[14px] leading-[1.6] text-ink-dim md:col-span-7">
                  {p.q}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative z-10 mx-auto mt-32 max-w-[1100px] px-6 pb-24 text-center md:px-10 md:pb-32">
          <p className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-light italic text-ink">
            Still hungry?{' '}
            <span className="text-amber">We usually are too.</span>
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <a
              href="/#menu"
              className="group inline-flex items-center gap-3 rounded-full bg-amber px-8 py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.28em] text-base shadow-[0_8px_30px_-8px_rgba(212,165,96,0.6)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#E5BA72]"
            >
              See the menu
              <span
                aria-hidden="true"
                className="h-[1px] w-5 bg-base/70 transition-all duration-300 group-hover:w-9 group-hover:bg-base"
              />
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 border-b border-amber/50 pb-1 font-mono text-[12px] uppercase tracking-[0.28em] text-ink transition-colors hover:border-amber hover:text-amber"
            >
              Write to us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
