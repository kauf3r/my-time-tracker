# External Integrations

**Analysis Date:** 2026-03-01

## APIs & External Services

**Time Entry Storage & Querying:**
- **Airtable** - Cloud database for all time entry records
  - SDK/Client: `airtable` 0.12.2 npm package
  - Implementation: `src/lib/airtable.js` exports CRUD functions
  - Auth: `AIRTABLE_ACCESS_TOKEN` environment variable (PAT token starting with `pat`)

**PDF Invoice Generation:**
- No external service - handled locally via `@react-pdf/renderer`
- PDFs generated server-side at `src/app/api/invoices/generate/route.js`
- Output: In-memory buffer downloaded as attachment

## Data Storage

**Databases:**
- **Airtable** (cloud-based)
  - Connection: Authenticated via `AIRTABLE_ACCESS_TOKEN` (Personal Access Token)
  - Base ID: `AIRTABLE_BASE_ID` environment variable
  - Table ID: `AIRTABLE_TABLE_NAME` environment variable (must use table ID like `tblyWU7ZpduMa4Xl3`, not table name)
  - Client: Official `airtable` npm package
  - Operations: All handled in `src/lib/airtable.js`

**Airtable Fields Required:**
- `Date` (Date field)
- `Time In` (Single line text)
- `Time Out` (Single line text)
- `Hours` (Number field - calculated by app)
- `Description` (Long text)
- `Win of Day` (Long text, optional)
- `Tomorrow Plan` (Long text, optional)
- `Entry ID` (Single line text, auto-generated)
- `user_id` (Single line text, defaults to 'andy')
- `created_at` (optional, Airtable auto-field)
- `updated_at` (optional, Airtable auto-field)

**File Storage:**
- Local filesystem only - no cloud file storage
- PDFs generated in-memory, sent as HTTP response attachments

**Caching:**
- None - Every fetch queries Airtable directly
- No Redis, Memcached, or session storage

## Authentication & Identity

**Auth Provider:**
- No user authentication - Single-user application (hardcoded `user_id: 'andy'`)
- Airtable integration uses Personal Access Token (not OAuth)
- All entries filtered by `user_id` field for potential multi-user expansion

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry, Datadog, or similar service
- Errors logged to `console.error()` with detailed context

**Logs:**
- Console-based logging to stdout/stderr
- Development: visible in terminal running `npm run dev`
- Production (Vercel): visible in Vercel function logs dashboard

## CI/CD & Deployment

**Hosting:**
- **Vercel** - Next.js hosting platform
- Deployed URL: `https://my-time-tracker-4px4tc1ba-andy-kaufmans-projects.vercel.app/`

**CI Pipeline:**
- None detected - Direct git push to deploy (standard Vercel workflow)
- Environment variables must be set in Vercel dashboard under Project Settings

## Environment Configuration

**Required env vars:**

Core Airtable connection:
- `AIRTABLE_ACCESS_TOKEN` - Personal Access Token (starts with `pat`)
- `AIRTABLE_BASE_ID` - Base ID (starts with `app`)
- `AIRTABLE_TABLE_NAME` - Table ID (starts with `tbl`, NOT table name)

Business/Invoice Information:
- `BUSINESS_NAME` - Your business name (defaults to 'AK Capital Group LLC')
- `BUSINESS_EMAIL` - Your email (defaults to 'andy@andykaufman.net')
- `WORK_NAME` - Client company name (defaults to 'AirSpace Integration')
- `WORK_ADDRESS` - Client address (defaults to '450 McQuiade Dr, La Selva Beach, CA, 95076')
- `HOURLY_RATE` - Hourly billing rate (defaults to 25)

Optional/Future:
- `DEFAULT_USER_ID` - Defaults to 'andy' (for multi-user expansion)
- `RESEND_API_KEY` - Reserved for future email integration (not currently used)

**Secrets location:**
- Development: `.env.local` file (git-ignored)
- Production: Vercel Environment Variables dashboard under Project Settings → Environment Variables

## Webhooks & Callbacks

**Incoming:**
- None - No webhook receivers implemented

**Outgoing:**
- None currently
- Email sending planned but not yet implemented (scaffolding for `RESEND_API_KEY` exists)

## API Endpoints (Internal)

**Time Entries:**
- `GET /api/time-entries` - Fetch all entries for user
- `POST /api/time-entries` - Create new time entry
  - File: `src/app/api/time-entries/route.js`
  - Validates: `date`, `timeIn`, `timeOut`, `description`

**Invoice Generation:**
- `GET /api/invoices/entries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Fetch entries for date range, grouped by month
  - File: `src/app/api/invoices/entries/route.js`
  - Returns: Monthly groups with totals and summary calculations

- `POST /api/invoices/generate` - Generate PDF invoice
  - File: `src/app/api/invoices/generate/route.js`
  - Input: `monthlyGroups`, `invoiceData`, `dateRange`
  - Output: PDF file as binary response with `Content-Type: application/pdf`

**Debugging:**
- `GET /api/test-airtable` - Test Airtable connection
- `GET /api/debug` - Debug endpoint (usage unclear)

---

*Integration audit: 2026-03-01*
