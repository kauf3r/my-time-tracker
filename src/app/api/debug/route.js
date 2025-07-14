import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    AIRTABLE_ACCESS_TOKEN: process.env.AIRTABLE_ACCESS_TOKEN ? 'SET' : 'MISSING',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ? 'SET' : 'MISSING',
    AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME || 'Time Entries (default)',
    DEFAULT_USER_ID: process.env.DEFAULT_USER_ID || 'andy (default)',
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log('Environment Variables Check:', envCheck);

  return NextResponse.json({
    message: 'Debug endpoint',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}