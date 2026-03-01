# Coding Conventions

**Analysis Date:** 2026-03-01

## Naming Patterns

**Files:**
- React components: PascalCase with `.jsx` extension (e.g., `TimeTrackingApp.jsx`, `InvoiceGenerator.jsx`)
- Utility files: camelCase with descriptive names (e.g., `airtable.js`, `utils.ts`)
- API routes: kebab-case directory structure following Next.js App Router pattern (e.g., `/api/time-entries/route.js`)
- TypeScript utility: `utils.ts` (type-specific utilities)

**Functions:**
- Component functions: PascalCase (React convention)
- Utility functions: camelCase (e.g., `calculateHours`, `getTimeEntries`, `createTimeEntry`)
- Handler functions: `handle` + Action pattern (e.g., `handleSubmit`, `handleTimeChange`)
- Helper functions in lib: descriptive verb-noun pattern (e.g., `getDefaultDate`, `getTimeEntriesForPeriod`)

**Variables:**
- State variables: camelCase (e.g., `currentEntry`, `dateRange`, `isLoading`)
- Boolean flags: prefix with `is` or `has` (e.g., `isClient`, `isSubmitting`, `isLoading`)
- Constants: camelCase (lowercase, e.g., `defaultEntry`)
- Object properties: camelCase (e.g., `dateRange.startDate`, `entry.timeIn`)

**Types:**
- React component imports use PascalCase
- Airtable field names: Title Case with spaces in code comments and field mappings (e.g., `'Date'`, `'Time In'`, `'Description'`)
- Environment variables: SCREAMING_SNAKE_CASE (e.g., `AIRTABLE_ACCESS_TOKEN`, `BUSINESS_NAME`)

## Code Style

**Formatting:**
- No explicit Prettier or formatting config detected
- Observed style: 2-space indentation (standard for JavaScript/React)
- Trailing commas in objects: used inconsistently (no strict rule)
- Single quotes not enforced (mix of single/double quotes observed)
- Line length: no hard limit detected, but component code stays reasonable

**Linting:**
- ESLint: configured with Next.js core web vitals
- Config file: `.eslintrc.json` extends `next/core-web-vitals`
- No custom rules detected beyond Next.js defaults
- Lint command: `npm run lint`

## Import Organization

**Order:**
1. Third-party libraries first (React, Next.js imports)
2. External packages (lucide-react icons, @radix-ui)
3. Local imports (relative paths or alias paths starting with `@/`)

**Path Aliases:**
- `@/` maps to `src/` directory
- Used consistently in imports: `import { createTimeEntry } from '@/lib/airtable'`
- Components imported relative: `import TimeTrackingApp from '../components/TimeTrackingApp'` or via dynamic import

**Examples from codebase:**
```javascript
// From TimeTrackingApp.jsx
import { useState, useEffect } from 'react';
import { Bell, Clock, Trophy, CalendarClock, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
```

```javascript
// From time-entries/route.js
import { NextResponse } from 'next/server';
import { createTimeEntry, getTimeEntries } from '@/lib/airtable';
```

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations (especially Airtable calls and fetch requests)
- Errors logged to console with context: `console.error('Error context:', error)`
- Airtable errors: detailed logging with error properties (message, statusCode, error object, stack)
- User-facing errors: simplified messages through notifications (e.g., `'Failed to save entry'`)
- Error details included in API responses for debugging: `{ error: 'message', details: error.message }`
- No custom error classes; generic Error thrown with descriptive messages

**Example pattern from `airtable.js`:**
```javascript
catch (error) {
  console.error('Detailed Airtable error:', {
    message: error.message,
    statusCode: error.statusCode,
    error: error.error,
    stack: error.stack,
    fullError: error
  });
  throw new Error('Failed to save time entry');
}
```

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- `console.error()`: for errors and failure scenarios
- `console.log()`: for informational messages and debugging context
- Grouped logging: section headers like `console.log('=== API POST REQUEST RECEIVED ===')`
- Context logging: include relevant data in log messages (field validation failures, request bodies, environment checks)
- Environment checks logged at API entry points with prefixes/sanitized values

**Example from API routes:**
```javascript
console.log('=== API POST REQUEST RECEIVED ===');
console.log('Request body:', body);
console.log('Environment check:', {
  hasAccessToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
  tokenLength: process.env.AIRTABLE_ACCESS_TOKEN?.length,
  tableName: process.env.AIRTABLE_TABLE_NAME || 'Time Entries',
});
```

## Comments

**When to Comment:**
- JSDoc comments for exported functions (observed in `airtable.js`)
- Inline comments for non-obvious logic (e.g., time calculation edge case: `if (totalMinutes < 0) totalMinutes += 24 * 60;`)
- Section headers for major blocks within components (not extensively used)

**JSDoc/TSDoc:**
- Observed pattern: Brief description, `@param` and `@returns` tags
- Example from `airtable.js`:
```javascript
/**
 * Create a new time entry in Airtable
 * @param {Object} entry - Time entry data
 * @returns {Promise<Object>} Created record
 */
export async function createTimeEntry(entry) { ... }
```

## Function Design

**Size:**
- Most functions: 10-50 lines (reasonable, focused scope)
- Component functions: 50-200+ lines (complex state management, JSX rendering)
- Helper functions in lib: 10-30 lines (single responsibility)

**Parameters:**
- Functions accept simple objects when dealing with multiple related values (e.g., `entry` object, `updates` object)
- Destructuring used sparingly (observed mainly in route handlers: `const { searchParams } = new URL(request.url)`)
- Default parameters for optional values (e.g., `userId = DEFAULT_USER_ID`)

**Return Values:**
- Async functions return Promises with structured data (API responses return `{ entries: [...] }`)
- Components return JSX without explicit returns (implicit in function body)
- Utility functions return primitives, objects, or arrays depending on purpose

## Module Design

**Exports:**
- Named exports preferred for utilities: `export async function createTimeEntry(entry) { ... }`
- Default exports for React components: `export default TimeTrackingApp`
- API routes export named functions: `export async function GET() { ... }`, `export async function POST(request) { ... }`

**Barrel Files:**
- Not observed in this codebase
- Imports go directly to source files (e.g., `@/lib/airtable`, `@/components/TimeTrackingApp`)

## Framework-Specific Patterns

**Next.js 15:**
- App Router used (files in `src/app/` directory)
- Dynamic imports for client components in server contexts: `const TimeTrackingApp = dynamic(() => import(...), { ssr: false, loading: () => (...) })`
- API routes via `route.js` files with `NextResponse`
- Layout hierarchy: `layout.js` wraps all pages

**React 19:**
- Hooks: `useState`, `useEffect` standard usage
- Client components marked with `'use client'` directive
- No TypeScript in components (JSX files, not TSX)

**Tailwind CSS:**
- Utility-first approach: classes inline in JSX (e.g., `className="max-w-4xl mx-auto p-4 space-y-6"`)
- Responsive prefixes: `md:` for medium breakpoints (e.g., `md:grid-cols-3`, `md:w-auto`)
- Color scale: uses standard Tailwind colors (blue, green, gray, red)
- Spacing: consistent use of Tailwind spacing scale (p-2, p-4, p-6, gap-2, etc.)

---

*Convention analysis: 2026-03-01*
