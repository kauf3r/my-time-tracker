import { NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const e = React.createElement;

// PDF Styles — clean, single-page invoice matching established format
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Helvetica-Bold',
  },
  sectionLabel: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  section: {
    marginBottom: 10,
  },
  line: {
    marginBottom: 1,
    lineHeight: 1.4,
  },
  descriptionHeading: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  descriptionText: {
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableCell: {
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  tableCellLast: {
    padding: 7,
  },
  monthCell: {
    width: 120,
  },
  hoursCell: {
    width: 80,
    textAlign: 'right',
  },
  rateCell: {
    width: 80,
    textAlign: 'right',
  },
  amountCell: {
    width: 120,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  tableRowEmpty: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000000',
    height: 20,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 24,
  },
  totalText: {
    fontSize: 11,
  },
  totalAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginLeft: 4,
  },
  paymentSection: {
    marginTop: 6,
  },
  paymentLabel: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  paymentText: {
    marginBottom: 3,
    lineHeight: 1.4,
  },
  thankYou: {
    marginTop: 10,
    lineHeight: 1.4,
  },
});

function formatCurrency(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function POST(request) {
  try {
    console.log('=== INVOICE PDF GENERATION REQUEST ===');

    const body = await request.json();
    const { monthlyGroups, invoiceData, dateRange, invoiceNumber: customInvoiceNumber } = body;

    // Business info from env
    const businessInfo = {
      name: process.env.BUSINESS_NAME || 'AK Capital Group LLC',
      address: process.env.BUSINESS_ADDRESS || '100 Hainline Rd',
      cityStateZip: process.env.BUSINESS_CITY_STATE_ZIP || 'Aptos, CA 95003',
      phone: process.env.BUSINESS_PHONE || '415.269.1034',
      email: process.env.BUSINESS_EMAIL || 'andy@andykaufman.net',
    };
    const workInfo = {
      name: process.env.WORK_NAME || 'AirSpace Integration',
      address: process.env.WORK_ADDRESS || '681 Beach Dr., La Selva Beach, CA 95076',
    };
    const hourlyRate = parseFloat(process.env.HOURLY_RATE || '32.50');

    // Invoice number: use custom if provided, else generate YY-MM format
    const now = new Date();
    const invoiceNumber = customInvoiceNumber ||
      `${String(now.getFullYear()).slice(2)}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Invoice date
    const invoiceDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Build line items from monthly groups
    const lineItems = monthlyGroups.map(month => ({
      month: month.monthName.split(' ')[0], // "January 2026" → "January"
      hours: parseFloat(month.totalHours),
      rate: hourlyRate,
      amount: parseFloat(month.totalHours) * hourlyRate,
    }));

    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Determine month names for description
    const monthNames = lineItems.map(item => item.month).join(' and ');
    const description = `Services rendered for the months of ${monthNames} ${dateRange.startDate.split('-')[0]}`;

    // Determine total label
    const totalLabel = lineItems.length === 1
      ? `${lineItems[0].month} Total -  `
      : 'Total -  ';

    // Split work address into lines
    const workAddressParts = workInfo.address.split(',').map(s => s.trim());
    const workAddressLine1 = workAddressParts[0];
    const workAddressLine2 = workAddressParts.slice(1).join(', ');

    console.log('Generating PDF:', {
      invoiceNumber,
      months: lineItems.map(i => i.month),
      totalHours: lineItems.reduce((s, i) => s + i.hours, 0),
      totalAmount: formatCurrency(total),
    });

    // Build PDF document using React.createElement
    const doc = e(Document, null,
      e(Page, { size: 'LETTER', style: styles.page },

        // Title
        e(Text, { style: styles.title }, 'Invoice'),

        // From
        e(View, { style: styles.section },
          e(Text, { style: styles.sectionLabel }, 'From:'),
          e(Text, { style: styles.line }, businessInfo.name),
          e(Text, { style: styles.line }, businessInfo.address),
          e(Text, { style: styles.line }, businessInfo.cityStateZip),
          e(Text, { style: styles.line }, businessInfo.phone),
          e(Text, { style: styles.line }, businessInfo.email),
        ),

        // To
        e(View, { style: styles.section },
          e(Text, { style: styles.sectionLabel }, 'To:'),
          e(Text, { style: styles.line }, workInfo.name),
          e(Text, { style: styles.line }, workAddressLine1),
          e(Text, { style: styles.line }, workAddressLine2),
        ),

        // Invoice Date
        e(View, { style: styles.section },
          e(Text, { style: styles.sectionLabel }, 'Invoice Date:'),
          e(Text, { style: styles.line }, invoiceDate),
        ),

        // Invoice Number
        e(View, { style: styles.section },
          e(Text, { style: styles.sectionLabel }, 'Invoice Number:'),
          e(Text, { style: styles.line }, invoiceNumber),
        ),

        // Description of Services
        e(View, { style: { marginBottom: 8 } },
          e(Text, { style: styles.descriptionHeading }, 'Description of Services:'),
          e(Text, { style: styles.descriptionText }, description),
        ),

        // Line items table
        ...lineItems.map((item, i) =>
          e(View, { key: `row-${i}`, style: styles.tableRow },
            e(View, { style: { ...styles.tableCell, ...styles.monthCell } },
              e(Text, null, item.month),
            ),
            e(View, { style: { ...styles.tableCell, ...styles.hoursCell } },
              e(Text, null, item.hours.toFixed(2)),
            ),
            e(View, { style: { ...styles.tableCell, ...styles.rateCell } },
              e(Text, null, `@${item.rate.toFixed(2)}`),
            ),
            e(View, { style: { ...styles.tableCellLast, ...styles.amountCell } },
              e(Text, null, formatCurrency(item.amount)),
            ),
          )
        ),

        // Empty table row
        e(View, { style: styles.tableRowEmpty }),

        // Total
        e(View, { style: styles.totalLine },
          e(Text, { style: styles.totalText }, totalLabel),
          e(Text, { style: styles.totalAmount }, formatCurrency(total)),
        ),

        // Payment Instructions
        e(View, { style: styles.paymentSection },
          e(Text, { style: styles.paymentLabel }, 'Payment Instructions:'),
          e(Text, { style: styles.paymentText },
            `Please make all checks payable to ${businessInfo.name}.`
          ),
          e(Text, { style: styles.paymentText },
            `Please reference Invoice Number ${invoiceNumber} on your payment.`
          ),
          e(Text, { style: styles.thankYou },
            `Thank you for your business! If you have any questions about this invoice, please contact Andy Kaufman at ${businessInfo.phone} or ${businessInfo.email}`
          ),
        ),
      )
    );

    const pdfBuffer = await renderToBuffer(doc);

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
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
