# Bistro Bar Reservations + Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Bistro Bar website to a working reservations system + feedback form, persisting to Supabase and triggering email automations via GoHighLevel — so a real customer can book a table at `/reserve`, get a confirmation email, and cancel via a tokenized link.

**Architecture:** A Vite SPA frontend talks to Vercel serverless functions in `/api/*.ts`. The functions hold the Supabase service-role key (never shipped to browser) and the GHL Private Integration Token. All Postgres writes go through SECURITY DEFINER RPCs already defined in `automation/supabase/03_rpcs.sql`. After each booking/feedback insert, the API also upserts the contact in GHL and adds a tag — the rest of the email choreography lives in GHL Workflows (already documented in `automation/ghl/`).

**Tech Stack:**
- Frontend: Vite 6, React 18.3, React Router v7, Tailwind v4, motion/react
- Backend: Vercel Functions (Node.js), `@supabase/supabase-js`, native `fetch`
- Validation: `zod` (shared between client and server)
- Tests: `vitest` + `@vitest/ui` + happy-dom (component tests later if time)

**Prerequisites (must be done before Task 1):**
1. ✅ All SQL files in `automation/supabase/` have been run against the Supabase project (4 files)
2. ✅ All GHL setup completed (custom fields, pipeline, 6 workflows, 6 email templates imported)
3. ✅ Pipeline + stage IDs collected for Vercel env vars
4. The user has an `.env.local` ready to populate (or they're using Vercel CLI's `vercel env pull`)

---

## File Map

**New files:**
```
api/
├── _lib/
│   ├── supabase.ts              ← server-side client (service role)
│   ├── ghl.ts                   ← GHL v2 REST client + helpers
│   ├── schemas.ts               ← zod request schemas (shared with frontend)
│   ├── format.ts                ← date/time formatters (IST locale)
│   └── env.ts                   ← typed env-var loader (fails fast on missing)
├── availability.ts              ← GET /api/availability
├── feedback.ts                  ← POST /api/feedback
└── bookings/
    ├── index.ts                 ← POST /api/bookings
    └── [token]/
        ├── index.ts             ← GET /api/bookings/[token]
        └── cancel.ts            ← POST /api/bookings/[token]/cancel

src/
├── lib/
│   ├── api.ts                   ← typed fetch wrappers
│   └── format.ts                ← date/time formatters (re-exports api/_lib/format)
├── pages/
│   ├── ReservePage.tsx          ← 4-step booking wizard
│   └── CancelBookingPage.tsx    ← shows booking + cancel button at /b/:token
└── components/reserve/
    ├── DatePicker.tsx           ← 14-day picker
    ├── PartySizePicker.tsx      ← 1-6 pill buttons
    ├── TimeSlotGrid.tsx         ← 7 slots × availability badge
    ├── DetailsForm.tsx          ← name/phone/email/notes
    └── ConfirmationCard.tsx     ← post-submit summary + cancel link

tests/                           ← (vitest discovers tests here OR alongside files)
└── api/
    └── _lib/
        ├── schemas.test.ts
        ├── ghl.test.ts
        └── format.test.ts

docs/
└── superpowers/
    └── plans/
        └── 2026-04-27-bistro-bar-reservations.md   ← this file

.env.example                     ← documents required env vars
.env.local                       ← (gitignored) user populates with real values
vitest.config.ts                 ← test runner config
```

**Modified files:**
- `package.json` — add deps: `@supabase/supabase-js`, `zod`, `@vercel/node`; devDeps: `vitest`, `@vitest/ui`, `happy-dom`; scripts: `test`, `test:ui`
- `src/main.tsx` — add `<Route>` entries for `/reserve` and `/b/:token`
- `src/components/sections/Nav.tsx` — Reserve CTA: `<a href="#reserve">` → `<Link to="/reserve">`
- `src/components/sections/Hero.tsx` — Reserve CTA: same change
- `src/pages/ContactPage.tsx` — replace fake setTimeout submit with real `submitFeedback()` call
- `.gitignore` — add `.env.local` if not already present
- `tsconfig.json` (or `tsconfig.app.json`) — verify `api/` is in the include path or add a separate `tsconfig.api.json`

---

## Phase 0 — Foundation

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add runtime dependencies**

```bash
npm install @supabase/supabase-js@^2.45.0 zod@^3.23.0
```

- [ ] **Step 2: Add Vercel Functions types + test runner**

```bash
npm install -D @vercel/node@^3.2.0 vitest@^2.1.0 @vitest/ui@^2.1.0 happy-dom@^15.7.0
```

- [ ] **Step 3: Add `test` scripts to `package.json`**

Edit `package.json` `scripts` block to look like:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -b --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 4: Verify install**

Run: `npm run typecheck`
Expected: PASS (no errors — same as before, just with new packages installed).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, zod, vitest, vercel-node deps"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.vercel'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'vitest.config.ts', 'vite.config.ts'],
    },
  },
});
```

- [ ] **Step 2: Add a smoke test to verify the runner works**

Create `tests/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run it**

Run: `npm test`
Expected: `1 passed`

- [ ] **Step 4: Delete the smoke test**

```bash
rm tests/smoke.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: configure vitest"
```

---

### Task 3: Environment variable scaffolding

**Files:**
- Create: `.env.example`
- Create: `.env.local` (gitignored)
- Modify: `.gitignore`

- [ ] **Step 1: Create `.env.example` (this gets committed; documents required vars)**

```bash
# === Supabase ===
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJ...your-publishable-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-secret-service-role-key...

# === GoHighLevel ===
GHL_LOCATION_ID=xxxxxxxxxxxxxxxxxxxx
GHL_PIT=pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
GHL_PIPELINE_ID=
GHL_STAGE_BOOKED=
GHL_STAGE_SEATED=
GHL_STAGE_COMPLETED=
GHL_STAGE_CANCELLED=
GHL_STAGE_NOSHOW=

# === GHL Custom Field IDs (collect after creating fields per automation/ghl/01-custom-fields.md) ===
GHL_FIELD_LAST_BOOKING_DATE=
GHL_FIELD_BOOKING_TIME=
GHL_FIELD_LAST_PARTY_SIZE=
GHL_FIELD_TOTAL_VISITS=
GHL_FIELD_CANCEL_LINK=
GHL_FIELD_SPECIAL_REQUESTS=
GHL_FIELD_TABLE_LABEL=

# === Public site (for cancel-link composition) ===
PUBLIC_SITE_URL=http://localhost:5173

# === Frontend (must be VITE_ prefixed to be visible to client bundle) ===
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
VITE_PUBLIC_SITE_URL=$PUBLIC_SITE_URL
```

- [ ] **Step 2: Create `.env.local` with same shape, populated with real values**

```bash
cp .env.example .env.local
# user manually edits .env.local with real values from Supabase/GHL dashboards
```

- [ ] **Step 3: Verify `.env.local` is gitignored**

Run: `cat .gitignore | grep -E "^\.env"`
Expected output should include `.env.local` (or `.env*.local` or `*.local`).

