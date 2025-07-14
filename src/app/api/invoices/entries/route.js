import { NextResponse } from 'next/server';
import { getTimeEntriesForPeriod } from '@/lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    console.log('=== INVOICE ENTRIES REQUEST ===');
    console.log('Date range:', { startDate, endDate });
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }
    
    // Fetch entries for the specified period
    const entries = await getTimeEntriesForPeriod(startDate, endDate);
    
    console.log(`Found ${entries.length} entries for period`);
    
    // Group entries by month
    const groupedByMonth = entries.reduce((groups, entry) => {
      const entryDate = new Date(entry.date);
      const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = entryDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthName,
          monthKey,
          entries: [],
          totalHours: 0,
          totalDays: 0
        };
      }
      
      groups[monthKey].entries.push(entry);
      groups[monthKey].totalHours += parseFloat(entry.hours) || 0;
      groups[monthKey].totalDays += 1;
      
      return groups;
    }, {});
    
    // Convert to array and sort by month
    const monthlyGroups = Object.values(groupedByMonth).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    // Calculate overall summary
    const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
    const hourlyRate = parseFloat(process.env.HOURLY_RATE || 25);
    const totalAmount = totalHours * hourlyRate;
    const totalDays = entries.length;
    
    // Add monthly amounts
    monthlyGroups.forEach(month => {
      month.totalHours = parseFloat(month.totalHours.toFixed(2));
      month.monthlyAmount = parseFloat((month.totalHours * hourlyRate).toFixed(2));
    });
    
    const summary = {
      totalHours: totalHours.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalDays,
      hourlyRate,
      period: `${startDate} to ${endDate}`,
      monthlyBreakdown: monthlyGroups
    };
    
    console.log('Invoice summary:', summary);
    console.log('Monthly groups:', monthlyGroups.length);
    
    return NextResponse.json({ 
      entries,
      monthlyGroups,
      summary
    });
    
  } catch (error) {
    console.error('Invoice entries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice entries', details: error.message },
      { status: 500 }
    );
  }
}