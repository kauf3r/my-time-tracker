import { NextResponse } from 'next/server';
import { createTimeEntry, getTimeEntries } from '@/lib/airtable';

export async function GET() {
  try {
    const entries = await getTimeEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('GET /api/time-entries error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Only date, timeIn, timeOut required — description is optional
    if (!body.date || !body.timeIn || !body.timeOut) {
      return NextResponse.json(
        { error: 'Missing required fields: date, timeIn, timeOut' },
        { status: 400 }
      );
    }

    const entry = await createTimeEntry(body);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('POST /api/time-entries error:', error.message);
    return NextResponse.json(
      { error: 'Failed to create time entry', details: error.message },
      { status: 500 }
    );
  }
}
