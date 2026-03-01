import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const e = React.createElement;

// ─── Invoice Data ───────────────────────────────────────
const INVOICE = {
  number: '26-02',
  date: 'March 1, 2026',
  description: 'Services rendered for the months of February 2026',
  from: {
    name: 'AK Capital Group LLC',
    address: '100 Hainline Rd',
    cityStateZip: 'Aptos, CA 95003',
    phone: '415.269.1034',
    email: 'andy@andykaufman.net',
  },
  to: {
    name: 'AirSpace Integration',
    address: '681 Beach Dr.',
    cityStateZip: 'La Selva Beach, CA 95076',
  },
  lineItems: [
    { month: 'February', hours: 167.50, rate: 32.50 },
  ],
};

// Calculate amounts
INVOICE.lineItems.forEach(item => {
  item.amount = item.hours * item.rate;
});
const total = INVOICE.lineItems.reduce((sum, item) => sum + item.amount, 0);

// ─── Styles ─────────────────────────────────────────────
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
  // Table
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
  // Empty row below (part of the table border)
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

// ─── PDF Document ───────────────────────────────────────
const doc = e(Document, null,
  e(Page, { size: 'LETTER', style: styles.page },

    // Title
    e(Text, { style: styles.title }, 'Invoice'),

    // From
    e(View, { style: styles.section },
      e(Text, { style: styles.sectionLabel }, 'From:'),
      e(Text, { style: styles.line }, INVOICE.from.name),
      e(Text, { style: styles.line }, INVOICE.from.address),
      e(Text, { style: styles.line }, INVOICE.from.cityStateZip),
      e(Text, { style: styles.line }, INVOICE.from.phone),
      e(Text, { style: styles.line }, INVOICE.from.email),
    ),

    // To
    e(View, { style: styles.section },
      e(Text, { style: styles.sectionLabel }, 'To:'),
      e(Text, { style: styles.line }, INVOICE.to.name),
      e(Text, { style: styles.line }, INVOICE.to.address),
      e(Text, { style: styles.line }, INVOICE.to.cityStateZip),
    ),

    // Invoice Date & Number
    e(View, { style: styles.section },
      e(Text, { style: styles.sectionLabel }, 'Invoice Date:'),
      e(Text, { style: styles.line }, INVOICE.date),
    ),
    e(View, { style: styles.section },
      e(Text, { style: styles.sectionLabel }, 'Invoice Number:'),
      e(Text, { style: styles.line }, INVOICE.number),
    ),

    // Description of Services
    e(View, { style: { marginBottom: 8 } },
      e(Text, { style: styles.descriptionHeading }, 'Description of Services:'),
      e(Text, { style: styles.descriptionText }, INVOICE.description),
    ),

    // Line items table
    ...INVOICE.lineItems.map((item, i) =>
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
          e(Text, null, `$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
        ),
      )
    ),

    // Empty table row (matches January format)
    e(View, { style: styles.tableRowEmpty }),

    // Month Total
    e(View, { style: styles.totalLine },
      e(Text, { style: styles.totalText }, 'February Total -  '),
      e(Text, { style: styles.totalAmount },
        `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ),
    ),

    // Payment Instructions
    e(View, { style: styles.paymentSection },
      e(Text, { style: styles.paymentLabel }, 'Payment Instructions:'),
      e(Text, { style: styles.paymentText },
        'Please make all checks payable to AK Capital Group LLC.'
      ),
      e(Text, { style: styles.paymentText },
        `Please reference Invoice Number ${INVOICE.number} on your payment.`
      ),
      e(Text, { style: styles.thankYou },
        `Thank you for your business! If you have any questions about this invoice, please contact Andy Kaufman at ${INVOICE.from.phone} or ${INVOICE.from.email}`
      ),
    ),
  )
);

// ─── Generate PDF ───────────────────────────────────────
console.log('Generating February 2026 invoice...');
console.log(`  ${INVOICE.lineItems[0].hours} hours @ $${INVOICE.lineItems[0].rate}/hr = $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

const buffer = await renderToBuffer(doc);
const outputPath = resolve('February-Invoice-26-02.pdf');
writeFileSync(outputPath, buffer);

console.log(`\nInvoice saved to: ${outputPath}`);
