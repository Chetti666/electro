# AGENTS.md

## Dev Commands

```bash
npm run dev         # Turbopack dev server at http://localhost:3000
npm run build       # prisma migrate deploy → generate → seed → next build (order matters)
npm run lint        # ESLint (flat config, next/core-web-vitals + next/typescript)
npx tsc --noEmit    # TypeScript check (no npm script exists)
npm run seed        # ts-node -P prisma/tsconfig.json prisma/seed.ts
```

## Stack

- **Next.js 15.5.7** (App Router, Turbopack) · **React 19.1.0** · **TypeScript 5**
- **Tailwind v4** via `@tailwindcss/postcss` — config in `src/app/globals.css` (`@import "tailwindcss"` + `@theme inline`); `tailwind.config.ts` is a stale v3 leftover
- **Prisma + PostgreSQL** with Accelerate (`@prisma/extension-accelerate`). Env: `DATABASE_URL` (direct) + `PRISMA_DATABASE_URL` (Accelerate)
- **Auth**: base64-encoded JSON in `session_token` cookie (NOT JWT). `requireAdmin()` throws on non-admin.
- **Admin routes**: protected server-side by `AdminLayout` redirect (`src/app/admin/layout.tsx`), NOT by middleware
- **motion** v12 (library formerly known as Framer Motion) + `@midudev/tailwind-animations` + `tw-animate-css`
- **shadcn/ui**: new-york style, custom registry `@animate-ui`
- **Spanish** app (`lang="es"`, `es_CL` locale) — Chilean electrical engineering tooling
- **Contexto.md** contains product/domain requirements (Spanish)

## Project Structure

```
src/
  app/              # App Router pages
    calculadoras/    # 6 electrical calculators
    informes/        # 3 report generators (PDF via jsPDF)
    admin/           # Panel (articles, categories, metrics)
    api/             # auth, articles, categories, users, visits, upload, contact
  components/
    animate-ui/      # @animate-ui registry components
    ui/              # shadcn/ui primitives
  lib/               # auth.ts, prisma.ts, metrics.ts, slugify.ts, utils.ts
  middleware.ts      # Only protects /signup (redirects to /login)
prisma/
  schema.prisma      # User, Article, Category, SiteMetric, RouteMetric
  seed.ts            # Creates admin@example.com / admin-password (ADMIN role)
```

## Gotchas

- **Middleware only protects `/signup`** — other routes are public. Admin routes are protected by AdminLayout server-side redirect, not middleware.
- **Seed** requires `ts-node -P prisma/tsconfig.json` (custom tsconfig with `module: commonjs`). `prisma/` is excluded from root `tsconfig.json`.
- **Build requires live PostgreSQL** (`DATABASE_URL`). `next build` runs `prisma migrate deploy` (not `dev`), generate, seed, then build.
- **No tests** exist — no test framework in dependencies or scripts.
- **Key env vars**: `DATABASE_URL`, `PRISMA_DATABASE_URL`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`. `.env*` files are gitignored.
- **Next.js images**: `remotePatterns` allows all hostnames (`https://**`).
- **Styling utility classes** defined in `globals.css`: `.btn`, `.card`, `.form-input`, `.badge`, `.glass-panel`, `.section-title`, `.page-container`.
