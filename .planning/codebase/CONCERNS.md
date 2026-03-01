# Codebase Concerns

**Analysis Date:** 2026-03-01

## Security Issues

**Credentials Exposed in Debug Endpoints:**
- Issue: `/api/test-airtable` and `/api/debug` endpoints expose token prefixes, suffixes, lengths, and base IDs in plain text responses
- Files: `src/app/api/test-airtable/route.js` (lines 13-22, 54-64, 81-90), `src/app/api/debug/route.js` (lines 4-10)
- Impact: Attackers could reconstruct or validate credentials; sensitive infrastructure details visible in responses
- Fix approach: Remove all environment variable introspection from public endpoints. If debugging is needed, restrict to development-only conditions or admin authentication. Consider removing these endpoints entirely for production.

**Missing Authentication on Public Endpoints:**
- Issue: All API endpoints (`/api/time-entries`, `/api/invoices/entries`, `/api/invoices/generate`) lack authentication or authorization checks
- Files: `src/app/api/time-entries/route.js`, `src/app/api/invoices/entries/route.js`, `src/app/api/invoices/generate/route.js`
- Impact: Any user can create, read, or generate invoices for any date range; no user isolation currently enforced
- Fix approach: Add authentication middleware (JWT, session-based, or OAuth) and verify `user_id` matches authenticated user before allowing operations

**Airtable Token as API Key:**
- Issue: Airtable credentials stored directly in environment variables and initialized globally in `src/lib/airtable.js`
- Files: `src/lib/airtable.js` (lines 4-9)
- Impact: Token is embedded in server-side code; if `.env.local` is ever committed or server compromised, full database access is exposed
- Fix approach: Use API keys that can be revoked, implement short-lived tokens where possible, add rate limiting per API endpoint

**SQL Injection Risk in Airtable Formula:**
- Issue: User ID is directly interpolated into Airtable filter formulas without escaping
- Files: `src/lib/airtable.js` (lines 62, 147)
- Impact: Malicious user_id values could potentially break query logic or retrieve unintended data
- Fix approach: Validate and sanitize user_id before use; use parameterized queries if Airtable SDK supports them; whitelist allowed user_id values

## Tech Debt

**Large Component Files:**
- Issue: `TimeTrackingApp.jsx` (294 lines) and `InvoiceGenerator.jsx` (269 lines) contain form logic, state management, API calls, and rendering in single files
- Files: `src/components/TimeTrackingApp.jsx`, `src/components/InvoiceGenerator.jsx`
- Impact: Hard to test, difficult to reuse logic, component becomes harder to maintain as features grow
- Fix approach: Extract form validation into `utils/validation.js`, create custom hooks (`useTimeEntry`, `useInvoiceGeneration`), separate UI into smaller presentational components

**Hydration Issue (Not Yet Visible):**
- Issue: `TimeTrackingApp.jsx` uses `isClient` state workaround (lines 26, 58) to prevent server/client mismatch, but `getDefaultDate()` is called on mount
- Files: `src/components/TimeTrackingApp.jsx` (lines 7-13, 33-35, 58-60)
- Impact: In strict mode or with future React features, this pattern will cause warnings or errors; date initialization is fragile
- Fix approach: Use `useEffect` to set date only after client hydration completes, or use dynamic imports with `ssr: false`

**No Input Validation at API Layer:**
- Issue: API endpoints assume valid data and only check for presence, not format
- Files: `src/app/api/time-entries/route.js` (lines 37-43)
- Impact: Invalid times (e.g., `25:99`), malformed dates, or negative hours can be saved to database unchecked
- Fix approach: Create validation schema (use Zod or Yup); validate date format (YYYY-MM-DD), time format (HH:mm), hours are positive numbers

