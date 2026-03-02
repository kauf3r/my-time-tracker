# Time Tracker (ARCHIVED)

> **This project has been archived.** All functionality has been migrated to [andyos-dashboard](https://github.com/andy-kaufman/andyos-dashboard) as of March 2026.

## What was migrated

- Time entry tracking (now uses Postgres instead of Airtable)
- Invoice PDF generation (now uses jsPDF instead of @react-pdf/renderer)
- All historical data (Jan + Feb 2026 entries)

## What's better in andyos-dashboard

- Auth via BetterAuth
- Edit/delete entries
- 15-minute time rounding
- Month-based navigation
- Vercel Blob storage for PDFs
- Proper relational database (Neon Postgres)

## Original stack

Next.js 15, React 19, Airtable, @react-pdf/renderer, Tailwind CSS, shadcn/ui
