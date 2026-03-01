'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

const getDefaultDate = () => {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const defaultEntry = {
  date: '',
  timeIn: '',
  timeOut: '',
  hours: '',
  description: ''
};

const TimeTrackingApp = () => {
  const [isClient, setIsClient] = useState(false);
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(defaultEntry);
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentEntry(prev => ({...prev, date: getDefaultDate()}));
    loadTimeEntries();
  }, []);

  const loadTimeEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
      } else {
        throw new Error('Failed to load entries');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      setNotification('Failed to load previous entries');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '';

    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);

    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    if (totalMinutes < 0) totalMinutes += 24 * 60;

    return (totalMinutes / 60).toFixed(2);
  };

  const handleTimeChange = (field, value) => {
    const updatedEntry = { ...currentEntry, [field]: value };
    if (updatedEntry.timeIn && updatedEntry.timeOut) {
      updatedEntry.hours = calculateHours(updatedEntry.timeIn, updatedEntry.timeOut);
    }
    setCurrentEntry(updatedEntry);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentEntry.timeIn || !currentEntry.timeOut) {
      setNotification('Please fill in time in and time out');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentEntry),
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(prev => [data.entry, ...prev]);
        setCurrentEntry({...defaultEntry, date: getDefaultDate()});
        setNotification('Hours logged!');
      } else {
        throw new Error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      setNotification('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Time Tracker</h1>
          </div>
          <Link
            href="/invoices"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Invoice
          </Link>
        </div>

        {notification && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {notification}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={currentEntry.date}
                onChange={(e) => handleTimeChange('date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time In
              </label>
              <input
                type="time"
                value={currentEntry.timeIn}
                onChange={(e) => handleTimeChange('timeIn', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Out
              </label>
              <input
                type="time"
                value={currentEntry.timeOut}
                onChange={(e) => handleTimeChange('timeOut', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {currentEntry.hours && (
            <div className="text-center text-lg font-semibold text-blue-600">
              {currentEntry.hours} hours
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={currentEntry.description}
              onChange={(e) => handleTimeChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What did you work on?"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Log Hours'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading entries...</span>
          </div>
        </div>
      ) : entries.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Entries</h2>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-800">{entry.date}</span>
                  <span className="text-sm text-gray-500">{entry.timeIn} - {entry.timeOut}</span>
                </div>
                <div className="flex items-center gap-3">
                  {entry.description && (
                    <span className="text-sm text-gray-500 max-w-48 truncate">{entry.description}</span>
                  )}
                  <span className="font-semibold text-blue-600">{entry.hours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No time entries yet. Add your first entry above!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingApp;