If not present, append:
```
.env.local
.env*.local
```

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: env var scaffolding"
```

---

## Phase 1 — Backend Libraries (TDD)

### Task 4: Typed env-var loader

**Files:**
- Create: `api/_lib/env.ts`
- Test: `api/_lib/env.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/_lib/env.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('env', () => {
  const ORIGINAL = { ...process.env };

  beforeEach(() => {
    // Wipe env vars we care about
    [
      'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
      'GHL_LOCATION_ID', 'GHL_PIT', 'GHL_PIPELINE_ID',
      'GHL_STAGE_BOOKED', 'GHL_STAGE_SEATED', 'GHL_STAGE_COMPLETED',
      'GHL_STAGE_CANCELLED', 'GHL_STAGE_NOSHOW',
      'GHL_FIELD_LAST_BOOKING_DATE', 'GHL_FIELD_BOOKING_TIME',
      'GHL_FIELD_LAST_PARTY_SIZE', 'GHL_FIELD_TOTAL_VISITS',
      'GHL_FIELD_CANCEL_LINK', 'GHL_FIELD_SPECIAL_REQUESTS',
      'GHL_FIELD_TABLE_LABEL', 'PUBLIC_SITE_URL',
    ].forEach((k) => delete process.env[k]);
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it('throws when SUPABASE_URL is missing', async () => {
    const { loadEnv } = await import('./env');
    expect(() => loadEnv()).toThrow(/SUPABASE_URL/);
  });

  it('returns parsed env when all required vars are present', async () => {
    process.env.SUPABASE_URL = 'https://abc.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    process.env.GHL_LOCATION_ID = 'loc';
    process.env.GHL_PIT = 'pit';
    process.env.GHL_PIPELINE_ID = 'pipe';
    process.env.GHL_STAGE_BOOKED = 'stage1';
    process.env.GHL_STAGE_SEATED = 'stage2';
    process.env.GHL_STAGE_COMPLETED = 'stage3';
    process.env.GHL_STAGE_CANCELLED = 'stage4';
    process.env.GHL_STAGE_NOSHOW = 'stage5';
    process.env.GHL_FIELD_LAST_BOOKING_DATE = 'f1';
    process.env.GHL_FIELD_BOOKING_TIME = 'f2';
    process.env.GHL_FIELD_LAST_PARTY_SIZE = 'f3';
    process.env.GHL_FIELD_TOTAL_VISITS = 'f4';
    process.env.GHL_FIELD_CANCEL_LINK = 'f5';
    process.env.GHL_FIELD_SPECIAL_REQUESTS = 'f6';
    process.env.GHL_FIELD_TABLE_LABEL = 'f7';
    process.env.PUBLIC_SITE_URL = 'https://x.com';

    const { loadEnv } = await import('./env');
    const env = loadEnv();
    expect(env.SUPABASE_URL).toBe('https://abc.supabase.co');
    expect(env.GHL_PIPELINE_ID).toBe('pipe');
    expect(env.PUBLIC_SITE_URL).toBe('https://x.com');
  });
});
```

- [ ] **Step 2: Run — should FAIL (file doesn't exist)**

Run: `npm test -- api/_lib/env.test.ts`
Expected: `Error: Failed to load url ./env`

- [ ] **Step 3: Implement `api/_lib/env.ts`**

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  // GHL core
  GHL_LOCATION_ID: z.string().min(1),
  GHL_PIT: z.string().min(1),
  GHL_PIPELINE_ID: z.string().min(1),
  // GHL stage IDs
  GHL_STAGE_BOOKED: z.string().min(1),
  GHL_STAGE_SEATED: z.string().min(1),
  GHL_STAGE_COMPLETED: z.string().min(1),
  GHL_STAGE_CANCELLED: z.string().min(1),
  GHL_STAGE_NOSHOW: z.string().min(1),
  // GHL custom field IDs
  GHL_FIELD_LAST_BOOKING_DATE: z.string().min(1),
  GHL_FIELD_BOOKING_TIME: z.string().min(1),
  GHL_FIELD_LAST_PARTY_SIZE: z.string().min(1),
  GHL_FIELD_TOTAL_VISITS: z.string().min(1),
  GHL_FIELD_CANCEL_LINK: z.string().min(1),
  GHL_FIELD_SPECIAL_REQUESTS: z.string().min(1),
  GHL_FIELD_TABLE_LABEL: z.string().min(1),
  // Public
  PUBLIC_SITE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${missing}`);
  }
  cached = result.data;
  return cached;
}

// Test-only — reset cache between tests
export function _resetEnvCache() {
  cached = null;
}
```

- [ ] **Step 4: Update test to reset cache between cases**

Insert into the `beforeEach` of `env.test.ts`:
```typescript
const { _resetEnvCache } = await import('./env');
_resetEnvCache();
```

(Place this AFTER the `delete process.env[k]` loop.)

- [ ] **Step 5: Run — should PASS**

Run: `npm test -- api/_lib/env.test.ts`
Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add api/_lib/env.ts api/_lib/env.test.ts
git commit -m "feat: typed env loader with fail-fast validation"
```

---

### Task 5: Zod request schemas

**Files:**
- Create: `api/_lib/schemas.ts`
- Test: `api/_lib/schemas.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/_lib/schemas.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  feedbackSchema,
  createBookingSchema,
  availabilityQuerySchema,
} from './schemas';

describe('feedbackSchema', () => {
  it('accepts valid payload', () => {
    const r = feedbackSchema.safeParse({
      name: 'Alice',
      email: 'a@b.com',
      topic: 'feedback',
      message: 'Loved the food.',
    });
    expect(r.success).toBe(true);
  });

  it('rejects too-short name', () => {
    const r = feedbackSchema.safeParse({
      name: 'A',
      email: 'a@b.com',
      topic: 'feedback',
      message: 'Loved the food.',
    });
    expect(r.success).toBe(false);
  });

  it('rejects bad email', () => {
    const r = feedbackSchema.safeParse({
      name: 'Alice',
      email: 'notanemail',
      topic: 'feedback',
      message: 'Loved the food.',
    });
    expect(r.success).toBe(false);
  });

  it('rejects unknown topic', () => {
    const r = feedbackSchema.safeParse({
      name: 'Alice',
      email: 'a@b.com',
      topic: 'spam',
      message: 'msg',
    });
    expect(r.success).toBe(false);
  });

  it('rejects too-short message', () => {
    const r = feedbackSchema.safeParse({
      name: 'Alice',
      email: 'a@b.com',
      topic: 'feedback',
      message: 'no',
    });
    expect(r.success).toBe(false);
  });
});

describe('createBookingSchema', () => {
  const base = {
    guest_name: 'Alice Doe',
    guest_phone: '+919876543210',
    guest_email: 'alice@example.com',
    party_size: 4,
    slot_starts_at: '2026-05-01T18:00:00.000Z',
    special_requests: 'Window table please',
  };

  it('accepts valid payload', () => {
    expect(createBookingSchema.safeParse(base).success).toBe(true);
  });

  it('accepts payload without optional email/special_requests', () => {
    const { guest_email: _e, special_requests: _s, ...minimal } = base;
    expect(createBookingSchema.safeParse(minimal).success).toBe(true);
  });

  it('rejects party_size < 1 or > 6', () => {
    expect(createBookingSchema.safeParse({ ...base, party_size: 0 }).success).toBe(false);
    expect(createBookingSchema.safeParse({ ...base, party_size: 7 }).success).toBe(false);
  });

  it('rejects malformed phone', () => {
    expect(createBookingSchema.safeParse({ ...base, guest_phone: 'abc' }).success).toBe(false);
  });

  it('rejects invalid ISO datetime', () => {
    expect(createBookingSchema.safeParse({ ...base, slot_starts_at: 'tomorrow' }).success).toBe(false);
  });
});

describe('availabilityQuerySchema', () => {
  it('accepts valid query', () => {
    const r = availabilityQuerySchema.safeParse({ date: '2026-05-01', party: '4' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.party).toBe(4);  // coerced to number
  });

  it('rejects bad date format', () => {
    expect(availabilityQuerySchema.safeParse({ date: '01-05-2026', party: '4' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run — should FAIL**

Run: `npm test -- api/_lib/schemas.test.ts`
Expected: `Error: Failed to load url ./schemas`

- [ ] **Step 3: Implement `api/_lib/schemas.ts`**

```typescript
import { z } from 'zod';

// E.164-ish phone — starts with + and 7-15 digits
const phoneRegex = /^\+?[0-9]{7,15}$/;

