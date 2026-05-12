# AGENTS.md

## Dev Commands

```bash
npm run dev       # Start dev server on http://localhost:3000 (Turbopack)
npm run build     # Run migrations, seed, then build
npm run lint      # ESLint
```

**Build order matters** (in package.json scripts):
1. `prisma migrate deploy`
2. `prisma generate`
3. `npm run prisma:seed`
4. `next build`

**No typecheck script** - Run `npx tsc --noEmit` manually if needed.

## Database

- Prisma with PostgreSQL - **`DATABASE_URL` env var required**
- Schema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts` (uses bcrypt)

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
- Tiptap for rich text editing

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
- Session via `session_token` cookie (middleware redirects unauthenticated /signup to /login)