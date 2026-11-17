# AGENTS.md

## Commands

```bash
npm run dev         # Next 15 + Turbopack at http://localhost:3000
npm run build       # migrate deploy → generate → seed → next build --turbopack (needs live PostgreSQL)
npm run lint        # ESLint flat config (next/core-web-vitals + next/typescript)
npx tsc --noEmit    # typecheck; no npm script exists
npm run seed        # ts-node -P prisma/tsconfig.json prisma/seed.ts (alias: prisma:seed)
```

- No test suite, no CI workflow, no `opencode.json`. Verify with `npx tsc --noEmit` then `npm run lint` (baseline: tsc clean, lint 0 errors / 4 warnings).
- `npm run build` and any DB-backed route (`/blog`, `/panel`, `/admin`, most `/api`) need a reachable `DATABASE_URL`; use tsc + lint for code-only checks.
- Run `npx prisma generate` on a fresh clone or after schema/migration changes: there is no `postinstall`/`prepare` hook, so `@prisma/client` types are stale and `tsc` fails with `Property 'donation' does not exist on type ...` (also `savedReport`, `routeMetric`). Generation is offline; `npm run build` does it along the way.
- After editing `prisma/schema.prisma`, run `npx prisma migrate dev --name <name>`. `npm run build` only applies committed migrations (`migrate deploy`).
- The seed is idempotent (`upsert` with `update: {}`): it creates `admin@example.com` / `admin-password` (ADMIN) only if missing. `build` runs it every time.
- The 4 lint warnings all come from vendored `.agents/skills/**`; don't edit those files to silence them.

## Stack & wiring

- **Next.js 15.5.7** (App Router, Turbopack) · **React 19.1** · **TypeScript strict** · `@/*` → `src/*`.
- Next 15 async APIs: `cookies()`, `params`, and `searchParams` are Promises — always `await` them. Client pages read query strings with `new URLSearchParams(window.location.search)` (no `useSearchParams`).
- **Tailwind v4** via `@tailwindcss/postcss`; the real config is `src/app/globals.css` (`@import "tailwindcss"`, `@plugin`, `@theme inline`). CSS vars live in `:root` (hex values, dark theme only). `tailwind.config.ts` is a stale v3 leftover; `components.json` intentionally leaves `tailwind.config` empty.
- Shared classes in `globals.css`: `.btn`/`.btn-*`, `.card`, `.form-input`, `.badge`, `.glass-panel`, `.section-title`, `.page-container`; everything else is styled with inline `style={{ ... }}` objects. The three `*.module.css` files (about, informe-fotografico, presupuesto) are **imported nowhere** — editing them has no effect.
- **shadcn/ui** new-york style + `@animate-ui` registry; icons via lucide; animation via `motion` v12.
- PDFs are generated client-side: jsPDF + jspdf-autotable, chart.js (SEV curve); react-pdf/pdfjs for sample documents; tiptap for the article editor. All report PDFs stamp the light-background logo through `tryAddPdfLogo()` (`src/lib/pdf-logo.ts`, `/logo1.png`); it swallows load errors on purpose. `Header`/`Footer` use `/logo3.png`; auth pages use `/logo2.png`.
- **Prisma + PostgreSQL**. `src/lib/prisma.ts` always wraps `PrismaClient` with `withAccelerate()`. The schema reads `DATABASE_URL` (direct `postgres://`); `PRISMA_DATABASE_URL` (`prisma://`) exists in env but no code reads it.
- **Spanish UI**, `lang="es"`, `es_CL` dates/locale. Keep user-facing strings in Spanish.

## Architecture

