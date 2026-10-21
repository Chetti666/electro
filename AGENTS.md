# AGENTS.md

## Commands

```bash
npm run dev         # Next 15 + Turbopack at http://localhost:3000
npm run build       # migrate deploy → generate → seed → next build --turbopack (needs live PostgreSQL)
npm run lint        # ESLint (flat config: next/core-web-vitals + next/typescript)
npx tsc --noEmit    # typecheck; no npm script exists
npm run seed        # = prisma:seed (ts-node -P prisma/tsconfig.json prisma/seed.ts)
```

- Verify with `npx tsc --noEmit` then `npm run lint`. There is no test suite and no CI workflow.
- Run `npx prisma generate` before typechecking on a fresh clone or after any schema/migration change: there is no `postinstall`/`prepare` hook, so `@prisma/client` types are stale and `tsc` fails with `Property 'donation' does not exist on type ...` (also for `savedReport`, `routeMetric`). Generation is offline; `npm run build` does it along the way.
- `npm run lint` emits only 4 warnings from vendored `.agents/skills/**` (0 errors); don't edit those files to silence them.
- After editing `prisma/schema.prisma`, run `npx prisma migrate dev --name <name>`. `npm run build` only applies committed migrations (`migrate deploy`).
- The seed is idempotent (`upsert` with `update: {}`): it creates `admin@example.com` / `admin-password` (ADMIN) only if missing. `build` runs it every time.

## Stack & wiring

- **Next.js 15.5.7** (App Router, Turbopack) · **React 19.1** · **TypeScript strict** · `@/*` → `src/*`.
- Next 15 async APIs: `cookies()`, `params`, and `searchParams` are Promises — always `await` them. Client pages read query strings with `new URLSearchParams(window.location.search)` (no `useSearchParams`).
- **Tailwind v4** via `@tailwindcss/postcss`; the real config is `src/app/globals.css` (`@import "tailwindcss"`, `@plugin`, `@theme inline`). CSS vars live in `:root` (hex values, dark theme only). `tailwind.config.ts` is a stale v3 leftover; `components.json` intentionally leaves `tailwind.config` empty.
- Shared classes in `globals.css`: `.btn`/`.btn-*`, `.card`, `.form-input`, `.badge`, `.glass-panel`, `.section-title`, `.page-container`; everything else is styled with inline `style={{ ... }}` objects. The three `*.module.css` files (about, informe-fotografico, presupuesto) are **imported nowhere** — editing them has no effect.
- **shadcn/ui** new-york style + `@animate-ui` registry; icons via lucide; animation via `motion` v12.
- PDFs are generated client-side: jsPDF + jspdf-autotable, chart.js (SEV curve); react-pdf/pdfjs for sample documents; tiptap for the article editor.
- **Prisma + PostgreSQL**. `src/lib/prisma.ts` always wraps `PrismaClient` with `withAccelerate()`. Prisma reads `DATABASE_URL` (direct `postgres://`); `PRISMA_DATABASE_URL` (`prisma://`) exists in env but no code reads it.
- **Spanish UI**, `lang="es"`, `es_CL` dates/locale. Keep user-facing strings in Spanish.

## Architecture