export const feedbackSchema = z.object({
  name: z.string().min(2, 'name too short').max(120),
  email: z.string().email('invalid email').max(200),
  topic: z.enum(['feedback', 'reservation', 'press', 'other']),
  message: z.string().min(5, 'message too short').max(4000),
});
export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const createBookingSchema = z.object({
  guest_name: z.string().min(2).max(120),
  guest_phone: z.string().regex(phoneRegex, 'invalid phone'),
  guest_email: z.string().email().max(200).optional().or(z.literal('')),
  party_size: z.number().int().min(1).max(6),
  slot_starts_at: z.string().datetime({ offset: true }),
  special_requests: z.string().max(500).optional().or(z.literal('')),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const availabilityQuerySchema = z.object({
  // Strict YYYY-MM-DD
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  // Coerce string -> number (URL query params arrive as strings)
  party: z.coerce.number().int().min(1).max(6),
});
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
```

- [ ] **Step 4: Run — should PASS**

Run: `npm test -- api/_lib/schemas.test.ts`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add api/_lib/schemas.ts api/_lib/schemas.test.ts
git commit -m "feat: zod request schemas for bookings and feedback"
```

---

### Task 6: Date/time format helpers

**Files:**
- Create: `api/_lib/format.ts`
- Test: `api/_lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/_lib/format.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { formatBookingDate, formatBookingTime, slotEndsAt } from './format';

describe('formatBookingDate', () => {
  it('formats ISO datetime as DD MMM YYYY in IST', () => {
    // 2026-05-01T18:00:00.000Z = 11:30 PM IST same day
    expect(formatBookingDate('2026-05-01T18:00:00.000Z')).toBe('1 May 2026');
  });
});

describe('formatBookingTime', () => {
  it('formats ISO datetime as h:mm AM/PM IST', () => {
    // 2026-05-01T12:30:00.000Z = 6:00 PM IST
    expect(formatBookingTime('2026-05-01T12:30:00.000Z')).toBe('6:00 PM');
  });

  it('handles 9 PM correctly', () => {
    // 2026-05-01T15:30:00.000Z = 9:00 PM IST
    expect(formatBookingTime('2026-05-01T15:30:00.000Z')).toBe('9:00 PM');
  });
});

describe('slotEndsAt', () => {
  it('adds 120 minutes', () => {
    const start = new Date('2026-05-01T12:30:00.000Z');
    const end = slotEndsAt(start);
    expect(end.toISOString()).toBe('2026-05-01T14:30:00.000Z');
  });
});
```

- [ ] **Step 2: Run — should FAIL**

Run: `npm test -- api/_lib/format.test.ts`
Expected: `Error: Failed to load url ./format`

- [ ] **Step 3: Implement `api/_lib/format.ts`**

```typescript
const IST = 'Asia/Kolkata';

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatBookingDate(isoString: string): string {
  return dateFmt.format(new Date(isoString));
}

export function formatBookingTime(isoString: string): string {
  // Intl returns "6:00 PM" already
  return timeFmt.format(new Date(isoString));
}

export function slotEndsAt(starts: Date): Date {
  return new Date(starts.getTime() + 120 * 60 * 1000);
}
```

- [ ] **Step 4: Run — should PASS**

Run: `npm test -- api/_lib/format.test.ts`
Expected: 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/_lib/format.ts api/_lib/format.test.ts
git commit -m "feat: IST date/time format helpers"
```

---

### Task 7: Server-side Supabase client

**Files:**
- Create: `api/_lib/supabase.ts`

(No tests — this is just a configured client. Tests come at the endpoint integration level.)

- [ ] **Step 1: Implement**

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from './env';

let serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service-role key.
 * Bypasses RLS — never expose this to the browser.
 */
export function getSupabaseServer(): SupabaseClient {
  if (serverClient) return serverClient;
  const env = loadEnv();
  serverClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add api/_lib/supabase.ts
git commit -m "feat: server-side supabase client"
```

---

### Task 8: GHL v2 REST client

**Files:**
- Create: `api/_lib/ghl.ts`
- Test: `api/_lib/ghl.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/_lib/ghl.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEnv = {
  GHL_LOCATION_ID: 'loc_123',
  GHL_PIT: 'pit_xyz',
  GHL_PIPELINE_ID: 'pipe_1',
  GHL_STAGE_BOOKED: 'stage_booked',
  GHL_STAGE_CANCELLED: 'stage_cancel',
  GHL_FIELD_LAST_BOOKING_DATE: 'fld_date',
  GHL_FIELD_BOOKING_TIME: 'fld_time',
  GHL_FIELD_LAST_PARTY_SIZE: 'fld_party',
  GHL_FIELD_TOTAL_VISITS: 'fld_visits',
  GHL_FIELD_CANCEL_LINK: 'fld_cancel',
  GHL_FIELD_SPECIAL_REQUESTS: 'fld_notes',
  GHL_FIELD_TABLE_LABEL: 'fld_table',
  PUBLIC_SITE_URL: 'https://example.com',
};

vi.mock('./env', () => ({
  loadEnv: () => ({
    SUPABASE_URL: 'https://x.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    GHL_STAGE_SEATED: 's', GHL_STAGE_COMPLETED: 'c', GHL_STAGE_NOSHOW: 'n',
    ...mockEnv,
  }),
  _resetEnvCache: () => {},
}));

describe('ghl client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('upsertContact sends correct headers and body', async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ contact: { id: 'c_999' } }), { status: 200 })
    );

    const { upsertContact } = await import('./ghl');
    const id = await upsertContact({
      firstName: 'Alice',
      email: 'a@b.com',
      phone: '+919876543210',
      tags: ['bistro-bar-guest'],
    });

    expect(id).toBe('c_999');
    const call = (global.fetch as any).mock.calls[0];
    expect(call[0]).toBe('https://services.leadconnectorhq.com/contacts/upsert');
    const opts = call[1];
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe('Bearer pit_xyz');
    expect(opts.headers.Version).toBe('2021-07-28');
    const body = JSON.parse(opts.body);
    expect(body.locationId).toBe('loc_123');
    expect(body.firstName).toBe('Alice');
    expect(body.tags).toEqual(['bistro-bar-guest']);
  });

  it('upsertContact throws on non-2xx', async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'bad request' }), { status: 400 })
    );
    const { upsertContact } = await import('./ghl');
    await expect(upsertContact({ firstName: 'A', phone: '+1' })).rejects.toThrow(/GHL upsert failed/);
  });

  it('addTags POSTs to correct URL', async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response('{}', { status: 200 })
    );
    const { addTags } = await import('./ghl');
    await addTags('c_999', ['tag-a', 'tag-b']);

    const [url, opts] = (global.fetch as any).mock.calls[0];
    expect(url).toBe('https://services.leadconnectorhq.com/contacts/c_999/tags');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ tags: ['tag-a', 'tag-b'] });
  });

  it('updateContactFields builds correct customFields array', async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response('{}', { status: 200 })
    );
    const { updateContactFields } = await import('./ghl');
    await updateContactFields('c_999', {
      lastBookingDate: '2026-05-01',
      bookingTime: '6:30 PM',
      lastPartySize: 4,
    });

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.customFields).toEqual(
      expect.arrayContaining([
        { id: 'fld_date',  value: '2026-05-01' },
        { id: 'fld_time',  value: '6:30 PM' },
        { id: 'fld_party', value: 4 },
      ])
    );
  });

  it('createOpportunity returns the new id', async () => {
    (global.fetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ opportunity: { id: 'opp_42' } }), { status: 200 })
    );
    const { createOpportunity } = await import('./ghl');
    const id = await createOpportunity({
      contactId: 'c_999', name: 'Alice — 2026-05-01 6:30 PM', monetaryValue: 6000,
    });
    expect(id).toBe('opp_42');
  });
});
```

- [ ] **Step 2: Run — should FAIL**

Run: `npm test -- api/_lib/ghl.test.ts`
Expected: `Error: Failed to load url ./ghl`

- [ ] **Step 3: Implement `api/_lib/ghl.ts`**

```typescript
import { loadEnv } from './env';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function authHeaders() {
  const env = loadEnv();
  return {
    Authorization: `Bearer ${env.GHL_PIT}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function ghlFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`GHL ${path} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as T;
}

// ────────────── Contacts ──────────────

export interface UpsertContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  tags?: string[];
}

export async function upsertContact(input: UpsertContactInput): Promise<string> {
  const env = loadEnv();
  const data = await ghlFetch<{ contact: { id: string } }>('/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId: env.GHL_LOCATION_ID,
      source: 'website',
      ...input,
    }),
  }).catch((e) => { throw new Error(`GHL upsert failed: ${e.message}`); });
  return data.contact.id;
}

export async function addTags(contactId: string, tags: string[]): Promise<void> {
  await ghlFetch(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
}

export interface ContactFields {
  lastBookingDate?: string;     // YYYY-MM-DD
  bookingTime?: string;         // "6:30 PM"
  lastPartySize?: number;
  totalVisits?: number;
  cancelLink?: string;
  specialRequests?: string;
  tableLabel?: string;
}

export async function updateContactFields(contactId: string, fields: ContactFields): Promise<void> {
  const env = loadEnv();
  const customFields: Array<{ id: string; value: any }> = [];
  if (fields.lastBookingDate !== undefined) customFields.push({ id: env.GHL_FIELD_LAST_BOOKING_DATE, value: fields.lastBookingDate });
  if (fields.bookingTime !== undefined)     customFields.push({ id: env.GHL_FIELD_BOOKING_TIME, value: fields.bookingTime });
  if (fields.lastPartySize !== undefined)   customFields.push({ id: env.GHL_FIELD_LAST_PARTY_SIZE, value: fields.lastPartySize });
  if (fields.totalVisits !== undefined)     customFields.push({ id: env.GHL_FIELD_TOTAL_VISITS, value: fields.totalVisits });
  if (fields.cancelLink !== undefined)      customFields.push({ id: env.GHL_FIELD_CANCEL_LINK, value: fields.cancelLink });
  if (fields.specialRequests !== undefined) customFields.push({ id: env.GHL_FIELD_SPECIAL_REQUESTS, value: fields.specialRequests });
  if (fields.tableLabel !== undefined)      customFields.push({ id: env.GHL_FIELD_TABLE_LABEL, value: fields.tableLabel });

  if (customFields.length === 0) return;

  await ghlFetch(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify({ customFields }),
  });
}

// ────────────── Opportunities ──────────────

export interface CreateOpportunityInput {
  contactId: string;
  name: string;
  monetaryValue?: number;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<string> {
  const env = loadEnv();
  const data = await ghlFetch<{ opportunity: { id: string } }>('/opportunities/', {
    method: 'POST',
    body: JSON.stringify({
      locationId:      env.GHL_LOCATION_ID,
      pipelineId:      env.GHL_PIPELINE_ID,
      pipelineStageId: env.GHL_STAGE_BOOKED,
      status:          input.status ?? 'open',
      contactId:       input.contactId,
      name:            input.name,
      monetaryValue:   input.monetaryValue ?? 0,
    }),
  });
  return data.opportunity.id;
}

export async function moveOpportunityToCancelled(opportunityId: string): Promise<void> {
  const env = loadEnv();
  await ghlFetch(`/opportunities/${opportunityId}`, {
    method: 'PUT',
    body: JSON.stringify({
      pipelineId:      env.GHL_PIPELINE_ID,
      pipelineStageId: env.GHL_STAGE_CANCELLED,
      status:          'abandoned',
    }),
  });
}
```

- [ ] **Step 4: Run — should PASS**

Run: `npm test -- api/_lib/ghl.test.ts`
Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/_lib/ghl.ts api/_lib/ghl.test.ts
git commit -m "feat: ghl v2 REST client (contacts, tags, custom fields, opportunities)"
```

---

## Phase 2 — API Endpoints

### Task 9: `POST /api/feedback` (vertical slice — easiest first)

This is the simplest endpoint and validates the whole pipeline. Doing this first means you'll catch any env/Supabase/GHL configuration issues before tackling the more complex booking flow.

**Files:**
- Create: `api/feedback.ts`
- Test: `api/feedback.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/feedback.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_lib/env', () => ({
  loadEnv: () => ({
    SUPABASE_URL: 'https://x.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    GHL_LOCATION_ID: 'loc',
    GHL_PIT: 'pit',
    PUBLIC_SITE_URL: 'https://x.com',
  }),
  _resetEnvCache: () => {},
}));

