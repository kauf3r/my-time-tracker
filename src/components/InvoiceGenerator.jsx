'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, DollarSign, Clock, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const InvoiceGenerator = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [entries, setEntries] = useState([]);
  const [monthlyGroups, setMonthlyGroups] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState('');

  // Get default dates (first and last day of current month)
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  };

  // Initialize with current month
  useState(() => {
    const defaultDates = getDefaultDates();
    setDateRange(defaultDates);
  }, []);

  const fetchEntriesForPeriod = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setNotification('Please select both start and end dates');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/entries?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setMonthlyGroups(data.monthlyGroups);
        setInvoiceData(data.summary);
        setNotification(`Found ${data.entries.length} entries across ${data.monthlyGroups.length} months`);
      } else {
        throw new Error('Failed to fetch entries');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      setNotification('Failed to fetch entries for the selected period');
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const generatePDF = async () => {
    if (!invoiceData || entries.length === 0) {
      setNotification('No entries found for the selected period');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyGroups,
          invoiceData,
          dateRange
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setNotification('Invoice downloaded successfully!');
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification('Failed to generate PDF invoice');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Time Tracker
          </Link>
        </div>

        {notification && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {notification}
            </div>
          </div>
        )}

        {/* Date Range Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Select Invoice Period</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={fetchEntriesForPeriod}
            disabled={isLoading}
            className="w-full md:w-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Loading...' : 'Fetch Entries'}
          </button>
        </div>
      </div>

      {/* Invoice Summary */}
      {invoiceData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Invoice Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Days</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{invoiceData.totalDays}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Hours</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{invoiceData.totalHours}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Total Amount</span>
              </div>
              <p className="text-2xl font-bold text-green-600">${invoiceData.totalAmount}</p>
            </div>
          </div>

          <button
            onClick={generatePDF}
            disabled={isGenerating || entries.length === 0}
            className="w-full md:w-auto bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Download Invoice PDF'}
          </button>
        </div>
      )}

      {/* Monthly Entries List */}
      {monthlyGroups.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Time Entries by Month ({entries.length} total entries)
          </h2>
          
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {monthlyGroups.map((month, monthIndex) => (
              <div key={monthIndex} className="border border-gray-200 rounded-lg p-4">
                {/* Month Header */}
                <div className="bg-gray-50 -m-4 mb-4 p-4 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{month.monthName}</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{month.totalDays} days • {month.totalHours} hours</p>
                      <p className="text-lg font-bold text-green-600">${month.monthlyAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Month Entries */}
                <div className="space-y-3">
                  {month.entries.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.date} - {entry.hours} hours</p>
                          <p className="text-sm text-gray-600">{entry.timeIn} to {entry.timeOut}</p>
                          <p className="text-gray-700 mt-1">{entry.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">
                            ${(parseFloat(entry.hours) * parseFloat(invoiceData?.hourlyRate || 25)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;