- Public routes: `/`, `/calculadoras` (6 tools: seccion, caida-tension, calculadora-corriente, empalmes, seccion-ric, rotuladora), `/informes` (4 generators: presupuesto, informe-resistividad, informe-fotografico, informe-inspeccion), `/blog` + `/blog/[slug]`, `/donar` + `/donar/gracias`, `/login`, `/signup`, `/about`, `/contact`. Every tool/generator is a `'use client'` page with its own `layout.tsx` (metadata + canonical); normative tables live in a sibling `data.ts` (empalmes, seccion-ric) or inside the page/component.
- `/panel` (USER): index, `/perfil`, `/historial`, `/informes`. `/admin` (ADMIN): index, `/usuarios`, `/donaciones`, `/metrics`, `/categories`, `/articles` (+ `new`, `[id]/edit`).
- Auth is a **base64-encoded JSON** cookie `session_token` — not a JWT, not signed, no DB lookup. `requireUser()` / `requireAdmin()` only decode it. Passwords are bcrypt-hashed (`login` compares with `bcrypt.compare`; `register` hashes, minimum 8 chars). Editing the profile goes through `/api/auth/profile`.
- Middleware only checks cookie presence for `/panel` and `/admin`, and is excluded from `/api`. Role checks live in layouts (`PanelLayout` → ADMIN redirected to `/admin`; `AdminLayout` → non-admins to `/panel`) and in every API route via `requireUser`/`requireAdmin`, which throw `Error('Unauthorized')`; handlers catch that exact message and return 401 `{ error: 'No autorizado' }` (other errors → 500).
- `POST /api/auth/register` (public `/signup`) creates a USER and logs it in immediately. Admin user management is `/admin/usuarios` → `/api/users`.
- Only 5 calculation types persist (`src/lib/calculation-types.ts`); the rotuladora is not recorded. `POST /api/calculations` caps `input`+`result` at 64 KB, `GET` returns the latest 100, `DELETE` wipes the user's history. Recording goes through `useCalculationRecorder`, which deliberately swallows errors (history must never break a calculation).
- Saved reports store JSON only (no PDF bytes), capped by `MAX_REPORT_DATA_MB` (default 8). Saving goes through `useReportSaver` → `POST /api/reports` (create) or `PUT /api/reports/[id]` (update). Each generator reads `?reportId=` via `new URLSearchParams(window.location.search)`, fetches `/api/reports/[id]`, asserts `report.type` itself, then merges the data.
- Donations (`/donar`) use Flow checkout for one-time CLP amounts (`Donation` model, HMAC signing in `src/lib/flow.ts`). `POST /api/donations` creates the order, `/api/donations/confirm` is Flow's server webhook, and `/api/donations/return` redirects the browser to `/donar/gracias`; admins review payments at `/admin/donaciones`. Amounts are integer CLP between 500 and 1,000,000 (`src/lib/donation-config.ts`); `syncDonationStatus` re-reads Flow and rejects mismatched `commerceOrder`/`amount`, and is idempotent so the webhook and the return page can both call it. Flow callbacks need a public HTTPS origin (`NEXT_PUBLIC_SITE_URL`); localhost only works through a tunnel.
- `/api/upload` returns a base64 data URL (images only, 2 MB); article images are stored inline in Postgres, not on disk.
- `RouteTracker` (root layout) POSTs every navigation to `/api/visits`, ignoring `/admin`, `/api`, `/login`, `/signup`, and paths containing `.`. `/api/admin/metrics` is admin-only.
- `https://vmelectric.cl` is hardcoded in `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `src/lib/donations.ts`, and every section's `layout.tsx` (metadata + canonical) — grep for it before changing domains. `public/robots.txt` and `public/sitemap.xml` are committed static copies of `src/app/robots.ts`/`sitemap.ts`; update both sides when routes or the domain change.
- GA4 runs via `<GoogleAnalytics gaId="G-K79465K2BD" />` in the root layout; the landing page fires `sendGAEvent` from `@next/third-parties/google`. The ID is hardcoded.
- Product background lives in `Contexto.md`, `PLAN_CLIENTES_PANEL.md`, and `monetizacion.md`; they are partly stale (e.g. missing seccion-ric and presupuesto), so trust code and config over prose.

## Gotchas

- Never import `@/lib/prisma` in client components; use it only in server pages/route handlers.
- `prisma/` is excluded from the root `tsconfig.json`; seed runs with `prisma/tsconfig.json` (`module: commonjs`) — that's why the `-P` flag matters.
- `html2canvas` is imported by the rotuladora but is only a transitive dependency (via jsPDF); declare it explicitly if dependencies are reorganized.
- `.agents/skills/**` and `skills-lock.json` are vendored skill files, not app code (the root `skills/` directory is an empty untracked leftover).
- `README.md` is the create-next-app default plus two stray lines — this file and `.env.example` are the real docs.
- Env vars: `DATABASE_URL`, `PRISMA_DATABASE_URL`, `FLOW_API_KEY`/`FLOW_SECRET_KEY`/`FLOW_ENV` (donations; `sandbox` unless set to `production`), `NEXT_PUBLIC_SITE_URL` (Flow callbacks), `SMTP_USER`/`SMTP_PASS`/`CONTACT_EMAIL` (Gmail contact form), `GOOGLE_API_KEY` (SEV → Google Drive), `MAX_REPORT_DATA_MB`. `.env*` is gitignored; `.env.example` is tracked.
- `next.config.ts` allows images from every HTTPS hostname.