**Inconsistent Error Handling:**
- Issue: Some endpoints return generic error messages (`Failed to save time entry`), others include full error details; no centralized error handling
- Files: `src/lib/airtable.js` (lines 42-50), `src/app/api/time-entries/route.js` (lines 50-60)
- Impact: Production errors expose stack traces to clients; inconsistent logging makes debugging harder
- Fix approach: Create centralized error handler in `lib/errors.js` that sanitizes messages for client, logs full details server-side

**Hard-Coded Defaults:**
- Issue: Default values scattered throughout code: `DEFAULT_USER_ID = 'andy'`, default hourly rate `25`, business name defaults
- Files: `src/lib/airtable.js` (line 12), `src/app/api/invoices/entries/route.js` (line 53), `src/app/api/invoices/generate/route.js` (line 262)
- Impact: App is tightly coupled to specific user/business; difficult to support multiple users or tenants
- Fix approach: Create `lib/config.js` with environment variable validation; throw early if critical values are missing

## Performance Bottlenecks

**Inefficient Date Range Calculation:**
- Issue: `InvoiceGenerator.jsx` uses `useState` with side effect in initializer (line 32-35) which doesn't properly initialize on first render
- Files: `src/components/InvoiceGenerator.jsx` (lines 32-35)
- Impact: Default dates may be empty until user interacts with component, breaking invoice flow
- Fix approach: Move default date calculation into separate `useEffect` hook, or calculate in API endpoint server-side

**No Pagination for Invoice Entries:**
- Issue: All entries for a date range are loaded into memory and displayed in scrollable div (line 228 max-height with overflow)
- Files: `src/components/InvoiceGenerator.jsx` (line 228), `src/app/api/invoices/entries/route.js`
- Impact: Loading 1000+ entries causes UI lag and high memory usage
- Fix approach: Implement pagination (fetch 50 entries per page) or virtual scrolling using `react-window`

**Repeated PDF Calculation:**
- Issue: Invoice amounts recalculated in both frontend display (`InvoiceGenerator.jsx` line 254) and PDF generation (`route.js` line 204)
- Files: `src/components/InvoiceGenerator.jsx`, `src/app/api/invoices/generate/route.js`
- Impact: If hourly rate changes between fetch and PDF generation, amounts will diverge
- Fix approach: Calculate totals server-side once, pass to frontend and PDF generator

## Fragile Areas

**Date Handling Across Timezones:**
- Issue: Airtable date fields store dates without timezone info; browser `toISOString()` returns UTC but local date input is assumed local time
- Files: `src/components/TimeTrackingApp.jsx` (lines 7-9), `src/components/InvoiceGenerator.jsx` (lines 20-28)
- Impact: Users in different timezones will see shifted dates; invoice date ranges may be off by a day
- Fix approach: Explicitly use `YYYY-MM-DD` format relative to user timezone; store timezone in entries; validate dates are in expected range before saving

**Time Calculation Edge Cases:**
- Issue: `calculateHours()` assumes times wrap at midnight (line 69 adds 24 hours) but doesn't validate times make sense
- Files: `src/components/TimeTrackingApp.jsx` (lines 62-72)
- Impact: `timeIn: 18:00, timeOut: 06:00` next day works, but `timeIn: 23:59, timeOut: 23:58` same day silently breaks (results in 23.98 hours)
- Fix approach: Validate timeOut > timeIn or explicitly flag overnight shifts; document expected behavior

**Missing Field Validation in Airtable:**
- Issue: `getTimeEntries()` assumes all fields exist on returned records (lines 68-80); if field is missing, returns undefined instead of failing safely
- Files: `src/lib/airtable.js` (lines 67-80)
- Impact: If Airtable schema changes (field deleted/renamed), app silently returns corrupt data
- Fix approach: Validate record structure before returning; throw descriptive error if expected fields missing

**Race Condition in Invoice Generation:**
- Issue: Frontend fetches entries, user manually selects dates, generates PDF with stale data
- Files: `src/components/InvoiceGenerator.jsx` (lines 66-109)
- Impact: If time entries are created during fetch → PDF generation window, PDF won't include those entries
- Fix approach: Pass original query parameters to PDF endpoint, have it re-query instead of trusting client data