const mockRpc = vi.fn();
vi.mock('./_lib/supabase', () => ({
  getSupabaseServer: () => ({ rpc: mockRpc }),
}));

const mockUpsert = vi.fn();
const mockAddTags = vi.fn();
vi.mock('./_lib/ghl', () => ({
  upsertContact: (input: any) => mockUpsert(input),
  addTags: (id: string, tags: string[]) => mockAddTags(id, tags),
}));

import handler from './feedback';

function makeReqRes(body: any) {
  const req: any = { method: 'POST', body };
  let statusCode = 0;
  let payload: any = null;
  const res: any = {
    status(c: number) { statusCode = c; return res; },
    json(p: any) { payload = p; return res; },
    setHeader() { return res; },
    end() { return res; },
  };
  return { req, res, get: () => ({ statusCode, payload }) };
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockUpsert.mockReset();
    mockAddTags.mockReset();
  });

  it('rejects non-POST', async () => {
    const { req, res, get } = makeReqRes({});
    req.method = 'GET';
    await handler(req, res);
    expect(get().statusCode).toBe(405);
  });

  it('rejects invalid payload with 400', async () => {
    const { req, res, get } = makeReqRes({ name: 'X' });  // missing fields
    await handler(req, res);
    expect(get().statusCode).toBe(400);
    expect(get().payload.error).toBe('validation_failed');
  });

  it('inserts feedback + upserts GHL contact + adds tag on valid payload', async () => {
    mockRpc.mockResolvedValue({ data: [{ feedback_id: 'fb_1' }], error: null });
    mockUpsert.mockResolvedValue('c_999');

    const { req, res, get } = makeReqRes({
      name: 'Alice',
      email: 'alice@example.com',
      topic: 'feedback',
      message: 'Loved the cocktails',
    });
    await handler(req, res);

    expect(mockRpc).toHaveBeenCalledWith('submit_feedback', {
      p_name: 'Alice',
      p_email: 'alice@example.com',
      p_topic: 'feedback',
      p_message: 'Loved the cocktails',
    });
    expect(mockUpsert).toHaveBeenCalledWith({
      firstName: 'Alice',
      email: 'alice@example.com',
      phone: 'alice@example.com', // we use email as phone-fallback dedup key
      tags: ['feedback-submitted'],
    });
    expect(mockAddTags).not.toHaveBeenCalled(); // tags already passed to upsert
    expect(get().statusCode).toBe(200);
    expect(get().payload).toEqual({ ok: true, feedback_id: 'fb_1' });
  });

  it('returns 500 if Supabase RPC errors', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'DB down' } });
    const { req, res, get } = makeReqRes({
      name: 'Alice', email: 'a@b.com', topic: 'feedback', message: 'hello world',
    });
    await handler(req, res);
    expect(get().statusCode).toBe(500);
  });

  it('returns 200 even if GHL upsert fails (don\'t block user on CRM hiccup)', async () => {
    mockRpc.mockResolvedValue({ data: [{ feedback_id: 'fb_1' }], error: null });
    mockUpsert.mockRejectedValue(new Error('GHL down'));

    const { req, res, get } = makeReqRes({
      name: 'Alice', email: 'a@b.com', topic: 'feedback', message: 'hello world',
    });
    await handler(req, res);
    expect(get().statusCode).toBe(200);  // Supabase succeeded; GHL failure is logged not raised
  });
});
```

- [ ] **Step 2: Run — should FAIL**

Run: `npm test -- api/feedback.test.ts`
Expected: `Error: Failed to load url ./feedback`

- [ ] **Step 3: Implement `api/feedback.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { feedbackSchema } from './_lib/schemas';
import { getSupabaseServer } from './_lib/supabase';
import { upsertContact } from './_lib/ghl';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'validation_failed',
      issues: parsed.error.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }
  const { name, email, topic, message } = parsed.data;

  // 1. Insert into Supabase
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('submit_feedback', {
    p_name: name, p_email: email, p_topic: topic, p_message: message,
  });
  if (error) {
    console.error('[feedback] supabase rpc error', error);
    return res.status(500).json({ error: 'storage_failed' });
  }
  const feedbackId = data?.[0]?.feedback_id ?? null;

  // 2. Upsert GHL contact + tag (best-effort — don't block on CRM)
  try {
    await upsertContact({
      firstName: name,
      email,
      phone: email, // email used as dedup key when no phone available
      tags: ['feedback-submitted'],
    });
  } catch (e) {
    console.error('[feedback] ghl upsert failed (non-fatal)', e);
  }

  return res.status(200).json({ ok: true, feedback_id: feedbackId });
}
```

- [ ] **Step 4: Run — should PASS**

Run: `npm test -- api/feedback.test.ts`
Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add api/feedback.ts api/feedback.test.ts
git commit -m "feat: POST /api/feedback — store + tag in GHL"
```

---

### Task 10: `GET /api/availability`

**Files:**
- Create: `api/availability.ts`
- Test: `api/availability.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/availability.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./_lib/env', () => ({
  loadEnv: () => ({
    SUPABASE_URL: 'https://x.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
  }),
}));

const mockRpc = vi.fn();
vi.mock('./_lib/supabase', () => ({
  getSupabaseServer: () => ({ rpc: mockRpc }),
}));

import handler from './availability';

function makeReqRes(query: any) {
  const req: any = { method: 'GET', query };
  let statusCode = 0;
  let payload: any = null;
  const res: any = {
    status(c: number) { statusCode = c; return res; },
    json(p: any) { payload = p; return res; },
    setHeader() { return res; },
  };
  return { req, res, get: () => ({ statusCode, payload }) };
}

describe('GET /api/availability', () => {
  beforeEach(() => mockRpc.mockReset());

  it('rejects non-GET', async () => {
    const { req, res, get } = makeReqRes({});
    req.method = 'POST';
    await handler(req, res);
    expect(get().statusCode).toBe(405);
  });

  it('rejects bad date format', async () => {
    const { req, res, get } = makeReqRes({ date: '01/05/2026', party: '4' });
    await handler(req, res);
    expect(get().statusCode).toBe(400);
  });

  it('returns slots from RPC', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { slot_starts_at: '2026-05-01T12:30:00.000Z', tables_left: 3 },
        { slot_starts_at: '2026-05-01T13:00:00.000Z', tables_left: 0 },
      ],
      error: null,
    });
    const { req, res, get } = makeReqRes({ date: '2026-05-01', party: '4' });
    await handler(req, res);

    expect(mockRpc).toHaveBeenCalledWith('get_availability', { p_date: '2026-05-01', p_party_size: 4 });
    expect(get().statusCode).toBe(200);
    expect(get().payload.slots).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run — should FAIL**

Run: `npm test -- api/availability.test.ts`

- [ ] **Step 3: Implement `api/availability.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { availabilityQuerySchema } from './_lib/schemas';
import { getSupabaseServer } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = availabilityQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', issues: parsed.error.errors });
  }
  const { date, party } = parsed.data;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('get_availability', {
    p_date: date,
    p_party_size: party,
  });
  if (error) {
    console.error('[availability] rpc error', error);
    return res.status(500).json({ error: 'lookup_failed' });
  }

  // Cache for 15s — short, since tables_left changes on every booking
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=30');
  return res.status(200).json({ slots: data ?? [] });
}
```

- [ ] **Step 4: Run — should PASS**

Run: `npm test -- api/availability.test.ts`

- [ ] **Step 5: Commit**

```bash
git add api/availability.ts api/availability.test.ts
git commit -m "feat: GET /api/availability"
```

---

### Task 11: `POST /api/bookings`

**Files:**
- Create: `api/bookings/index.ts`
- Test: `api/bookings/index.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/bookings/index.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../_lib/env', () => ({
  loadEnv: () => ({
    SUPABASE_URL: 'https://x.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    PUBLIC_SITE_URL: 'https://bistro.example.com',
  }),
}));

const mockRpc = vi.fn();
vi.mock('../_lib/supabase', () => ({
  getSupabaseServer: () => ({ rpc: mockRpc }),
}));

