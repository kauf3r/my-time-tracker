'use client';

import dynamic from 'next/dynamic'

const TimeTrackingApp = dynamic(() => import('../components/TimeTrackingApp'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function Home() {
  return <TimeTrackingApp />;
}