## Missing Critical Features

**No Way to Edit or Delete Entries:**
- Problem: Entries shown in UI but no edit/delete buttons despite update/delete functions existing in `airtable.js`
- Blocks: Users cannot fix typos or remove duplicate entries
- Files: `src/components/TimeTrackingApp.jsx` (line 264-280), `src/lib/airtable.js` (lines 93-133)
- Impact: Medium - users must manually fix entries in Airtable; reduces trust in app

**No Email Automation:**
- Problem: Invoice generated and downloaded but not emailed to client
- Blocks: Manual workflow step remains (user must attach and send email)
- Files: Entire email system missing
- Impact: High - defeats purpose of automation; invoice generation incomplete

**No Monthly Auto-Invoice:**
- Problem: User must manually visit invoices page to generate monthly invoices
- Blocks: Easy workflow automation
- Files: No scheduled task infrastructure
- Impact: Medium - increases chance of invoices being forgotten

**No Rate Card or Item Details:**
- Problem: All time billed at single hourly rate, no way to track different project rates or fixed-price items
- Blocks: Complex invoicing scenarios
- Files: N/A - architecture limitation
- Impact: Low - acceptable for current single-client use case

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: `calculateHours()` function, date calculations, invoice summarization logic, Airtable error handling
- Files: `src/components/TimeTrackingApp.jsx` (lines 62-72), `src/lib/airtable.js`, `src/app/api/invoices/entries/route.js`
- Risk: Edge cases like midnight wrap, invalid times, or floating-point rounding errors will go unnoticed until user encounters them
- Priority: High

**No Integration Tests:**
- What's not tested: End-to-end flow from time entry through invoice generation; API contract with Airtable
- Files: All API routes, Airtable integration
- Risk: Breaking changes in Airtable SDK, API contract violations, or data corruption go undetected
- Priority: Medium

**No Error Scenario Testing:**
- What's not tested: Network failures, Airtable token expiration, invalid environment variables, malformed request data
- Files: All API routes and library functions
- Risk: App crashes with unhelpful errors in production; users see raw stack traces
- Priority: High

## Dependency Risks

**Airtable SDK Version:**
- Risk: Using `airtable@0.12.2` (released 2024), older versions may have security issues
- Current status: Working but not audited for vulnerabilities
- Migration plan: Run `npm audit`, update to latest stable version, test thoroughly before deploying

**React PDF Renderer Limitations:**
- Risk: `@react-pdf/renderer@4.3.0` is maintained but has known limitations with complex layouts
- Current status: Basic invoice layout works fine
- Migration plan: If invoice design becomes complex (images, complex tables), consider switching to `pdfkit` or server-side rendering

**Next.js 15.0.4 Server Actions:**
- Risk: Using Next.js 15 which recently introduced major changes; API route code may need updates for future versions
- Current status: Works but uses legacy patterns
- Migration plan: Monitor Next.js releases; evaluate migration to Server Actions when stable

## Data Consistency Risks

**Floating-Point Arithmetic:**
- Issue: Hours stored as floats (e.g., `2.5`), multiplied by hourly rate multiple times (`entry.hours * rate`, then again in PDF)
- Files: `src/app/api/invoices/generate/route.js` (line 204), `src/components/InvoiceGenerator.jsx` (line 254)
- Impact: Rounding errors accumulate (2.5 * 25 = 62.5, but `toFixed(2)` on floats can cause drift)
- Fix approach: Use integers (e.g., store minutes instead of hours, calculate as cents to avoid decimals)

**No Audit Trail:**
- Issue: No record of when entries were created, updated, or deleted; no way to recover deleted entries
- Files: Airtable integration doesn't use audit fields
- Impact: If user deletes entry by mistake or dispute about invoice amounts, no history to reference
- Fix approach: Add `created_at`, `updated_at`, `deleted_at` fields; optionally maintain audit log table

---

*Concerns audit: 2026-03-01*
