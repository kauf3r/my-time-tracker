# Codebase Structure

**Analysis Date:** 2026-03-01

## Directory Layout

```
my-time-tracker/
├── public/                    # Static assets (images, icons)
├── src/
│   ├── app/
│   │   ├── api/              # API route handlers (Next.js App Router)
│   │   │   ├── time-entries/
│   │   │   ├── invoices/
│   │   │   ├── test-airtable/
│   │   │   └── debug/
│   │   ├── invoices/
│   │   ├── test/
│   │   ├── page.js           # Home page (/)
│   │   ├── layout.js         # Root layout wrapper
│   │   └── globals.css       # Global Tailwind styles
│   ├── components/
│   │   ├── TimeTrackingApp.jsx      # Main time tracker UI
│   │   ├── InvoiceGenerator.jsx     # Invoice generation UI
│   │   └── ui/                      # shadcn/ui components
│   └── lib/
│       ├── airtable.js             # Airtable SDK wrapper and CRUD
│       └── utils.ts                # Shared utilities
├── .env.local                 # Local environment variables (secret)
├── .eslintrc.json             # ESLint config
├── jsconfig.json              # Path aliases (@/*)
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.mjs         # PostCSS config (for Tailwind)
├── next.config.mjs            # Next.js config
├── package.json               # Dependencies and scripts
└── vercel.json                # Vercel deployment config
```

## Directory Purposes

**`public/`:**
- Purpose: Static files served directly by Next.js (images, favicons, robots.txt)
- Contains: Any assets referenced in HTML without processing
- Key files: None currently committed; reserved for public assets

**`src/app/`:**
- Purpose: Next.js App Router structure (page routes and API routes)
- Contains: Page components, layout files, API handlers organized by route
- Key files:
  - `src/app/page.js`: Home page entry point
  - `src/app/layout.js`: Root HTML wrapper
  - `src/app/globals.css`: Global Tailwind imports

**`src/app/api/`:**
- Purpose: Server-side API endpoints (App Router route handlers)
- Contains: POST/GET handlers for time entries, invoices, debugging
- Organization: One route per subdirectory with `route.js` file

**`src/app/api/time-entries/`:**
- Purpose: CRUD operations for time entry records
- Key file: `src/app/api/time-entries/route.js`
- Endpoints:
  - GET: Fetch all entries for current user
  - POST: Create new time entry with validation

**`src/app/api/invoices/entries/`:**
- Purpose: Query time entries for date range and group by month
- Key file: `src/app/api/invoices/entries/route.js`
- Endpoints:
  - GET: Fetch entries for period, returns grouped + summarized data

**`src/app/api/invoices/generate/`:**
- Purpose: Generate PDF invoice from monthly grouped data
- Key file: `src/app/api/invoices/generate/route.js`
- Endpoints:
  - POST: Accept monthlyGroups and invoiceData, return PDF blob

**`src/app/invoices/`:**
- Purpose: Invoice page route
- Key file: `src/app/invoices/page.js`
- Renders: InvoiceGenerator component

**`src/app/test/`:**
- Purpose: Test/debug page (not part of main flow)
- Key file: `src/app/test/page.js`
- Usage: Ad-hoc testing during development

**`src/components/`:**
- Purpose: Reusable React components (UI building blocks)
- Contains: Functional components, UI library wrappers
- Key files:
  - `src/components/TimeTrackingApp.jsx`: Main form and entries list
  - `src/components/InvoiceGenerator.jsx`: Invoice preview and PDF download
  - `src/components/ui/`: shadcn/ui components (button, card, input, textarea, alert)

**`src/lib/`:**
- Purpose: Shared libraries and utilities
- Key files:
  - `src/lib/airtable.js`: Airtable SDK wrapper with CRUD functions
  - `src/lib/utils.ts`: Tailwind classname utilities (clsx, tailwind-merge)

## Key File Locations

**Entry Points:**

- `src/app/page.js`: Home route, dynamically imports TimeTrackingApp
- `src/app/layout.js`: Root HTML structure, global CSS import
- `src/app/invoices/page.js`: Invoice page route

**Configuration:**

- `jsconfig.json`: Path alias `@/*` → `./src/*`
- `next.config.mjs`: Minimal Next.js config (no special features enabled)
- `tailwind.config.js`: Tailwind theme, dark mode, plugins
- `postcss.config.mjs`: PostCSS setup for Tailwind
- `.env.local`: Runtime env vars (Airtable token, base ID, business info)

**Core Logic:**

