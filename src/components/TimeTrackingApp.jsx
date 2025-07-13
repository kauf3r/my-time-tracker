'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Trophy, CalendarClock, Loader2 } from 'lucide-react';

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
  description: '',
  winOfDay: '',
  tomorrowPlan: ''
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
    
    if (!currentEntry.timeIn || !currentEntry.timeOut || !currentEntry.description) {
      setNotification('Please fill in all required fields');
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
        // Add new entry to the beginning of the list
        setEntries(prev => [data.entry, ...prev]);
        setCurrentEntry({...defaultEntry, date: getDefaultDate()});
        setNotification('Hours logged successfully!');
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Time Tracker</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours Worked
            </label>
            <input
              type="text"
              value={currentEntry.hours}
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-50"
              placeholder="Calculated automatically"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description of Work
            </label>
            <textarea
              value={currentEntry.description}
              onChange={(e) => handleTimeChange('description', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What did you work on today?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Trophy className="w-4 h-4 inline mr-1" />
              Win of the Day
            </label>
            <textarea
              value={currentEntry.winOfDay}
              onChange={(e) => handleTimeChange('winOfDay', e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What went well today?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarClock className="w-4 h-4 inline mr-1" />
              Tomorrow&apos;s Plan
            </label>
            <textarea
              value={currentEntry.tomorrowPlan}
              onChange={(e) => handleTimeChange('tomorrowPlan', e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What&apos;s the plan for tomorrow?"
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
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{entry.date} - {entry.hours} hours</p>
                    <p className="text-sm text-gray-600">{entry.timeIn} to {entry.timeOut}</p>
                    <p className="text-gray-700 mt-1">{entry.description}</p>
                    {entry.winOfDay && (
                      <p className="text-sm text-green-600 mt-1">
                        <Trophy className="w-3 h-3 inline mr-1" />
                        {entry.winOfDay}
                      </p>
                    )}
                  </div>
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