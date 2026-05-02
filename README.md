# Bistro Bar — Cinematic Restaurant Site

Vite + React + TypeScript + Tailwind v4. Dark-mode, scroll-driven marketing site for **Bistro Bar** (Durg, Chhattisgarh). Built with React Bits animated components, Framer Motion, GSAP + ScrollTrigger, and Lenis smooth scroll.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:5173.

```bash
npm run build      # typecheck + production build
npm run preview    # preview the production build
npm run typecheck  # typecheck only
```

## What's built so far

**Foundation**
- Tailwind v4 (CSS-first config) with the full Bistro Bar palette in `src/styles.css`
- Fraunces (display), Inter (body), JetBrains Mono (accents) via `@fontsource`
- Lenis smooth scroll wired into GSAP ScrollTrigger (`src/lib/useLenis.ts`)
- Reduced-motion detection (`src/lib/useReducedMotion.ts`)
- Site-wide film grain overlay
- Custom amber cursor (desktop / fine pointer only)
- Intro curtain with decrypting "BISTRO · BAR" wordmark

**Sections**
- **Nav** — sticky, transparent → solid on hero exit, amber dot wordmark, mobile drawer, `StarBorder` Reserve button
- **Hero** — Aurora WebGL background in wine→amber, vignette, 3-line SplitText headline, BlurText eyebrow, Magnet + ShinyText "See the menu", StarBorder "Book a Table", DecryptedText live-clock counter, animated scroll cue

Sections 3–13 land in the next pass.

## Project structure

```
src/
├── components/
│   ├── reactbits/         # ReactBits components, fetched via MCP
│   │   ├── Aurora.tsx
│   │   ├── BlurText.tsx
│   │   ├── ClickSpark.tsx
│   │   ├── DecryptedText.tsx
│   │   ├── Magnet.tsx
│   │   ├── Noise.tsx
│   │   ├── ShinyText.tsx
│   │   ├── SplitText.tsx
│   │   └── StarBorder.tsx
│   ├── sections/
│   │   ├── Nav.tsx
│   │   └── Hero.tsx
│   ├── Cursor.tsx
│   ├── GrainOverlay.tsx
│   └── PageLoader.tsx
├── lib/
│   ├── useLenis.ts
│   └── useReducedMotion.ts
├── App.tsx
├── main.tsx
└── styles.css             # Tailwind v4 + tokens + keyframes
```

## Where to swap content

| What | Where |
|------|-------|
| Hero image (optional) | `src/components/sections/Hero.tsx` — uncomment the `<img>` tag and drop a direct Unsplash URL. Try https://unsplash.com/s/photos/dim-bar-cocktail |
| Headline / eyebrow copy | `src/components/sections/Hero.tsx` |
| Business address / phone / hours | Will live in `src/data/business.ts` once the footer lands. Pulled from the GoHighLevel sub-account. |
| Reservation endpoint | Form will POST to `src/lib/reserve.ts` — wire to your backend when it's ready |
| Color palette | `@theme` block in `src/styles.css` |

## Business data

Pulled from GoHighLevel sub-account `xxxxxxxxxxxxxxxxxxxx`:

- **Name:** Bistro Bar Restaurant
- **Address:** rishabh city prime, Durg, Chhattisgarh 491331, IN
- **Phone:** +91 91746 05085
- **Email:** public email TBD (GHL field holds an internal address)

## Tech notes

- **`motion` vs `framer-motion`:** ReactBits imports from `motion/react`. The `motion` package is the current name for Framer Motion v12+; API is unchanged.
- **GSAP SplitText:** Bundled free in GSAP 3.13+. No Club GreenSock license needed.
- **Lenis package:** Using `lenis` (current name). The older `@studio-freight/lenis` also works if you prefer.
- **Tailwind v4:** Config lives in `src/styles.css` inside the `@theme` block. No `tailwind.config.js` needed.

## Accessibility

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`
- `prefers-reduced-motion` disables Lenis, the custom cursor, and heavy animations
- Keyboard-navigable, amber focus rings
- Mobile nav properly labelled with `aria-expanded` / `aria-label`

## License

Private. All code authored for Bistro Bar.
