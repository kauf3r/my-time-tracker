import { NextResponse } from 'next/server';
import { createTimeEntry, getTimeEntries } from '@/lib/airtable';

export async function GET() {
  try {
    const entries = await getTimeEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('=== API POST REQUEST RECEIVED ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Check environment variables
    console.log('Environment check:', {
      hasAccessToken: !!process.env.AIRTABLE_ACCESS_TOKEN,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      tableName: process.env.AIRTABLE_TABLE_NAME || 'Time Entries',
      defaultUserId: process.env.DEFAULT_USER_ID || 'andy'
    });
    
    // Validate required fields
    if (!body.date || !body.timeIn || !body.timeOut || !body.description) {
      console.log('Missing required fields:', { body });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating time entry with data:', body);
    const entry = await createTimeEntry(body);
    console.log('Successfully created entry:', entry);
    
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to create time entry', details: error.message },
      { status: 500 }
    );
  }
}