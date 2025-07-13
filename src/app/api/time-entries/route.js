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
    const body = await request.json();
    
    // Validate required fields
    if (!body.date || !body.timeIn || !body.timeOut || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const entry = await createTimeEntry(body);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}