# AGENTS.md

## Dev Commands

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # Run migrations, seed, then build
npm run lint      # ESLint
```

**Build order matters**: `prisma migrate deploy` → `prisma generate` → `prisma:seed` → `next build`

## Database

- Prisma with PostgreSQL (`DATABASE_URL` env var required)
- Schema at `prisma/schema.prisma`
- Seed script at `prisma/seed.ts`

## Stack

- Next.js 15 (App Router, Turbopack)
- React 19 / TypeScript
- Tailwind CSS 4 (CSS-based config, uses `@midudev/tailwind-animations`)
- Prisma + PostgreSQL
- Radix UI primitives + shadcn/ui pattern (`src/components/ui/`)
- jsPDF for PDF generation
- bcrypt for passwords
- ESLint flat config (`eslint.config.mjs`)

## Project Structure

```
src/app/           # Pages (Next.js App Router)
src/components/    # Shared components
src/components/ui/ # shadcn/ui primitives
src/lib/           # Utilities, Prisma client
prisma/            # Schema + migrations
```

## Key Files

- `src/app/layout.tsx` - Root layout
- `src/lib/prisma.ts` - Prisma client singleton
- `src/middleware.ts` - Auth middleware