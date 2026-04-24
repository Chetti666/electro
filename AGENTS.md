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
- Framer Motion for animations
- Chart.js for graphs

## Project Structure

```
src/app/           # Pages (Next.js App Router)
src/components/    # Shared components
src/components/ui/ # shadcn/ui primitives
src/lib/           # Utilities, Prisma client
prisma/            # Schema + migrations
```

## Styling (Neon Theme)

The app uses a **neon retro-futuristic theme**:
- **Fonts**: Orbitron (display/titles), Rajdhani (body)
- **Colors**: Dark background (#030712), neon cyan/magenta/pink accents
- **Effects**: Glow shadows, text-shadow, grid background pattern
- **CSS in**: `src/app/globals.css` - defines all neon variables and animations

## Key Files

- `src/app/layout.tsx` - Root layout with fonts
- `src/lib/prisma.ts` - Prisma client singleton
- `src/middleware.ts` - Auth middleware
- `src/app/globals.css` - Tailwind + neon theme CSS

## Auth

- Users stored in PostgreSQL via Prisma
- Passwords hashed with bcrypt
- Login API: `src/app/api/auth/login/route.ts`
- Session via cookies (middleware protects routes)