- `src/lib/airtable.js`: All Airtable operations (createTimeEntry, getTimeEntries, getTimeEntriesForPeriod, updateTimeEntry, deleteTimeEntry)
- `src/app/api/time-entries/route.js`: Time entry CRUD endpoint
- `src/app/api/invoices/entries/route.js`: Invoice data aggregation
- `src/app/api/invoices/generate/route.js`: PDF generation

**Presentation:**

- `src/components/TimeTrackingApp.jsx`: Time tracking form UI (lines 1-295)
- `src/components/InvoiceGenerator.jsx`: Invoice UI (lines 1-270)
- `src/components/ui/*`: shadcn/ui primitive components

**Styling:**

- `src/app/globals.css`: Global styles and Tailwind directives
- `tailwind.config.js`: Color theme, spacing, animations
- Components use Tailwind utility classes inline (no separate CSS files)

## Naming Conventions

**Files:**

- Page components: `page.js` (Next.js convention)
- API route handlers: `route.js` (Next.js convention)
- UI Components: PascalCase with .jsx extension (e.g., `TimeTrackingApp.jsx`, `InvoiceGenerator.jsx`)
- Utilities: camelCase with .js or .ts extension (e.g., `airtable.js`, `utils.ts`)
- Directories: kebab-case for API routes (e.g., `time-entries/`, `invoices/`, `test-airtable/`)

**Directories:**

- API routes grouped under `src/app/api/`
- Feature-specific routes: `src/app/[feature]/`
- Components: `src/components/[ComponentName]/` or flat in `src/components/`
- Utilities: `src/lib/`
- Styles: Co-located with components or in `src/app/globals.css`

**Variables & Functions:**

- React state: camelCase (e.g., `currentEntry`, `dateRange`, `isLoading`)
- Functions: camelCase (e.g., `calculateHours()`, `handleSubmit()`, `fetchEntriesForPeriod()`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_USER_ID`)
- Airtable field names: Title Case with spaces (e.g., "Time In", "Time Out", "Date", "Entry ID")

## Where to Add New Code

**New Feature (Time Tracking Related):**
- Primary code: `src/components/TimeTrackingApp.jsx` (if UI) or `src/app/api/time-entries/route.js` (if API)
- Tests: Create `src/components/TimeTrackingApp.test.jsx` or `src/app/api/time-entries.test.js`
- Data access: Update `src/lib/airtable.js` with new CRUD functions as needed
- Styles: Use Tailwind classes inline in JSX; avoid separate CSS files

**New Component/Module:**
- Implementation: `src/components/[ComponentName].jsx` for UI
- Use case: Invoice display, settings form, data visualization
- Export: Default export (e.g., `export default InvoiceGenerator`)
- Import: Use path alias `import ComponentName from '@/components/ComponentName'`

**New API Endpoint:**
- Directory: `src/app/api/[route-name]/route.js`
- Pattern: Export named functions for GET, POST, PUT, DELETE as needed
- Data access: Import from `src/lib/airtable.js`
- Response: Use `NextResponse.json()` with explicit status codes

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (for styling utilities like clsx)
- Business logic: `src/lib/airtable.js` (for data operations)
- Calculations: Can live in components or dedicated utility module depending on scope

**Environment Configuration:**
- Runtime variables: Add to `CLAUDE.md` documentation and `.env.local`
- Build-time constants: Add to `next.config.mjs` if needed
- Secrets: Never commit `.env.local`, only set in Vercel project settings

## Special Directories

**`src/app/api/test-airtable/` and `src/app/api/debug/`:**
- Purpose: Debug and troubleshooting endpoints for development
- Generated: No (committed to repo)
- Committed: Yes (for ongoing debugging)
- Usage: `/api/test-airtable` checks Airtable connection, `/api/debug` logs environment info
- Note: Consider removing for production if not needed

**`.next/`:**
- Purpose: Next.js build output directory
- Generated: Yes (created during `npm run build`)
- Committed: No (in .gitignore)
- Usage: Contains compiled pages, static assets, server functions

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (created by `npm install`)
- Committed: No (in .gitignore)
- Usage: All third-party packages (React, Next.js, Airtable SDK, Tailwind, etc.)

**`.planning/`:**
- Purpose: GSD workflow planning and analysis documents
- Generated: Yes (created during phase planning)
- Committed: Typically yes (for team reference)
- Usage: Stores ARCHITECTURE.md, STRUCTURE.md, CONCERNS.md, etc.

---

*Structure analysis: 2026-03-01*
