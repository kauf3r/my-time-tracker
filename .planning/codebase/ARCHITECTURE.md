# Architecture

**Analysis Date:** 2026-03-01

## Pattern Overview

**Overall:** Client-Server Architecture with Airtable as persistent data store

**Key Characteristics:**
- Next.js App Router (SSR-capable, but frontend uses client-side rendering for forms)
- React for UI state management with hooks (useState, useEffect)
- Airtable as authoritative database (not local storage)
- RESTful API layer between frontend and Airtable
- Single-user focus (environment variable `DEFAULT_USER_ID` baked into API)
- Separation of concerns: UI components, API routes, data access library

## Layers

**Presentation Layer (Frontend):**
- Purpose: Renders UI, handles user input, manages client-side state
- Location: `src/components/` and `src/app/`
- Contains: React components (TimeTrackingApp.jsx, InvoiceGenerator.jsx), pages, layouts
- Depends on: Next.js, React, API routes via fetch()
- Used by: End users visiting the web application

**API Layer (Backend):**
- Purpose: Business logic, validation, data orchestration between frontend and Airtable
- Location: `src/app/api/`
- Contains: Route handlers (time-entries, invoices, test-airtable, debug)
- Depends on: Airtable SDK, date utilities, environment config
- Used by: Frontend components via HTTP requests

**Data Access Layer:**
- Purpose: Encapsulates Airtable SDK and provides normalized interface
- Location: `src/lib/airtable.js`
- Contains: CRUD operations (createTimeEntry, getTimeEntries, updateTimeEntry, deleteTimeEntry)
- Depends on: Airtable SDK, environment variables
- Used by: API routes