const mockUpsert = vi.fn();
const mockUpdateFields = vi.fn();
const mockCreateOpp = vi.fn();
vi.mock('../_lib/ghl', () => ({
  upsertContact: (i: any) => mockUpsert(i),
  updateContactFields: (id: string, f: any) => mockUpdateFields(id, f),
  createOpportunity: (i: any) => mockCreateOpp(i),
}));

import handler from './index';

function makeReqRes(body: any) {
  const req: any = { method: 'POST', body };
  let statusCode = 0;
  let payload: any = null;
  const res: any = {
    status(c: number) { statusCode = c; return res; },
    json(p: any) { payload = p; return res; },
    setHeader() { return res; },
  };
  return { req, res, get: () => ({ statusCode, payload }) };
}

describe('POST /api/bookings', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockUpsert.mockReset();
    mockUpdateFields.mockReset();
    mockCreateOpp.mockReset();
  });

  const validBody = {
    guest_name: 'Alice Doe',
    guest_phone: '+919876543210',
    guest_email: 'alice@example.com',
    party_size: 4,
    slot_starts_at: '2026-05-01T12:30:00.000Z',
    special_requests: 'window please',
  };

  it('rejects invalid payload', async () => {
    const { req, res, get } = makeReqRes({ guest_name: 'X' });
    await handler(req, res);
    expect(get().statusCode).toBe(400);
  });

  it('happy path: creates booking, upserts GHL, returns token', async () => {
    mockRpc
      .mockResolvedValueOnce({ // create_booking
        data: [{ booking_id: 'b_1', cancel_token: 'tok_xyz', table_label: 'T6' }],
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null }); // set_booking_ghl_ids
    mockUpsert.mockResolvedValue('c_42');
    mockCreateOpp.mockResolvedValue('opp_99');

    const { req, res, get } = makeReqRes(validBody);
    await handler(req, res);

    expect(mockRpc).toHaveBeenCalledWith('create_booking', expect.objectContaining({
      p_guest_name: 'Alice Doe',
      p_party_size: 4,
    }));
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Alice',
      lastName: 'Doe',
      phone: '+919876543210',
      tags: expect.arrayContaining(['bistro-bar-guest']),
    }));
    expect(mockUpdateFields).toHaveBeenCalledWith('c_42', expect.objectContaining({
      lastPartySize: 4,
      tableLabel: 'T6',
      cancelLink: 'https://bistro.example.com/b/tok_xyz',
    }));
    expect(mockCreateOpp).toHaveBeenCalled();
    expect(get().statusCode).toBe(200);
    expect(get().payload).toMatchObject({ ok: true, cancel_token: 'tok_xyz', table_label: 'T6' });
  });

  it('returns 409 if no tables available', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'no tables available for that slot' },
    });
    const { req, res, get } = makeReqRes(validBody);
    await handler(req, res);
    expect(get().statusCode).toBe(409);
  });
});
```

- [ ] **Step 2: Run — should FAIL**

Run: `npm test -- api/bookings/index.test.ts`

- [ ] **Step 3: Implement `api/bookings/index.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBookingSchema } from '../_lib/schemas';
import { getSupabaseServer } from '../_lib/supabase';
import { upsertContact, updateContactFields, createOpportunity } from '../_lib/ghl';
import { formatBookingDate, formatBookingTime } from '../_lib/format';
import { loadEnv } from '../_lib/env';

const AVG_SPEND_PER_GUEST = 1500; // INR — feeds opportunity monetary value

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', issues: parsed.error.errors });
  }
  const { guest_name, guest_phone, guest_email, party_size, slot_starts_at, special_requests } = parsed.data;

  // 1. Create booking via RPC (handles race-safe table locking)
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('create_booking', {
    p_guest_name: guest_name,
    p_guest_phone: guest_phone,
    p_guest_email: guest_email || null,
    p_party_size: party_size,
    p_slot_starts_at: slot_starts_at,
    p_special_requests: special_requests || null,
  });

  if (error) {
    console.error('[bookings] create_booking rpc error', error);
    if (/no tables available/i.test(error.message)) {
      return res.status(409).json({ error: 'no_tables_available' });
    }
    if (/slot must be|party_size/.test(error.message)) {
      return res.status(400).json({ error: 'invalid_slot', detail: error.message });
    }
    return res.status(500).json({ error: 'create_failed' });
  }

  const row = data?.[0];
  if (!row) return res.status(500).json({ error: 'no_row_returned' });
  const { booking_id, cancel_token, table_label } = row as { booking_id: string; cancel_token: string; table_label: string };

  // 2. GHL: upsert contact + custom fields + opportunity (best-effort)
  const env = loadEnv();
  const cancelLink = `${env.PUBLIC_SITE_URL}/b/${cancel_token}`;
  const dateLabel = formatBookingDate(slot_starts_at);
  const timeLabel = formatBookingTime(slot_starts_at);
  const isoDate = slot_starts_at.slice(0, 10);

  const [firstName, ...rest] = guest_name.trim().split(/\s+/);
  const lastName = rest.join(' ') || undefined;

  try {
    const contactId = await upsertContact({
      firstName,
      lastName,
      email: guest_email || undefined,
      phone: guest_phone,
      tags: ['bistro-bar-guest', `booking-${isoDate}`],
    });

    await updateContactFields(contactId, {
      lastBookingDate: isoDate,
      bookingTime: timeLabel,
      lastPartySize: party_size,
      cancelLink,
      specialRequests: special_requests || '',
      tableLabel: table_label,
    });

    const opportunityId = await createOpportunity({
      contactId,
      name: `${guest_name} — ${dateLabel} ${timeLabel}`,
      monetaryValue: party_size * AVG_SPEND_PER_GUEST,
    });

    // 3. Backfill GHL IDs into Supabase row
    await supabase.rpc('set_booking_ghl_ids', {
      p_booking_id: booking_id,
      p_ghl_contact_id: contactId,
      p_ghl_opportunity_id: opportunityId,
    });
  } catch (e) {
    console.error('[bookings] GHL sync failed (booking still saved)', e);
  }

  return res.status(200).json({
    ok: true,
    booking_id,
    cancel_token,
    cancel_url: cancelLink,
    table_label,
    date_label: dateLabel,
    time_label: timeLabel,
  });
}
```

- [ ] **Step 4: Run — should PASS**

Run: `npm test -- api/bookings/index.test.ts`

- [ ] **Step 5: Commit**

```bash
git add api/bookings/index.ts api/bookings/index.test.ts
git commit -m "feat: POST /api/bookings — create booking + ghl sync"
```

---

### Task 12: `GET /api/bookings/[token]`

**Files:**
- Create: `api/bookings/[token]/index.ts`

(Lighter on tests — pure passthrough to the RPC.)

- [ ] **Step 1: Implement**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from '../../_lib/supabase';
import { formatBookingDate, formatBookingTime } from '../../_lib/format';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = String(req.query.token ?? '');
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(token)) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('get_booking_by_token', { p_token: token });
  if (error) {
    console.error('[booking-by-token] rpc error', error);
    return res.status(500).json({ error: 'lookup_failed' });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'not_found' });
  }

  const b = data[0];
  return res.status(200).json({
    ok: true,
    booking: {
      guest_name: b.guest_name,
      party_size: b.party_size,
      table_label: b.table_label,
      status: b.status,
      special_requests: b.special_requests,
      can_cancel: b.can_cancel,
      slot_starts_at: b.slot_starts_at,
      slot_ends_at: b.slot_ends_at,
      date_label: formatBookingDate(b.slot_starts_at),
      time_label: formatBookingTime(b.slot_starts_at),
    },
  });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add api/bookings/[token]/index.ts
git commit -m "feat: GET /api/bookings/[token]"
```

---

### Task 13: `POST /api/bookings/[token]/cancel`

**Files:**
- Create: `api/bookings/[token]/cancel.ts`

- [ ] **Step 1: Implement**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from '../../_lib/supabase';
import { addTags, moveOpportunityToCancelled } from '../../_lib/ghl';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = String(req.query.token ?? '');
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(token)) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc('cancel_booking', { p_token: token });
  if (error) {
    console.error('[cancel] rpc error', error);
    return res.status(500).json({ error: 'cancel_failed' });
  }

  const row = data?.[0];
  if (!row?.success) {
    const reason = row?.message ?? 'unknown';
    const status = /not found/.test(reason) ? 404 : /too late/.test(reason) ? 409 : 400;
    return res.status(status).json({ ok: false, reason });
  }

  // GHL side-effects (best-effort)
  if (row.ghl_contact_id) {
    const isoDate = new Date().toISOString().slice(0, 10);
    try { await addTags(row.ghl_contact_id, [`cancelled-${isoDate}`]); }
    catch (e) { console.error('[cancel] addTags failed', e); }
  }
  // Move opportunity if we know it
  const { data: bookingData } = await supabase
    .from('bookings')
    .select('ghl_opportunity_id')
    .eq('id', row.booking_id)
    .single();
  if (bookingData?.ghl_opportunity_id) {
    try { await moveOpportunityToCancelled(bookingData.ghl_opportunity_id); }
    catch (e) { console.error('[cancel] move opp failed', e); }
  }

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add api/bookings/[token]/cancel.ts
git commit -m "feat: POST /api/bookings/[token]/cancel"
```

---

## Phase 3 — Frontend Client

### Task 14: Frontend API wrapper

**Files:**
- Create: `src/lib/api.ts`

- [ ] **Step 1: Implement**

```typescript
// Typed wrappers around our /api routes.
// Throws on non-2xx with a parsed JSON body when possible.

