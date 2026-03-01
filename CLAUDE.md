# Time Tracker & Invoice App

## Project Overview
This is a Next.js web application that helps track work hours throughout the week and generates professional invoices at the end of each month to email to Chris (the boss).

### What This App Does
1. **Time Entry**: Log daily work hours with time in/out, descriptions, and notes
2. **Auto Calculation**: Automatically calculates hours worked from time in/out
3. **Data Storage**: Saves entries to Airtable (cloud database) 
4. **Invoice Generation**: Creates professional PDF invoices monthly
5. **Email Automation**: Sends invoices to Chris automatically

## Technology Stack (Beginner-Friendly Explanations)

### Frontend
- **Next.js**: React framework that makes building web apps easier
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built, beautiful UI components
- **Lucide React**: Icon library for nice-looking icons

### Backend/Database
- **Airtable**: Cloud database that looks like a spreadsheet but acts like a database
- **Airtable API**: Way for our app to send/receive data from Airtable

### Other Tools
- **React PDF**: For generating PDF invoices
- **Email Service**: Resend or similar for sending emails

## File Structure
```
src/
├── app/
│   ├── layout.js          # Main app wrapper
│   └── page.js            # Home page (loads TimeTrackingApp)
├── components/
│   ├── TimeTrackingApp.jsx # Main time tracking form
│   └── ui/                # shadcn/ui components
└── lib/
    └── utils.ts           # Utility functions
```

## Current Features (What Works Now)
- ✅ Time entry form with all fields
- ✅ Automatic hours calculation
- ✅ Form validation
- ✅ Airtable integration for data persistence
- ✅ Past entries viewing
- ✅ Responsive design
- ✅ Success notifications

## Planned Features (What We're Building)
- 🔄 Past entries editing functionality
- 🔄 Monthly invoice generation
- 🔄 PDF export functionality
- 🔄 Email automation to Chris
- 🔄 Settings page for hourly rate, business info

## Development Commands
```bash
npm run dev     # Start development server (http://localhost:3000)
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Check for code issues
```

## Environment Variables Needed
```env
AIRTABLE_ACCESS_TOKEN=your_token_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_TABLE_NAME=your_table_id_here  # Use table ID (starts with 'tbl') NOT table name
HOURLY_RATE=32.50
BUSINESS_NAME=AK Capital Group LLC
BUSINESS_EMAIL=andy@andykaufman.net
BUSINESS_ADDRESS=100 Hainline Rd
BUSINESS_CITY_STATE_ZIP=Aptos, CA 95003
BUSINESS_PHONE=415.269.1034
WORK_NAME=AirSpace Integration
WORK_ADDRESS=681 Beach Dr., La Selva Beach, CA 95076
WORK_EMAIL=bley@airspaceintegration.com
RESEND_API_KEY=your_email_api_key
```

**IMPORTANT**: Use Airtable **table ID** (e.g., `tblyWU7ZpduMa4Xl3`) instead of table name for reliable authentication.

## Airtable Setup

### How to Get Your Table ID:
1. Open your Airtable base in browser
2. Copy the URL: `https://airtable.com/appXXXXXX/tblYYYYYY/viwZZZZZZ`
3. Extract the table ID: `tblYYYYYY` (starts with `tbl`)
4. Use this ID in `AIRTABLE_TABLE_NAME` environment variable

### Required Fields in Your Airtable Table:
- **Date** (Date field)
- **Time In** (Single line text)
- **Time Out** (Single line text) 
- **Hours** (Number field - calculated in app)
- **Description** (Long text)
- **Win of Day** (Long text)
- **Tomorrow Plan** (Long text)
- **Entry ID** (Single line text - auto-generated)
- **user_id** (Single line text - defaults to 'andy')

### Airtable Token Setup:
1. Go to https://airtable.com/create/tokens
2. Create Personal Access Token with scopes:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:read`
3. **Add specific base access** - select your exact base, not just general permissions
4. Copy token (starts with `pat`) to `AIRTABLE_ACCESS_TOKEN`

## Business Settings
- Hourly rate: $32.50/hour
- Business: AK Capital Group LLC, 100 Hainline Rd, Aptos CA 95003
- Contact: Andy Kaufman, 415.269.1034, andy@andykaufman.net
- Client: AirSpace Integration, 681 Beach Dr., La Selva Beach CA 95076
- Client contact: bley@airspaceintegration.com
- Invoice numbering: YY-MM format (e.g., 26-01 for January 2026)
- Invoice format: Simple summary (month, hours, rate, total) — NOT per-day breakdown

## Key Learning Concepts
- **State Management**: How React keeps track of form data
- **API Integration**: How to send data to external services
- **Component Architecture**: Breaking UI into reusable pieces
- **Form Handling**: Managing user input and validation
- **Async Operations**: Handling data that takes time to load/save

## Troubleshooting

### Common Issues:
- **App won't start**: Check if Node.js is installed, run `npm install`
- **Styles look broken**: Check if Tailwind CSS is configured properly
- **Hours don't calculate**: Check that both time in/out are entered

### Airtable "Failed to Save" / 403 NOT_AUTHORIZED Errors:
**Symptoms**: "Failed to save please try again" in browser, `AirtableError: NOT_AUTHORIZED (403)` in server logs

**Solutions**:
1. **Use Table ID Instead of Name**:
   - ❌ Wrong: `AIRTABLE_TABLE_NAME=Time_Entries` 
   - ✅ Correct: `AIRTABLE_TABLE_NAME=tblyWU7ZpduMa4Xl3`
   - Get table ID from URL: `https://airtable.com/appXXX/tblYYY/viwZZZ`

2. **Check Token Permissions**:
   - Token must have **specific base access** (not just general permissions)
   - Required scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
   - Regenerate token at https://airtable.com/create/tokens if needed

3. **Verify Environment Variables**:
   - Check `.env.local` file exists and has correct values
   - Restart development server after changing env vars: `npm run dev`
   - Use `/api/test-airtable` endpoint to test connection

4. **Field Name Matching**:
   - Airtable fields should use spaces: "Time In", "Time Out", "Date"
   - Code maps these correctly in `/src/lib/airtable.js`

### Vercel Deployment Issues:
- Check Vercel Dashboard → Project → Settings → Environment Variables
- Ensure all env vars are set with correct values (including table ID)
- Redeploy after updating environment variables

## Next Steps
1. ✅ Set up Airtable base and get API credentials - COMPLETED
2. ✅ Replace local state with Airtable integration - COMPLETED
3. ✅ Add past entries viewing - COMPLETED
4. 🔄 Build invoice generation system
5. 🔄 Set up email automation

## Git Workflow
- Main branch: `main`
- Current status: App deployed to Vercel, Airtable integration working
- Deployed URL: https://my-time-tracker-4px4tc1ba-andy-kaufmans-projects.vercel.app/
- Next: Invoice generation and email automation

## Notes for Claude
- User is a beginner programmer
- Explain technical concepts in simple terms
- Prefer building on existing code vs starting over
- Test functionality after each major change
- Keep UI simple and intuitive