**Configuration & Utilities:**
- Purpose: Shared helper functions and path configuration
- Location: `src/lib/utils.ts`, `jsconfig.json`, `tailwind.config.js`
- Contains: Path aliases (@/*), Tailwind CSS setup, utility functions
- Depends on: Tailwind CSS, Next.js
- Used by: All components and pages

## Data Flow

**Time Entry Creation Flow:**

1. User submits form in `TimeTrackingApp.jsx` (client-side component)
2. Form validation happens in component (required fields check)
3. POST request sent to `/api/time-entries` with entry data
4. API route `src/app/api/time-entries/route.js` validates and logs request
5. API calls `createTimeEntry()` from `src/lib/airtable.js`
6. Airtable SDK sends data to Airtable cloud database
7. Response returned with created record ID
8. Frontend receives response, updates local state (`setEntries`), shows success notification
9. Recent entries section re-renders with new entry at top

**Time Entry Retrieval Flow:**

1. Component mounts or user navigates to TimeTrackingApp
2. `useEffect` calls `loadTimeEntries()`
3. GET request sent to `/api/time-entries`
4. API route calls `getTimeEntries()` from `src/lib/airtable.js`
5. Airtable query filters by `user_id` (DEFAULT_USER_ID) and sorts by date descending
6. Response mapped to normalized object format
7. Frontend receives entries array and updates state (`setEntries`)
8. Recent entries section renders all entries

**Invoice Generation Flow:**

1. User navigates to `/invoices` page (loads InvoiceGenerator component)
2. User selects date range and clicks "Fetch Entries"
3. GET request to `/api/invoices/entries?startDate=X&endDate=Y`
4. API route queries Airtable for entries in date range via `getTimeEntriesForPeriod()`
5. API groups entries by month (YYYY-MM key) in memory
6. API calculates totals: hours, days, amount (hours × hourly rate)
7. Response includes: entries array, monthlyGroups array, summary object
8. Frontend renders monthly breakdown and summary metrics
9. User clicks "Download Invoice PDF"
10. POST request to `/api/invoices/generate` with monthlyGroups and invoiceData
11. API generates PDF using react-pdf renderer
12. PDF returned as blob to frontend
13. Frontend triggers browser download

**State Management:**

- **Client state:** Managed with React hooks (useState for forms, entries list, notifications)
- **Server state:** Stored in Airtable (source of truth)
- **Derived state:** Monthly groupings, invoice summaries computed in API routes
- **No global state manager:** Single-user app with simple workflows doesn't require Redux/Zustand
- **Hydration safety:** Uses `suppressHydrationWarning` in layout and checks `isClient` flag in TimeTrackingApp to prevent SSR/client mismatch

## Key Abstractions

**Time Entry Object:**
- Purpose: Represents a single logged work day with hours and metadata
- Examples: Used in TimeTrackingApp.jsx form state, stored in Airtable
- Pattern: POJO (Plain Old JavaScript Object) with fields: date, timeIn, timeOut, hours, description, winOfDay, tomorrowPlan

**API Response Envelope:**
- Purpose: Consistent response format across all API routes
- Examples: `{ entries: [...] }`, `{ entry: {...} }`, `{ error: "...", details: "..." }`
- Pattern: NextResponse.json() with explicit status codes (200, 201, 400, 500)

**Monthly Group:**
- Purpose: Time entries aggregated by calendar month for invoice display
- Examples: { monthName: "January 2026", monthKey: "2026-01", entries: [...], totalHours: 40, totalDays: 5, monthlyAmount: 1000 }
- Pattern: Created in `src/app/api/invoices/entries/route.js` via reduce() grouping

**Invoice Data Summary:**
- Purpose: High-level invoice metrics (totals, rates, period)
- Examples: { totalHours: "160.50", totalAmount: "4012.50", totalDays: 20, hourlyRate: 25, period: "2026-01-01 to 2026-01-31" }
- Pattern: Calculated in API and passed to PDF generator

## Entry Points

**Application Root:**
- Location: `src/app/layout.js`
- Triggers: Browser loads https://my-time-tracker-xxx.vercel.app/
- Responsibilities: Defines HTML structure, imports global CSS, sets metadata, wraps all pages

**Home Page:**
- Location: `src/app/page.js`
- Triggers: User visits `/`
- Responsibilities: Dynamically imports TimeTrackingApp with fallback loader, handles SSR/client hydration

**Invoices Page:**
- Location: `src/app/invoices/page.js`
- Triggers: User visits `/invoices`
- Responsibilities: Imports and renders InvoiceGenerator component

**API: Time Entries:**
- Location: `src/app/api/time-entries/route.js`
- Triggers: GET `/api/time-entries` or POST `/api/time-entries`
- Responsibilities: GET returns user's entries, POST creates new entry with validation

**API: Invoice Entries:**
- Location: `src/app/api/invoices/entries/route.js`
- Triggers: GET `/api/invoices/entries?startDate=X&endDate=Y`
- Responsibilities: Queries Airtable for date range, groups by month, calculates summaries

**API: Invoice Generate:**
- Location: `src/app/api/invoices/generate/route.js`
- Triggers: POST `/api/invoices/generate` with PDF data
- Responsibilities: Renders react-pdf Document, converts to buffer, returns as downloadable PDF

## Error Handling

**Strategy:** Try-catch with logging to console, returns NextResponse with status codes and error messages

**Patterns:**

- **API Layer:** Catches errors from Airtable SDK, logs full error details, returns 500 with user-friendly message
  - Example in `src/app/api/time-entries/route.js` lines 50-55: Logs statusCode, error, stack
- **Frontend:** Catches fetch errors, shows temporary notification (3-second timeout), logs to console
  - Example in `src/components/TimeTrackingApp.jsx` lines 110-112: Sets notification, clears after timeout
- **Airtable Library:** Throws custom Error messages ("Failed to save time entry", "Failed to fetch time entries")
  - Example in `src/lib/airtable.js` lines 41-50: Logs detailed error object, throws generic message

**Error Recovery:**
- No retry logic currently implemented
- User must manually retry failed operations
- Notifications inform user something went wrong but don't expose raw API errors

## Cross-Cutting Concerns

**Logging:**
- Approach: Console.log statements in API routes and components for debugging
- Used for: Request validation, Airtable query details, PDF generation progress
- Examples: `console/log('=== API POST REQUEST RECEIVED ===')` at start of handler

**Validation:**
- Input validation: Component level (TimeTrackingApp checks required fields before submit)
- API level: `src/app/api/time-entries/route.js` re-validates date, timeIn, timeOut, description before Airtable call
- No schema library (Zod, Yup) used; manual if/throw checks

**Authentication:**
- Approach: No user authentication; single-user app protected by environment variables
- DEFAULT_USER_ID hardcoded in `src/lib/airtable.js` or via env var
- Airtable token checked via process.env.AIRTABLE_ACCESS_TOKEN (must be set in .env.local)

**Date Handling:**
- Stored as ISO strings (YYYY-MM-DD) in Airtable Date field
- Time values stored as HH:MM text in Airtable
- Conversions handled in JavaScript: `new Date().toISOString().split('T')[0]` for today
- Timezone: Uses browser local time for display, no explicit UTC handling

**Responsive Design:**
- Approach: Tailwind CSS utility classes with grid breakpoints (md: medium screens)
- Examples: `grid grid-cols-1 md:grid-cols-3` for responsive column layout
- No media query debugging or breakpoint-specific components

---

*Architecture analysis: 2026-03-01*