interface AvailabilitySlot {
  slot_starts_at: string;  // ISO
  tables_left: number;
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
}

export interface CreateBookingRequest {
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  party_size: number;
  slot_starts_at: string;  // ISO
  special_requests?: string;
}

export interface CreateBookingResponse {
  ok: true;
  booking_id: string;
  cancel_token: string;
  cancel_url: string;
  table_label: string;
  date_label: string;
  time_label: string;
}

export interface GetBookingResponse {
  ok: true;
  booking: {
    guest_name: string;
    party_size: number;
    table_label: string;
    status: 'booked' | 'seated' | 'completed' | 'cancelled' | 'no_show';
    special_requests: string | null;
    can_cancel: boolean;
    slot_starts_at: string;
    slot_ends_at: string;
    date_label: string;
    time_label: string;
  };
}

export interface FeedbackRequest {
  name: string;
  email: string;
  topic: 'feedback' | 'reservation' | 'press' | 'other';
  message: string;
}

class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, json.error ?? 'unknown_error', json.detail);
  }
  return json as T;
}

export function getAvailability(date: string, party: number): Promise<AvailabilityResponse> {
  return apiFetch<AvailabilityResponse>(`/api/availability?date=${date}&party=${party}`);
}

export function createBooking(input: CreateBookingRequest): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getBookingByToken(token: string): Promise<GetBookingResponse> {
  return apiFetch<GetBookingResponse>(`/api/bookings/${encodeURIComponent(token)}`);
}

export function cancelBooking(token: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/bookings/${encodeURIComponent(token)}/cancel`, {
    method: 'POST',
  });
}

export function submitFeedback(input: FeedbackRequest): Promise<{ ok: true; feedback_id: string }> {
  return apiFetch<{ ok: true; feedback_id: string }>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export { ApiError };
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: frontend api wrapper"
```

---

### Task 15: Wire ContactPage feedback form

**Files:**
- Modify: `src/pages/ContactPage.tsx` (around lines 50-65 — the `onSubmit` and `useState`)

- [ ] **Step 1: Read current `onSubmit` block**

Open `src/pages/ContactPage.tsx`. Locate:
```tsx
const [form, setForm] = useState({ name: '', email: '', topic: 'feedback', message: '' });
const [sent, setSent] = useState(false);

const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setSent(true);
  setTimeout(() => {
    setSent(false);
    setForm({ name: '', email: '', topic: 'feedback', message: '' });
  }, 4000);
};
```

- [ ] **Step 2: Replace with real API call**

```tsx
const [form, setForm] = useState({ name: '', email: '', topic: 'feedback' as const, message: '' });
const [sent, setSent] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (sent === 'sending') return;
  setSent('sending');
  try {
    await submitFeedback({
      name: form.name,
      email: form.email,
      topic: form.topic,
      message: form.message,
    });
    setSent('ok');
    setTimeout(() => {
      setSent('idle');
      setForm({ name: '', email: '', topic: 'feedback', message: '' });
    }, 4000);
  } catch (err) {
    console.error(err);
    setSent('error');
    setTimeout(() => setSent('idle'), 4000);
  }
};
```

Add the import at the top of the file (alongside the other imports):
```tsx
import { submitFeedback } from '../lib/api';
```

If the form's submit button currently shows "Sent!" via `sent === true`, update its conditional to:
```tsx
disabled={sent === 'sending' || sent === 'ok'}
```

And the success message:
```tsx
{sent === 'sending' && 'Sending…'}
{sent === 'ok' && 'Got it. Check your inbox.'}
{sent === 'error' && 'Something went wrong. Please try again.'}
```

(Adapt to whatever the existing JSX uses for the success indicator — usually a span or a swapped button label.)

- [ ] **Step 3: Update topic state typing**

The form's "Topic" buttons set state via `setForm({ ...form, topic: opt.key })` where `opt.key` is one of `'feedback' | 'reservation' | 'press' | 'other'`. After Step 2, the typing should already be tighter — verify:

Run: `npm run typecheck`
Expected: PASS

If TS complains about `topic: opt.key` not being assignable, change the topic state declaration to:
```tsx
const [form, setForm] = useState<FeedbackRequest>({ name: '', email: '', topic: 'feedback', message: '' });
```
And import: `import { submitFeedback, type FeedbackRequest } from '../lib/api';`

- [ ] **Step 4: Manually test in dev**

```bash
npm run dev
# Open http://localhost:5173/contact, fill the form, submit.
# Expected: button shows "Sending…", then "Got it. Check your inbox."
# In Supabase SQL Editor, run:
#   select * from public.feedback order by created_at desc limit 1;
# Expected: your submission shows up.
```

⚠️ **Without `vercel dev` or `vercel deploy`, the `/api/*` routes won't run locally.** See Task 21 for local dev setup. For now, you can also test against a deployed preview URL.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ContactPage.tsx
git commit -m "feat: wire feedback form to /api/feedback"
```

---

## Phase 4 — Reservation UI

### Task 16: Add `/reserve` and `/b/:token` routes

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Find the existing route block**

Look for the `<Routes>` block in `src/main.tsx` (likely with About + Contact lazy imports).

- [ ] **Step 2: Add lazy imports + new routes**

Add to the lazy-import block at the top:
```tsx
const ReservePage = lazy(() => import('./pages/ReservePage'));
const CancelBookingPage = lazy(() => import('./pages/CancelBookingPage'));
```

Inside `<Routes>`, after the existing route entries, add:
```tsx
<Route path="/reserve" element={<ReservePage />} />
<Route path="/b/:token" element={<CancelBookingPage />} />
```

- [ ] **Step 3: Verify it builds**

Run: `npm run typecheck`
Expected: PASS (it'll fail until Tasks 17 and 18 are done — temporary `export default function() { return null }` stubs are fine)

- [ ] **Step 4: Create stub pages so the build passes**

`src/pages/ReservePage.tsx`:
```tsx
export default function ReservePage() {
  return <div className="min-h-screen bg-base text-ink p-10">Reserve (placeholder)</div>;
}
```

`src/pages/CancelBookingPage.tsx`:
```tsx
export default function CancelBookingPage() {
  return <div className="min-h-screen bg-base text-ink p-10">Cancel (placeholder)</div>;
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main.tsx src/pages/ReservePage.tsx src/pages/CancelBookingPage.tsx
git commit -m "feat: add /reserve and /b/:token routes (stubs)"
```

---

### Task 17: Build the `/reserve` 4-step wizard

This is the largest UI task. Total ~250 lines split across the page + 5 components.

**Files:**
- Modify: `src/pages/ReservePage.tsx`
- Create: `src/components/reserve/DatePicker.tsx`
- Create: `src/components/reserve/PartySizePicker.tsx`
- Create: `src/components/reserve/TimeSlotGrid.tsx`
- Create: `src/components/reserve/DetailsForm.tsx`
- Create: `src/components/reserve/ConfirmationCard.tsx`

- [ ] **Step 1: Create `DatePicker.tsx`**

```tsx
import { clsx } from 'clsx';

interface Props {
  value: string | null;        // YYYY-MM-DD
  onChange: (date: string) => void;
}

const dayLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
const dateLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric' });
const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'short' });

