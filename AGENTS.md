# AGENTS.md

## Commands

```bash
npm run dev         # next dev --turbopack at http://localhost:3000
npm run build       # migrate deploy → generate → seed → next build --turbopack (needs live PostgreSQL)
npm run lint        # ESLint flat config (next/core-web-vitals + next/typescript)
npx tsc --noEmit    # typecheck; no npm script exists
npm run seed        # ts-node -P prisma/tsconfig.json prisma/seed.ts (alias: prisma:seed)
```

- First run: `npm install` → copy `.env.example` to `.env` → `npx prisma generate` → `npm run dev`. There is no `postinstall`/`prepare` hook, so a fresh clone's `@prisma/client` types are stale and `tsc` fails with `Property 'donation' does not exist` (also `savedReport`, `routeMetric`). Generation is offline.
- No test suite, no CI workflow, no `opencode.json`. Verify with `npx tsc --noEmit` then `npm run lint` (baseline: tsc clean; lint 0 errors and 4 warnings, all from vendored `.agents/skills/**` — don't edit those to silence them).
- `npm run build` and DB-backed routes (`/blog`, `/panel`, `/admin`, most `/api`) require a reachable `DATABASE_URL`; use tsc + lint for code-only checks.
- After editing `prisma/schema.prisma`, run `npx prisma migrate dev --name <name>`. `npm run build` only applies committed migrations (`migrate deploy`).
- The seed is idempotent (`upsert` with `update: {}`): it creates `admin@example.com` / `admin-password` (ADMIN) only if missing, and `build` runs it every time.

## Stack & conventions

- Next.js 15.5.7 (App Router, Turbopack) · React 19.1 · TypeScript strict · `@/*` → `src/*`.
- Next 15 async APIs: `cookies()`, `params`, and `searchParams` are Promises — always `await` them. Client pages read query strings via `new URLSearchParams(window.location.search)` (no `useSearchParams`).
- Tailwind v4 via `@tailwindcss/postcss`; the real config is `src/app/globals.css` (`@import "tailwindcss"`, `@plugin`, `@theme inline`). CSS vars live in `:root` (hex values, dark theme only). `tailwind.config.ts` is a stale v3 leftover; `components.json` intentionally leaves `tailwind.config` empty.
- Shared classes live in `globals.css`: `.btn`/`.btn-*`, `.card`, `.form-input`, `.badge`, `.glass-panel`, `.section-title`, `.page-container`; everything else uses inline `style={{ ... }}`. The three `*.module.css` files (about, informe-fotografico, presupuesto) are imported nowhere — editing them has no effect.
- shadcn/ui new-york style + `@animate-ui` registry; icons via lucide; animation via `motion` v12.
- Fonts are self-hosted: `next/font/local` with `src/app/fonts/*.woff2` (Inter variable 300–800, Rajdhani 300–700) exposed as `--font-inter` / `--font-rajdhani`. Do not switch to `next/font/google`: fetching Google Fonts at build time caused the Vercel/Turbopack `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` failure. Regenerate with `node scripts/download-fonts.mjs` (needs network) and keep the files committed.
- PDFs are client-side: jsPDF + jspdf-autotable, chart.js for the SEV curve, react-pdf/pdfjs for sample documents, tiptap for articles. All report PDFs stamp `/logo1.png` via `tryAddPdfLogo()` (`src/lib/pdf-logo.ts`), which deliberately swallows load errors. Header/Footer use `/logo3.png`; auth pages use `/logo2.png`.
- Prisma + PostgreSQL. `src/lib/prisma.ts` always extends `PrismaClient` with `withAccelerate()`. The schema reads `DATABASE_URL` (direct `postgres://`); `PRISMA_DATABASE_URL` (`prisma://`) exists in env but no code reads it.
- UI is Spanish (`lang="es"`, `es_CL` dates). Keep user-facing strings in Spanish.

## Routes & features

- Public routes: `/`, `/calculadoras` (seccion, caida-tension, calculadora-corriente, empalmes, seccion-ric, rotuladora), `/informes` (presupuesto, informe-resistividad, informe-fotografico, informe-inspeccion, orden-trabajo), `/blog` + `/blog/[slug]`, `/donar` + `/donar/gracias`, `/login`, `/signup`, `/about`, `/contact`. Normative tables live in a sibling `data.ts` (empalmes, seccion-ric) or inside the page/component.
- Every tool/generator route has a sibling `layout.tsx` with metadata + canonical — put new SEO there, not in the page. The tool and generator pages are `'use client'` except `/informes/informe-resistividad`, a server page wrapping client `SevReport.tsx`.
- The seccion, caida-tension, and calculadora-corriente `layout.tsx` files inject JSON-LD (`WebApplication` + `BreadcrumbList`; the first two also `FAQPage`). FAQ copy lives in `src/lib/seccion-faq.ts` / `src/lib/caida-tension-faq.ts` and is imported by both the layout (JSON-LD) and the page (visible FAQ) — edit it there, not inline.
- Every calculator mounts `<CalculatorTour guideId="…" />` (`src/components/calculadoras/CalculatorTour.tsx`): overlay + spotlight + step card (bottom sheet on mobile), Esc/arrow keys, focus trap, reduced-motion support. Steps and selectors live in `src/lib/calculator-guides.ts` (`CALCULATOR_GUIDES`), not the pages; targets are element ids or `data-tour` attrs (`seccion-sistema`, `empalmes-metodo`, `ric-form`), so renaming a field means updating its selector. `fallback` covers conditional fields (RIC, potencia vs corriente). The «Guía rápida» button next to each `h1` opens it; it auto-opens once per calculator (`vmelectric:guia:v1:<id>` in localStorage, first visit only, no scroll/interaction). `CALCULATOR_RESULT_STEPS` adds a post-calculation «Consejo»: the first successful `submit` reopens the tour at `[data-tour="copiar-resultado"]` (`CopyResultButton`'s `dataTour`, set in seccion, caida-tension, corriente, and seccion-ric; the copy preview opens on click). Empalmes and rotuladora have no copy button and no result step.
- seccion, caida-tension, and calculadora-corriente persist the form + history in localStorage (`usePersistentState` / `useCalculationHistory`, keys `vmelectric:calc:*`, 25 entries) and share formulas from `src/lib/electrical.ts`; seccion-ric persists only `referencia` + history and reads its `data.ts`; empalmes keeps history in component state (lost on reload). The first three show «Calcular» → «Guardar cálculo» and record once per distinct result; seccion-ric records each new result; empalmes records every successful calculation. This browser history is separate from `/panel/historial`, which reads DB `Calculation` rows. Don't add per-page history state to the localStorage-backed tools.
- Five calculation types persist (`src/lib/calculation-types.ts`); rotuladora is not recorded. All five recording tools POST via `useCalculationRecorder`, which deliberately swallows errors (history must never break a calculation). `POST /api/calculations` caps `input` + `result` at 64 KB, `GET` returns the latest 100, `DELETE` wipes the user's history.
- Saved reports store JSON only (no PDF bytes), capped by `MAX_REPORT_DATA_MB` (default 8). Save/load goes through `src/lib/report-client.ts` (`persistSavedReport` → `POST /api/reports` or `PUT /api/reports/[id]`; `fetchSavedReport` → `GET`). Each generator reads `?reportId=` via `new URLSearchParams(window.location.search)`, calls `fetchSavedReport`, asserts `report.type` (`PRESUPUESTO`, `RESISTIVIDAD_SEV`, `FOTOGRAFICO_RIC18`, `INSPECCION`), then merges the data. Only those 4 are persistable (`ReportType`); orden-trabajo is not in the enum.
- `/informes/orden-trabajo` is deliberately print-only: blank A4 orders from `folio`/`cantidad`/`emisión`, no inputs inside the document, no API/DB writes, export via `window.print()` + `orden-trabajo.css` (body class `ot-print-ready`). Don't add saved-report wiring or reintroduce editable document fields.
- Donations (`/donar`) use Flow checkout for one-time CLP (`Donation` model, HMAC in `src/lib/flow.ts`). `POST /api/donations` creates the order; `/api/donations/confirm` is Flow's webhook; `/api/donations/return` redirects to `/donar/gracias`; admins review at `/admin/donaciones`. Amounts are integer CLP 500–1,000,000 (`src/lib/donation-config.ts`); `syncDonationStatus` re-reads Flow, rejects mismatched `commerceOrder`/`amount`, and is idempotent so the webhook and return page can both call it. Callbacks need a public HTTPS origin (`NEXT_PUBLIC_SITE_URL`); localhost needs a tunnel. `FLOW_ENV` defaults to `sandbox`.
- `/api/upload` returns a base64 data URL (JPEG/PNG/WebP/GIF, 2 MB) and is unauthenticated; article images live inline in Postgres, not on disk.

## Auth, metrics & SEO

- `/panel` (USER): index, `/perfil`, `/historial`, `/informes`. `/admin` (ADMIN): index, `/usuarios`, `/donaciones`, `/metrics`, `/categories`, `/articles` (+ `new`, `[id]/edit`). Panel pages are server components querying Prisma; most admin pages are client components calling `/api/*` (exceptions: the admin index and `/admin/donaciones`, which query Prisma server-side).
- Auth is a base64-encoded JSON cookie `session_token` — not a JWT, unsigned, no DB lookup. `requireUser()` / `requireAdmin()` only decode it. Passwords are bcrypt (`login` compares with `bcrypt.compare`; register requires ≥8 chars). Profile edits go through `/api/auth/profile`. API handlers catch the exact message `Unauthorized` → 401 `{ error: 'No autorizado' }`; other errors → 500.
- Because role/identity live only in the cookie, role changes and account deletions take effect only after re-login; `/api/auth/profile` reissues the cookie when email/name changes.
- Middleware only checks cookie presence for `/panel` and `/admin` and is excluded from `/api`; each protected handler calls `requireUser`/`requireAdmin` itself. Server layouts enforce roles: `panel/layout.tsx` (ADMIN → `/admin`) and `admin/layout.tsx` (non-ADMIN → `/panel`; both → `/login` when signed out).
- `POST /api/auth/register` (public `/signup`) creates a USER and logs it in. Admin user management is `/admin/usuarios` → `/api/users`.
- `RouteTracker` (root layout) POSTs every navigation to `/api/visits`, ignoring `/admin`, `/api`, `/_next`, `/login`, `/signup`, and paths containing `.`. `/api/visits` upserts `RouteMetric` when a `path` is sent (otherwise bumps the singleton `SiteMetric`); `GET` returns site visits. `/api/admin/metrics` is admin-only.
- `https://www.vmelectric.cl` is hardcoded in `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `src/lib/donations.ts`, `src/app/blog/**`, and each section's `layout.tsx` (metadata + canonical) — grep for it before changing domains. `robots.txt` / `sitemap.xml` are served by `src/app/robots.ts` and `src/app/sitemap.ts`; do not add copies under `public/`, because Next returns a 500 for a conflicting public/page file (verified in dev), leaving crawlers without either.
- `sitemap.ts` queries Prisma for published articles but swallows DB errors at build time; `/blog`, `/blog/[slug]`, and `/admin/donaciones` are `force-dynamic` and will error without a DB.
- SEO posture is deliberate: `robots.ts` allows Googlebot but disallows 19 AI crawlers; `next.config.ts` adds `X-Robots-Tag: noai, noimageai`, `TDM-Reservation`, and `TDM-Policy` headers and allows images from any HTTPS host. Don't "fix" these when touching caching/SEO. `public/google9c48faa7d8c2e48d.html` is Search Console verification; `.gsc/` (gitignored) holds private exports.
- GA4 runs via `<GoogleAnalytics gaId="G-K79465K2BD" />` in the root layout; the landing page and `DonationSupportCard` fire `sendGAEvent` from `@next/third-parties/google`. The ID is hardcoded.
- Product background lives in `Contexto.md`, `PLAN_CLIENTES_PANEL.md`, and `monetizacion.md`; they are partly stale (e.g. `Contexto.md` predates seccion-ric and the report generators), so trust code/config over prose.

## Gotchas

- Never import `@/lib/prisma` in client components; use it only in server pages/route handlers.
- `prisma/` is excluded from the root `tsconfig.json`; the seed runs with `prisma/tsconfig.json` (`module: commonjs`), which is why the `-P` flag matters.
- `html2canvas` is imported by the rotuladora but is only a transitive dependency (via jsPDF); declare it explicitly if dependencies are reorganized.
- `.agents/skills/**` and `skills-lock.json` are vendored skill files (autoskills registry), not app code. There is no root `skills/` directory.
- `README.md` is mostly the create-next-app default plus a proprietary-license section — this file and `.env.example` are the real setup docs.
- Env vars: `DATABASE_URL`, `PRISMA_DATABASE_URL` (unused), `FLOW_API_KEY`/`FLOW_SECRET_KEY`/`FLOW_ENV` (`sandbox` unless `production`), `NEXT_PUBLIC_SITE_URL` (Flow callbacks), `SMTP_USER`/`SMTP_PASS`/`CONTACT_EMAIL` (Gmail contact form), `GOOGLE_API_KEY` (SEV → Drive), `MAX_REPORT_DATA_MB`. `.env*` is gitignored; `.env.example` is tracked.
- `src/app/informes/informe-resistividad/SevReport.tsx` is `'use client'` but reads `process.env.GOOGLE_API_KEY` and hardcodes the OAuth client ID; Next only inlines `NEXT_PUBLIC_*` into client bundles, so the browser Drive upload receives `undefined`. Route it through a server handler instead of exposing the key.
- The repo is proprietary software: no copying, redistribution, or AI training. `next.config.ts` and `robots.ts` enforce that reservation; don't weaken them.
