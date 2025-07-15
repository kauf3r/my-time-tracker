import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  businessInfo: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'right',
    marginTop: -40,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billTo: {
    flex: 1,
  },
  invoiceDetails: {
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  monthSection: {
    marginBottom: 20,
  },
  monthHeader: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginBottom: 5,
    borderRadius: 4,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  monthSummary: {
    fontSize: 10,
    color: '#6b7280',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateColumn: { flex: 1 },
  timeColumn: { flex: 1 },
  descriptionColumn: { flex: 3 },
  hoursColumn: { flex: 1, textAlign: 'right' },
  rateColumn: { flex: 1, textAlign: 'right' },
  amountColumn: { flex: 1, textAlign: 'right' },
  summary: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: '#2563eb',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  }
});

// PDF Document Component
const InvoicePDF = ({ monthlyGroups, invoiceData, dateRange, invoiceNumber, businessInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.invoiceInfo}>
          <View style={styles.billTo}>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            <Text style={styles.businessInfo}>{businessInfo.email}</Text>
            <Text style={styles.businessInfo}>Time Tracking Services</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>
        </View>
      </View>

      {/* Invoice Details */}
      <View style={styles.invoiceInfo}>
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{businessInfo.workName}</Text>
          <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.4 }}>
            {businessInfo.workAddress.split(',')[0]}{'\n'}
            {businessInfo.workAddress.split(',').slice(1).join(',').trim()}
          </Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text style={styles.sectionTitle}>Invoice Details:</Text>
          <Text>Invoice #: {invoiceNumber}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
          <Text>Period: {dateRange.startDate} to {dateRange.endDate}</Text>
          <Text>Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Monthly Time Entries */}
      {monthlyGroups.map((month, monthIndex) => (
        <View key={monthIndex} style={styles.monthSection}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{month.monthName}</Text>
            <Text style={styles.monthSummary}>
              {month.totalDays} days • {month.totalHours} hours • ${month.monthlyAmount.toFixed(2)}
            </Text>
          </View>
          
          {/* Table Header for this month */}
          <View style={styles.tableHeader}>
            <Text style={styles.dateColumn}>Date</Text>
            <Text style={styles.timeColumn}>Time</Text>
            <Text style={styles.descriptionColumn}>Description</Text>
            <Text style={styles.hoursColumn}>Hours</Text>
            <Text style={styles.rateColumn}>Rate</Text>
            <Text style={styles.amountColumn}>Amount</Text>
          </View>
          
          {/* Entries for this month */}
          {month.entries.map((entry, index) => {
            const amount = (parseFloat(entry.hours) * parseFloat(invoiceData.hourlyRate)).toFixed(2);
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.dateColumn}>{entry.date}</Text>
                <Text style={styles.timeColumn}>{entry.timeIn} - {entry.timeOut}</Text>
                <Text style={styles.descriptionColumn}>{entry.description}</Text>
                <Text style={styles.hoursColumn}>{entry.hours}</Text>
                <Text style={styles.rateColumn}>${invoiceData.hourlyRate}</Text>
                <Text style={styles.amountColumn}>${amount}</Text>
              </View>
            );
          })}
        </View>
      ))}

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Hours:</Text>
          <Text style={styles.summaryValue}>{invoiceData.totalHours}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hourly Rate:</Text>
          <Text style={styles.summaryValue}>${invoiceData.hourlyRate}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>${invoiceData.totalAmount}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for your business! Payment is due within 30 days of invoice date.
      </Text>
    </Page>
  </Document>
);

export async function POST(request) {
  try {
    console.log('=== INVOICE PDF GENERATION REQUEST ===');
    
    const body = await request.json();
    const { monthlyGroups, invoiceData, dateRange } = body;
    
    console.log('Generating PDF for:', {
      monthlyGroupsCount: monthlyGroups.length,
      totalHours: invoiceData.totalHours,
      totalAmount: invoiceData.totalAmount,
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    });
    
    // Generate unique invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Business information from environment variables
    const businessInfo = {
      name: process.env.BUSINESS_NAME || 'AK Capital Group LLC',
      email: process.env.BUSINESS_EMAIL || 'andy@andykaufman.net',
      workName: process.env.WORK_NAME || 'AirSpace Integration',
      workAddress: process.env.WORK_ADDRESS || '450 McQuiade Dr, La Selva Beach, CA, 95076'
    };
    
    // Generate PDF
    const pdfDocument = InvoicePDF({ 
      monthlyGroups, 
      invoiceData, 
      dateRange, 
      invoiceNumber,
      businessInfo 
    });
    
    const pdfBuffer = await pdf(pdfDocument).toBuffer();
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${dateRange.startDate}-to-${dateRange.endDate}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF invoice', details: error.message },
      { status: 500 }
    );
  }
}