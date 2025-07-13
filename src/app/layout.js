import './globals.css'

export const metadata = {
  title: 'Time Tracker',
  description: 'Track your work hours and generate invoices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}