- Public routes: `/`, `/calculadoras` (6 tools: seccion, caida-tension, calculadora-corriente, empalmes, seccion-ric, rotuladora), `/informes` (5 generators: presupuesto, informe-resistividad, informe-fotografico, informe-inspeccion, orden-trabajo), `/blog` + `/blog/[slug]`, `/donar` + `/donar/gracias`, `/login`, `/signup`, `/about`, `/contact`. Normative tables live in a sibling `data.ts` (empalmes, seccion-ric) or inside the page/component.
- All calculators and report generators except `/informes/informe-resistividad` (a server page wrapping client `SevReport.tsx`) are `'use client'`; every tool/generator route has a sibling `layout.tsx` with metadata + canonical. Put new SEO there, not in the page.
- The seccion, caida-tension, and calculadora-corriente `layout.tsx` inject JSON-LD (`WebApplication` + `BreadcrumbList`; the first two also add `FAQPage`) alongside `metadata`. Their FAQ copy lives in `src/lib/seccion-faq.ts` / `src/lib/caida-tension-faq.ts` and is imported by **both** the layout (JSON-LD) and the page (visible FAQ), so edit it once there — not inline in either file.
- `/panel` (USER): index, `/perfil`, `/historial`, `/informes`. `/admin` (ADMIN): index, `/usuarios`, `/donaciones`, `/metrics`, `/categories`, `/articles` (+ `new`, `[id]/edit`). Panel pages are server components querying Prisma directly; most `/admin` pages are client components calling `/api/*` (exceptions: the admin index and `/admin/donaciones`, which query Prisma server-side).
- Auth is a **base64-encoded JSON** cookie `session_token` — not a JWT, not signed, no DB lookup. `requireUser()` / `requireAdmin()` only decode it. Passwords are bcrypt-hashed (`login` compares with `bcrypt.compare`; `register` hashes, minimum 8 chars). Editing the profile goes through `/api/auth/profile`. API handlers catch the exact message `Unauthorized` → 401 `{ error: 'No autorizado' }`; other errors → 500.
- Since role and identity live only in the cookie, role changes and account deletions do not take effect until the user logs in again; `/api/auth/profile` reissues the cookie when email/name changes.
- Middleware only checks cookie presence for `/panel` and `/admin`, and is excluded from `/api`; every protected API handler calls `requireUser`/`requireAdmin` itself. Role checks live in the server layouts `src/app/panel/layout.tsx` (ADMIN → `/admin`) and `src/app/admin/layout.tsx` (non-ADMIN → `/panel`; both → `/login` when signed out).
- `POST /api/auth/register` (public `/signup`) creates a USER and logs it in immediately. Admin user management is `/admin/usuarios` → `/api/users`.
- Five calculation types persist (`src/lib/calculation-types.ts`); the rotuladora is not recorded. All five recording tools (seccion, caida-tension, calculadora-corriente, empalmes, seccion-ric) POST via `useCalculationRecorder`, which deliberately swallows errors (history must never break a calculation). `POST /api/calculations` caps `input`+`result` at 64 KB, `GET` returns the latest 100, `DELETE` wipes the user's history.
- seccion, caida-tension, and calculadora-corriente persist the form + history in localStorage via `usePersistentState` / `useCalculationHistory` (keys `vmelectric:calc:*`, 25 entries) and share formulas from `src/lib/electrical.ts`; seccion-ric persists only `referencia` + history and reads its `data.ts`; empalmes keeps history in component state (lost on reload). The first three show «Calcular» then «Guardar cálculo» and record once per distinct result; seccion-ric records each new result; empalmes records every successful calculation. This browser history is separate from `/panel/historial`, which reads DB `Calculation` rows. Don't add per-page history state to the localStorage-backed tools.
- Saved reports store JSON only (no PDF bytes), capped by `MAX_REPORT_DATA_MB` (default 8). Save/load goes through `src/lib/report-client.ts` (`persistSavedReport` → `POST /api/reports` or `PUT /api/reports/[id]`; `fetchSavedReport` → `GET`). Each generator reads `?reportId=` via `new URLSearchParams(window.location.search)`, calls `fetchSavedReport`, asserts `report.type` itself (`PRESUPUESTO`, `RESISTIVIDAD_SEV`, `FOTOGRAFICO_RIC18`, `INSPECCION`), then merges the data. Only 4 types are persistable (`ReportType`); orden-trabajo is not in the enum.
- `/informes/orden-trabajo` is deliberately print-only: it renders blank A4 orders from `folio`/`cantidad`/`emisión`, has **no inputs inside the document**, writes nothing to the API or DB, and exports via `window.print()` + `orden-trabajo.css` (body class `ot-print-ready`) instead of jsPDF. Don't add saved-report wiring to it or reintroduce editable fields.
- Donations (`/donar`) use Flow checkout for one-time CLP amounts (`Donation` model, HMAC signing in `src/lib/flow.ts`). `POST /api/donations` creates the order, `/api/donations/confirm` is Flow's server webhook, and `/api/donations/return` redirects the browser to `/donar/gracias`; admins review payments at `/admin/donaciones`. Amounts are integer CLP between 500 and 1,000,000 (`src/lib/donation-config.ts`); `syncDonationStatus` re-reads Flow and rejects mismatched `commerceOrder`/`amount`, and is idempotent so the webhook and the return page can both call it. Flow callbacks need a public HTTPS origin (`NEXT_PUBLIC_SITE_URL`); localhost only works through a tunnel. `FLOW_ENV` defaults to `sandbox`.
- `/api/upload` returns a base64 data URL (JPEG/PNG/WebP/GIF only, 2 MB); article images are stored inline in Postgres, not on disk.
- `RouteTracker` (root layout) POSTs every navigation to `/api/visits`, ignoring `/admin`, `/api`, `/_next`, `/login`, `/signup`, and paths containing `.`. `/api/visits` upserts `RouteMetric` when a `path` is sent (otherwise bumps the singleton `SiteMetric`); `GET` returns site visits. `/api/admin/metrics` is admin-only.
- `https://www.vmelectric.cl` is hardcoded in `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `src/lib/donations.ts`, `src/app/blog/**`, and each section's `layout.tsx` (metadata + canonical) — grep for it before changing domains. `robots.txt` and `sitemap.xml` are served by `src/app/robots.ts` and `src/app/sitemap.ts`; do **not** add copies under `public/`, because Next returns a 500 for a conflicting public file and page file (verified in dev), leaving crawlers without sitemap or robots.
- `sitemap.ts` queries Prisma for published articles but swallows DB errors at build time; `/blog`, `/blog/[slug]`, and `/admin/donaciones` are `force-dynamic` and will error without a DB.
- SEO posture is deliberate: `robots.ts` allows Googlebot but disallows ~19 AI crawlers; `next.config.ts` adds `X-Robots-Tag: noai, noimageai`, `TDM-Reservation`, and `TDM-Policy` headers. Don't "fix" these when touching caching/SEO. `public/google9c48faa7d8c2e48d.html` is the Search Console verification file; `.gsc/` holds private GSC CSV exports and is gitignored.
- GA4 runs via `<GoogleAnalytics gaId="G-K79465K2BD" />` in the root layout; the landing page and `DonationSupportCard` fire `sendGAEvent` from `@next/third-parties/google`. The ID is hardcoded.
- Product background lives in `Contexto.md`, `PLAN_CLIENTES_PANEL.md`, and `monetizacion.md`; they are partly stale (e.g. `Contexto.md` predates seccion-ric and the report generators), so trust code and config over prose.

## Gotchas

- Never import `@/lib/prisma` in client components; use it only in server pages/route handlers.
- `prisma/` is excluded from the root `tsconfig.json`; seed runs with `prisma/tsconfig.json` (`module: commonjs`) — that's why the `-P` flag matters.
- `html2canvas` is imported by the rotuladora but is only a transitive dependency (via jsPDF); declare it explicitly if dependencies are reorganized.
- `.agents/skills/**` and `skills-lock.json` are vendored skill files (autoskills registry), not app code. There is no root `skills/` directory.
- `README.md` is mostly the create-next-app default plus a proprietary-license section — this file and `.env.example` are the real setup docs.
- Env vars: `DATABASE_URL`, `PRISMA_DATABASE_URL` (unused), `FLOW_API_KEY`/`FLOW_SECRET_KEY`/`FLOW_ENV` (donations; `sandbox` unless set to `production`), `NEXT_PUBLIC_SITE_URL` (Flow callbacks), `SMTP_USER`/`SMTP_PASS`/`CONTACT_EMAIL` (Gmail contact form), `GOOGLE_API_KEY` (SEV → Google Drive), `MAX_REPORT_DATA_MB`. `.env*` is gitignored; `.env.example` is tracked.
- `src/app/informes/informe-resistividad/SevReport.tsx` is `'use client'` but reads `process.env.GOOGLE_API_KEY` (and hardcodes the OAuth client ID); Next only inlines `NEXT_PUBLIC_*` into client bundles, so the Drive upload receives `undefined` in the browser. Route it through a server handler instead of exposing the key.
- `next.config.ts` allows images from every HTTPS hostname and adds site-wide `X-Robots-Tag: noai, noimageai` + `TDM-*` headers backing the LICENSE; `robots.ts` also blocks known AI crawlers. The repo is proprietary software — no copying, redistribution, or AI training.