export default function DatePicker({ value, onChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return { iso, day: dayLabel.format(d), date: dateLabel.format(d), month: monthLabel.format(d) };
  });

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
      {days.map((d) => (
        <button
          key={d.iso}
          type="button"
          onClick={() => onChange(d.iso)}
          className={clsx(
            'flex flex-col items-center rounded-2xl border px-3 py-4 transition-colors',
            value === d.iso
              ? 'border-amber bg-amber text-base'
              : 'border-line bg-elevated/40 text-ink hover:border-amber/50'
          )}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-70">{d.day}</span>
          <span className="mt-1 font-display text-2xl">{d.date}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">{d.month}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `PartySizePicker.tsx`**

```tsx
import { clsx } from 'clsx';

interface Props { value: number | null; onChange: (n: number) => void; }

export default function PartySizePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={clsx(
            'h-12 w-12 rounded-full border font-display text-xl transition-colors',
            value === n
              ? 'border-amber bg-amber text-base'
              : 'border-line bg-elevated/40 text-ink hover:border-amber/50'
          )}
        >
          {n}
        </button>
      ))}
      <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">Max party of 6 — for larger groups, please call.</span>
    </div>
  );
}
```

- [ ] **Step 3: Create `TimeSlotGrid.tsx`**

```tsx
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { getAvailability } from '../../lib/api';

interface Slot { slot_starts_at: string; tables_left: number; }

interface Props {
  date: string;
  party: number;
  value: string | null;       // ISO
  onChange: (iso: string) => void;
}

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export default function TimeSlotGrid({ date, party, value, onChange }: Props) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setError(null);
    getAvailability(date, party)
      .then((res) => { if (!cancelled) setSlots(res.slots); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [date, party]);

  if (error)  return <p className="font-mono text-xs text-amber/80">Couldn't load availability — try again in a moment.</p>;
  if (!slots) return <p className="font-mono text-xs text-ink-dim">Loading slots…</p>;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
      {slots.map((s) => {
        const disabled = s.tables_left === 0;
        const label = timeFmt.format(new Date(s.slot_starts_at));
        return (
          <button
            key={s.slot_starts_at}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s.slot_starts_at)}
            className={clsx(
              'rounded-2xl border px-3 py-4 transition-colors',
              disabled && 'cursor-not-allowed opacity-30',
              !disabled && value === s.slot_starts_at
                ? 'border-amber bg-amber text-base'
                : 'border-line bg-elevated/40 text-ink hover:border-amber/50'
            )}
          >
            <div className="font-display text-lg">{label}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] opacity-70">
              {disabled ? 'Full' : s.tables_left === 1 ? 'Last' : `${s.tables_left} left`}
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create `DetailsForm.tsx`**

```tsx
import { useState } from 'react';

export interface Details { name: string; phone: string; email: string; notes: string; }

interface Props {
  initial: Details;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (d: Details) => void;
  onBack: () => void;
}

export default function DetailsForm({ initial, submitting, errorMessage, onSubmit, onBack }: Props) {
  const [form, setForm] = useState<Details>(initial);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="grid gap-5"
    >
      <Field label="Your Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
      <Field label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required placeholder="+91 9876543210" />
      <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
      <label className="block">
        <span className="block font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">Anything we should know? (optional)</span>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-line bg-base/60 px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
          placeholder="Birthday, dietary needs, seating preference…"
        />
      </label>
      {errorMessage && <p className="font-mono text-xs text-amber/80">{errorMessage}</p>}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-full border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim hover:text-ink">
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-amber px-7 py-3 font-mono text-[12px] uppercase tracking-[0.28em] text-base disabled:opacity-50"
        >
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-base/60 px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </label>
  );
}
```

- [ ] **Step 5: Create `ConfirmationCard.tsx`**

```tsx
import type { CreateBookingResponse } from '../../lib/api';

interface Props { booking: CreateBookingResponse; partySize: number; }

export default function ConfirmationCard({ booking, partySize }: Props) {
  return (
    <div className="rounded-3xl border border-amber/40 bg-elevated/40 p-10 text-center shadow-[0_0_60px_-20px_rgba(212,165,96,0.45)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-amber">Reservation confirmed</p>
      <h2 className="mt-4 font-display text-4xl font-light italic text-ink">Your table is booked.</h2>
      <p className="mt-4 font-sans text-[15px] text-ink-dim">
        Check your email for the confirmation. We'll send a reminder 24h and 2h before your seating.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-y-3 text-left">
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Date</dt>
        <dd className="font-display text-lg text-ink">{booking.date_label}</dd>
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Time</dt>
        <dd className="font-display text-lg text-ink">{booking.time_label}</dd>
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Party</dt>
        <dd className="font-display text-lg text-ink">{partySize}</dd>
        <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Table</dt>
        <dd className="font-display text-lg text-ink">{booking.table_label}</dd>
      </dl>
      <a
        href={booking.cancel_url}
        className="mt-8 inline-block rounded-full border border-amber px-6 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-colors hover:bg-amber hover:text-base"
      >
        Manage Booking
      </a>
    </div>
  );
}
```

- [ ] **Step 6: Replace `ReservePage.tsx` stub with the wizard**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Nav from '../components/sections/Nav';
import Footer from '../components/sections/Footer';
import DatePicker from '../components/reserve/DatePicker';
import PartySizePicker from '../components/reserve/PartySizePicker';
import TimeSlotGrid from '../components/reserve/TimeSlotGrid';
import DetailsForm, { type Details } from '../components/reserve/DetailsForm';
import ConfirmationCard from '../components/reserve/ConfirmationCard';
import { createBooking, type CreateBookingResponse, ApiError } from '../lib/api';

type Step = 'date' | 'party' | 'time' | 'details' | 'done';

export default function ReservePage() {
  const [step, setStep] = useState<Step>('date');
  const [date, setDate] = useState<string | null>(null);
  const [party, setParty] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<CreateBookingResponse | null>(null);

  const submit = async (d: Details) => {
    if (!slot || !party) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createBooking({
        guest_name: d.name,
        guest_phone: d.phone.replace(/[^\d+]/g, ''),
        guest_email: d.email,
        party_size: party,
        slot_starts_at: slot,
        special_requests: d.notes || undefined,
      });
      setConfirmed(res);
      setStep('done');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'no_tables_available') {
        setError('That slot just filled. Pick another time?');
        setStep('time');
      } else {
        setError('Something went wrong. Please try again or call us.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24 md:px-10">
        {step !== 'done' && (
          <div className="mb-8 flex items-center gap-3">
            <span className="h-[1px] w-10 bg-amber" />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber">Reserve a Table</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'date' && (
            <motion.section key="date" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h1 className="mb-8 font-display text-4xl font-light italic text-ink">Pick a date.</h1>
              <DatePicker value={date} onChange={(d) => { setDate(d); setStep('party'); }} />
            </motion.section>
          )}

          {step === 'party' && (
            <motion.section key="party" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h1 className="mb-8 font-display text-4xl font-light italic text-ink">How many of you?</h1>
              <PartySizePicker value={party} onChange={(n) => { setParty(n); setStep('time'); }} />
              <button onClick={() => setStep('date')} className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim hover:text-ink">← Change date</button>
            </motion.section>
          )}

          {step === 'time' && date && party && (
            <motion.section key="time" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h1 className="mb-8 font-display text-4xl font-light italic text-ink">When?</h1>
              <TimeSlotGrid date={date} party={party} value={slot} onChange={(iso) => { setSlot(iso); setStep('details'); }} />
              {error && <p className="mt-4 font-mono text-xs text-amber/80">{error}</p>}
              <button onClick={() => setStep('party')} className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim hover:text-ink">← Change party size</button>
            </motion.section>
          )}

          {step === 'details' && (
            <motion.section key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h1 className="mb-8 font-display text-4xl font-light italic text-ink">Almost there.</h1>
              <DetailsForm
                initial={{ name: '', phone: '', email: '', notes: '' }}
                submitting={submitting}
                errorMessage={error}
                onSubmit={submit}
                onBack={() => setStep('time')}
              />
            </motion.section>
          )}

          {step === 'done' && confirmed && party && (
            <motion.section key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <ConfirmationCard booking={confirmed} partySize={party} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 7: Verify it builds**

Run: `npm run build`
Expected: PASS

- [ ] **Step 8: Manual smoke test**

```bash
npm run dev
# Visit http://localhost:5173/reserve
# Step through the wizard. (Time slots will say "Couldn't load" until /api routes work via vercel dev — Task 21.)
```

- [ ] **Step 9: Commit**

```bash
git add src/pages/ReservePage.tsx src/components/reserve/
git commit -m "feat: /reserve 4-step booking wizard"
```

---

### Task 18: Build the `/b/:token` cancel page

**Files:**
- Modify: `src/pages/CancelBookingPage.tsx`

- [ ] **Step 1: Replace stub with full page**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../components/sections/Nav';
import Footer from '../components/sections/Footer';
import { getBookingByToken, cancelBooking, type GetBookingResponse, ApiError } from '../lib/api';

type State =
  | { status: 'loading' }
  | { status: 'loaded'; booking: GetBookingResponse['booking'] }
  | { status: 'cancelling' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

export default function CancelBookingPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!token) { setState({ status: 'error', message: 'Missing token.' }); return; }
    getBookingByToken(token)
      .then((res) => setState({ status: 'loaded', booking: res.booking }))
      .catch((e: unknown) => setState({
        status: 'error',
        message: e instanceof ApiError && e.status === 404 ? 'This booking link isn\'t valid.' : 'Couldn\'t load booking.',
      }));
  }, [token]);

  const onCancel = async () => {
    if (!token || state.status !== 'loaded') return;
    setState({ status: 'cancelling' });
    try {
      await cancelBooking(token);
      setState({ status: 'cancelled' });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof ApiError && e.code === 'too late' ? 'Too late to cancel online — please call us.' : 'Couldn\'t cancel. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-32 pb-24 md:px-10">
        {state.status === 'loading' && <p className="font-mono text-xs text-ink-dim">Loading…</p>}

        {state.status === 'error' && (
          <div className="rounded-3xl border border-amber/30 bg-elevated/40 p-10 text-center">
            <h2 className="font-display text-3xl italic text-ink">{state.message}</h2>
          </div>
        )}

        {(state.status === 'loaded' || state.status === 'cancelling') && 'booking' in state && (
          <div className="rounded-3xl border border-amber/30 bg-elevated/40 p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-amber">Your reservation</p>
            <h2 className="mt-4 font-display text-4xl font-light italic text-ink">Hi {state.booking.guest_name}.</h2>
            <p className="mt-4 font-sans text-[15px] text-ink-dim">
              {state.booking.status === 'cancelled'
                ? 'This booking has already been cancelled.'
                : `We have you booked for ${state.booking.party_size} on ${state.booking.date_label} at ${state.booking.time_label} (Table ${state.booking.table_label}).`}
            </p>
            {state.booking.status !== 'cancelled' && (
              <div className="mt-8 flex flex-col items-start gap-3">
                {state.booking.can_cancel ? (
                  <button
                    onClick={onCancel}
                    disabled={state.status === 'cancelling'}
                    className="rounded-full border border-amber px-6 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-amber transition-colors hover:bg-amber hover:text-base disabled:opacity-50"
                  >
                    {state.status === 'cancelling' ? 'Cancelling…' : 'Cancel reservation'}
                  </button>
                ) : (
                  <p className="font-mono text-xs text-ink-dim">Less than 24h remaining — please call us to cancel.</p>
                )}
              </div>
            )}
          </div>
        )}

        {state.status === 'cancelled' && (
          <div className="rounded-3xl border border-amber/30 bg-elevated/40 p-10 text-center">
            <h2 className="font-display text-3xl italic text-ink">Cancelled.</h2>
            <p className="mt-3 font-sans text-[15px] text-ink-dim">We've freed up the table. We'll miss you — come back soon.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/CancelBookingPage.tsx
git commit -m "feat: /b/:token cancel page"
```

---

### Task 19: Wire Reserve CTAs to `/reserve`

**Files:**
- Modify: `src/components/sections/Nav.tsx`
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: In `Nav.tsx`, change the Reserve `<a href="#reserve">` to `<Link to="/reserve">`**

Find:
```tsx
<a
  href="#reserve"
  ...
>
  Reserve
</a>
```

Replace with:
```tsx
<Link
  to="/reserve"
  ...same className...
>
  Reserve
</Link>
```

(`Link` should already be imported from `react-router-dom` at the top of the file.)

Do the same for the **mobile drawer's** Reserve button (further down in the file).

- [ ] **Step 2: In `Hero.tsx`, change the "Book a Table" CTA the same way**

Find the `<a href="#reserve">` (or `<a href="...">`) for "Book a Table" and convert to `<Link to="/reserve">`. Add `import { Link } from 'react-router-dom';` if missing.

- [ ] **Step 3: Verify build + visual smoke test**

Run: `npm run dev`
Click "Reserve" in nav → should land on `/reserve` (not jump anchor).
Click "Book a Table" in hero → same.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Nav.tsx src/components/sections/Hero.tsx
git commit -m "feat: route Reserve CTAs to /reserve"
```

---

## Phase 5 — Verify & Deploy

### Task 20: Run the test suite + build

**No new files.**

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: all tests pass (zod schemas, env, format, ghl, feedback, availability, bookings)

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS, dist/ generated

- [ ] **Step 4: Commit any cleanup**

```bash
git status
# fix any uncommitted accidental changes, then:
git add -A && git commit --allow-empty -m "chore: pre-deploy verification"
```

---

### Task 21: Local end-to-end smoke test (with `vercel dev`)

To run the `/api/*` routes locally (Vite alone won't), use Vercel's CLI.

- [ ] **Step 1: Install Vercel CLI globally if not present**

```bash
npm install -g vercel
vercel --version
```

- [ ] **Step 2: Link the project (one-time)**

```bash
vercel link
# follow prompts → select existing project "bistro-bar-ui" under your team
```

- [ ] **Step 3: Pull env vars from Vercel into local**

```bash
vercel env pull .env.local
# this overwrites/creates .env.local with whatever's set in Vercel
```

- [ ] **Step 4: Run dev server**

```bash
vercel dev
# serves on http://localhost:3000 (Vite + /api routes)
```

- [ ] **Step 5: Walk the full booking flow**

1. Open http://localhost:3000/reserve
2. Pick tomorrow's date → Party of 2 → 7:00 PM → fill in your real email + phone
3. Click "Confirm Booking"
4. Expected: redirected to confirmation card with `/b/<token>` link
5. Click the cancel link → land on cancel page → click "Cancel reservation"
6. Expected: success message

In Supabase SQL Editor:
```sql
select id, guest_name, party_size, slot_starts_at, status, ghl_contact_id, ghl_opportunity_id
from public.bookings
order by created_at desc
limit 1;
```
Should show your test booking with status `cancelled` and GHL IDs populated.

In GHL → Contacts → search your email — should find the contact with tags `bistro-bar-guest`, `booking-{date}`, `cancelled-{date}`.

In GHL → Opportunities → Reservations pipeline → your opportunity should be in `Cancelled` stage.

In your inbox: confirmation email + cancellation email from GHL workflows.

- [ ] **Step 6: Test feedback form**

1. http://localhost:3000/contact
2. Submit the form with your email + a real message
3. Expected: "Got it. Check your inbox."

In Supabase:
```sql
select * from public.feedback order by created_at desc limit 1;
```

In your inbox: feedback acknowledgement email.

⚠️ **If any of these fail, see the troubleshooting block at the bottom of `automation/ghl/03-workflows.md`.** The most common issue is the workflow being in Draft status (not Published).

- [ ] **Step 7: Commit any tweaks discovered during smoke test**

```bash
git status
# commit any fixes, then move on
```

---

### Task 22: Deploy to Vercel + production smoke test

- [ ] **Step 1: Push to git remote**

```bash
git push origin main
```

- [ ] **Step 2: Verify env vars are set in Vercel**

In the Vercel dashboard → Project Settings → Environment Variables, confirm all 22 vars from `.env.example` are set for **Production** environment.

If any are missing, add them and redeploy.

- [ ] **Step 3: Trigger production deploy**

Either:
```bash
vercel deploy --prod
```
Or push to `main` (if Vercel auto-deploy is enabled).

- [ ] **Step 4: Smoke test on production URL**

Repeat the booking + feedback flow on https://bistro-bar-ui.vercel.app (or your custom domain).

- [ ] **Step 5: Final commit (if needed)**

```bash
git log --oneline -10
# review recent commits, ensure plan is fully implemented
```

---

## Self-Review Checklist (run before handoff)

- [x] **Spec coverage:** every section of `automation/README.md` has a corresponding task
  - Supabase setup: not in this plan (manual prereq, documented in `automation/supabase/README.md`)
  - GHL setup: not in this plan (manual prereq, documented in `automation/ghl/`)
  - Booking flow: Tasks 10, 11, 12, 13, 14, 17
  - Feedback flow: Tasks 9, 14, 15
  - Cancel flow: Tasks 13, 18
  - Email templates: not in plan (manual import per `automation/ghl/email-templates/README.md`)
- [x] **Placeholder scan:** all "TODO"/"TBD"/"add error handling" patterns checked — none present
- [x] **Type consistency:** `CreateBookingRequest`, `CreateBookingResponse`, `Details`, `FeedbackInput`, `Env`, `GetBookingResponse` all defined once and re-imported consistently
- [x] **No invented APIs:** every Supabase RPC name (`create_booking`, `get_availability`, `cancel_booking`, `submit_feedback`, `set_booking_ghl_ids`, `get_booking_by_token`) matches `automation/supabase/03_rpcs.sql`. Every GHL endpoint matches the v2 REST API docs.
- [x] **Frequent commits:** every task ends in a commit step; mid-task incremental commits are also flagged

---

## Important production notes

1. **Cold-start cost:** Each Vercel function call boots Node + initializes the Supabase client. With Fluid Compute (Vercel's default), instances are reused across concurrent requests, so this is only an issue for the very first call after idle. Acceptable for a restaurant-booking workload.

2. **GHL rate limits:** GHL v2 allows ~100 req/min per location. A booking triggers 4 GHL calls (upsert + fields + opp + RPC backfill). At restaurant scale (~50 bookings/day) this is well under limits.

3. **Service role key safety:** `SUPABASE_SERVICE_ROLE_KEY` MUST live only in `process.env`, never imported into any `src/` file. The `api/_lib/supabase.ts` is the only place it should appear. Verify with: `grep -r "SUPABASE_SERVICE_ROLE_KEY" src/` → should return nothing.

4. **GHL fallback:** If GHL is down, bookings still succeed (Supabase is the source of truth). The booking row will simply have NULL `ghl_contact_id` / `ghl_opportunity_id`. A future cron job can backfill these — not in v1.

5. **Timezone:** All slot timestamps are stored as `timestamptz` in UTC. The format helpers in `api/_lib/format.ts` render them in `Asia/Kolkata` for display. Don't change the database to local time — it'll break across DST or any future server move.

6. **Race condition test:** The `create_booking` RPC uses `SELECT ... FOR UPDATE` to lock the candidate table row. To validate this works, two simultaneous bookings to the same slot will produce: one success, one `409 no_tables_available`. Test this manually with two browser tabs and click "Confirm" within ~100ms of each other.
