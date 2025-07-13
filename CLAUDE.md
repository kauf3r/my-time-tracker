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
- ✅ Local state management (data lost on refresh)
- ✅ Responsive design
- ✅ Success notifications

## Planned Features (What We're Building)
- 🔄 Airtable integration for data persistence
- 🔄 Past entries viewing/editing
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
AIRTABLE_TABLE_NAME=Time Entries
RESEND_API_KEY=your_email_api_key
CHRIS_EMAIL=chris@company.com
```

## Airtable Setup
### Required Fields in "Time Entries" Table:
- Date (Date field)
- Time In (Single line text)
- Time Out (Single line text) 
- Hours (Number field - calculated in app)
- Description (Long text)
- Win of Day (Long text)
- Tomorrow Plan (Long text)

## Business Settings (To Configure)
- Hourly rate: $XX/hour
- Business name/personal name
- Contact information for invoices
- Chris's email address
- Invoice template preferences

## Key Learning Concepts
- **State Management**: How React keeps track of form data
- **API Integration**: How to send data to external services
- **Component Architecture**: Breaking UI into reusable pieces
- **Form Handling**: Managing user input and validation
- **Async Operations**: Handling data that takes time to load/save

## Troubleshooting
- If app won't start: Check if Node.js is installed, run `npm install`
- If styles look broken: Check if Tailwind CSS is configured properly
- If data disappears: This is normal until Airtable integration is complete
- If hours don't calculate: Check that both time in/out are entered

## Next Steps
1. Set up Airtable base and get API credentials
2. Replace local state with Airtable integration
3. Add past entries viewing
4. Build invoice generation system
5. Set up email automation

## Git Workflow
- Main branch: `main`
- Current status: Basic time tracking app complete
- Next: Airtable integration

## Notes for Claude
- User is a beginner programmer
- Explain technical concepts in simple terms
- Prefer building on existing code vs starting over
- Test functionality after each major change
- Keep UI simple and intuitive