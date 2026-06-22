# AGENTS.md

## Dev Commands

```bash
npm run dev         # Turbopack dev server at http://localhost:3000
npm run build       # migrate deploy → generate → seed → next build (order matters)
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript check (no npm script exists)
```

## Stack Key Facts

- **Next.js 15** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind v4** via `@tailwindcss/postcss` — config is in `src/app/globals.css` (`@import "tailwindcss"` + `@theme inline`); `tailwind.config.ts` is a stale v3 leftover
- **Prisma + PostgreSQL** with Prisma Accelerate (`@prisma/extension-accelerate`). Env: `DATABASE_URL` (direct) + `PRISMA_DATABASE_URL` (Accelerate)
- **Auth**: base64-encoded JSON in `session_token` cookie (NOT JWT). Password hashing via bcrypt. `requireAdmin()` throws on non-admin.
- **Styling**: `.btn`, `.card`, `.form-input`, `.badge`, `.glass-panel`, `.section-title`, `.page-container` utility classes in globals.css
- **Animations**: `motion` (v12, the library formerly known as Framer Motion) + `@midudev/tailwind-animations` plugin
- **PWA**: manifest.json, apple-web-app meta, `viewport-fit=cover` — mobile-first
- **Analytics**: Google Analytics via `@next/third-parties` (GA4 ID: `G-K79465K2BD`)
- **PDF**: jsPDF + jspdf-autotable for report generation
- **Rich text**: Tiptap with Image, Link, Placeholder extensions
- **Email**: Nodemailer with Gmail SMTP (credentials in `.env`)
- **shadcn/ui**: new-york style, `@/components/ui/`, lucide-react icons. Custom registry: `@animate-ui`
- **Spanish** app (`lang="es"`, `es_CL` locale) — Chilean electrical engineering tooling

## Project Structure

```
src/
  app/              # App Router pages
    blog/[slug]/     # Blog article page
    calculadoras/    # Electrical calculators (6 sub-pages)
    informes/        # Report generators (4 sub-pages)
    admin/           # Admin panel (articles, categories)
    api/             # API routes (articles, auth, categories, contact, upload, users, visits)
  components/        # Shared React components
  components/ui/     # shadcn/ui primitives
  lib/               # Utilities, Prisma client singleton, auth helpers
prisma/
  schema.prisma      # User, Article, Category, SiteMetric models
  seed.ts            # Creates admin@example.com / admin-password (ADMIN role)
```

## Gotchas

- **Middleware only protects `/signup`** (redirects to `/login`). Other routes are public.
- **Seed** runs via `ts-node -P prisma/tsconfig.json prisma/seed.ts` (custom tsconfig needed for module resolution).
- **`.env` / `.env.local` contain secrets** (DB, SMTP) and are gitignored. Never commit.
- **Build requires live PostgreSQL** (`DATABASE_URL` env var). `next build` runs migrations + seed.
- `prisma/` is excluded from the root `tsconfig.json` — the seed script uses `prisma/tsconfig.json` which extends root with `commonjs` module.
