import './globals.css'

export const metadata = {
  title: 'Time Tracker',
  description: 'Track your work hours and generate invoices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
