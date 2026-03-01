# Technology Stack

**Analysis Date:** 2026-03-01

## Languages

**Primary:**
- JavaScript (Node.js) - Server-side API routes and build scripts
- JSX - React components in `src/components/`
- TypeScript - Optional, used for utility types in `src/lib/utils.ts`

**Secondary:**
- CSS - Styled via Tailwind CSS utilities

## Runtime

**Environment:**
- Node.js (version not specified in `.nvmrc` - uses system Node or Vercel default)

**Package Manager:**
- npm
- Lockfile: Not committed (only `package.json` tracked)

## Frameworks

**Core:**
- **Next.js** 15.0.4 - Full-stack React framework with App Router
- **React** 19.0.0 - UI component library
- **React DOM** 19.0.0 - DOM rendering

**Styling:**
- **Tailwind CSS** 3.4.1 - Utility-first CSS framework
- **PostCSS** 8 - CSS transformation (configured in `postcss.config.mjs`)
- **tailwindcss-animate** 1.0.7 - Animation utilities for Tailwind

**UI Component Libraries:**
- **shadcn/ui** 0.2.3 - Pre-built component library (includes Button, Input, Card, Alert, Textarea)
- **Radix UI** (multiple packages):
  - `@radix-ui/react-alert-dialog` 1.1.2 - Dialog/modal component primitives
  - `@radix-ui/react-icons` 1.3.2 - Icon set
  - `@radix-ui/react-slot` 1.1.0 - Component composition utility

**Icon Library:**
- **lucide-react** 0.468.0 - Icon set with React components

**PDF Generation:**
- **@react-pdf/renderer** 4.3.0 - Server-side PDF generation for invoice PDFs

**Utility Libraries:**
- **clsx** 2.1.1 - Conditional className utility
- **tailwind-merge** 2.5.5 - Merges Tailwind classes intelligently
- **class-variance-authority** 0.7.1 - Component variant management

## Key Dependencies

**Critical:**
- **airtable** 0.12.2 - Official Airtable JavaScript SDK for database CRUD operations
  - Used in `src/lib/airtable.js` for all data persistence
  - Manages time entry records, queries, and updates

## Configuration

**Environment:**
- Configuration via `.env.local` file (not committed to git for security)
- Environment variables loaded automatically by Next.js
- Required env vars for Airtable, business info, and hourly rate (see INTEGRATIONS.md)

**Build:**
- Next.js App Router configuration: `next.config.mjs` (minimal, using defaults)
- PostCSS config: `postcss.config.mjs` (Tailwind integration)
- Tailwind config: `tailwind.config.js` (custom theme, dark mode support via class)
- Path aliases: `jsconfig.json` maps `@/*` to `./src/*`

**Linting:**
- ESLint 8 - Code quality checking
- eslint-config-next 15.0.4 - Next.js-specific ESLint rules
- Config: `.eslintrc.json` extends `next/core-web-vitals`
- Run with: `npm run lint`

## Platform Requirements

**Development:**
- Node.js (any modern version, tested with system Node)
- npm package manager
- Modern browser with ES2020+ support

**Production:**
- Deployment platform: Vercel (indicated in CLAUDE.md)
- Requires environment variables to be set in Vercel dashboard
- No database server needed (uses Airtable cloud)

---

*Stack analysis: 2026-03-01*
