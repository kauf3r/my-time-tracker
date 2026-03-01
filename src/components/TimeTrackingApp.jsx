'use client';

import { useState, useEffect } from 'react';
import { Clock, Loader2, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const getDefaultDate = () => {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const getNowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  return `${weekday}, ${monthName} ${parseInt(day)}`;
};

const formatTimeDisplay = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
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
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentEntry(prev => ({ ...prev, date: getDefaultDate() }));
    loadTimeEntries();
  }, []);

  const loadTimeEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      showNotif('Failed to load entries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isClient) return null;

  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '';
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    let mins = (outH * 60 + outM) - (inH * 60 + inM);
    if (mins < 0) mins += 24 * 60;
    return (mins / 60).toFixed(2);
  };

  const handleChange = (field, value) => {
    const updated = { ...currentEntry, [field]: value };
    if (updated.timeIn && updated.timeOut) {
      updated.hours = calculateHours(updated.timeIn, updated.timeOut);
    }
    setCurrentEntry(updated);
  };

  const setNow = (field) => {
    handleChange(field, getNowTime());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntry.timeIn || !currentEntry.timeOut) {
      showNotif('Set both time in and time out', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEntry),
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(prev => [data.entry, ...prev]);
        setCurrentEntry({ ...defaultEntry, date: getDefaultDate() });
        setShowDescription(false);
        showNotif('Hours logged!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      showNotif('Failed to save. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Monthly totals for current entries
  const monthlyHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between animate-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
            TIME TRACKER
          </h1>
        </div>
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <FileText className="w-4 h-4" />
          Invoice
        </Link>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`animate-in px-4 py-3 rounded-lg text-sm font-medium ${
          notification.type === 'error'
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Quick Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Date */}
        <div className="glass-card rounded-xl p-4 animate-in stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Date
            </span>
            <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {formatDateDisplay(currentEntry.date)}
            </span>
          </div>
          <input
            type="date"
            value={currentEntry.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full mt-2 px-3 py-2 text-sm rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            required
          />
        </div>

        {/* Time In / Time Out */}
        <div className="grid grid-cols-2 gap-4">
          {/* Time In */}
          <div className="glass-card rounded-xl p-4 animate-in stagger-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Time In
              </span>
              <button
                type="button"
                onClick={() => setNow('timeIn')}
                className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
                style={{ backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}
              >
                Now
              </button>
            </div>
            <input
              type="time"
              value={currentEntry.timeIn}
              onChange={(e) => handleChange('timeIn', e.target.value)}
              className="input-mono"
              required
            />
            {currentEntry.timeIn && (
              <div className="text-center mt-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {formatTimeDisplay(currentEntry.timeIn)}
              </div>
            )}
          </div>

          {/* Time Out */}
          <div className="glass-card rounded-xl p-4 animate-in stagger-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Time Out
              </span>
              <button
                type="button"
                onClick={() => setNow('timeOut')}
                className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
                style={{ backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}
              >
                Now
              </button>
            </div>
            <input
              type="time"
              value={currentEntry.timeOut}
              onChange={(e) => handleChange('timeOut', e.target.value)}
              className="input-mono"
              required
            />
            {currentEntry.timeOut && (
              <div className="text-center mt-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {formatTimeDisplay(currentEntry.timeOut)}
              </div>
            )}
          </div>
        </div>

        {/* Hours Calculated */}
        {currentEntry.hours && (
          <div className="glass-card rounded-xl p-5 animate-in text-center">
            <span className="text-4xl font-bold hours-display">
              {currentEntry.hours}
            </span>
            <span className="text-lg ml-2" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'B612 Mono', monospace" }}>
              hours
            </span>
          </div>
        )}

        {/* Optional Description Toggle */}
        <div className="animate-in stagger-4">
          {!showDescription ? (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors w-full justify-center py-2"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <ChevronDown className="w-3 h-3" />
              Add description
            </button>
          ) : (
            <div className="glass-card rounded-xl p-4">
              <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Description
                <span className="font-normal ml-1 normal-case tracking-normal">(optional)</span>
              </span>
              <input
                type="text"
                value={currentEntry.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                placeholder="What did you work on?"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !currentEntry.timeIn || !currentEntry.timeOut}
          className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            boxShadow: (!isSubmitting && currentEntry.timeIn && currentEntry.timeOut)
              ? '0 0 20px hsla(var(--primary), 0.25), 0 4px 12px hsla(var(--primary), 0.15)'
              : 'none',
          }}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Saving...' : 'Log Hours'}
        </button>
      </form>

      {/* Recent Entries */}
      {isLoading ? (
        <div className="glass-card rounded-xl p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <span className="ml-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Loading...</span>
          </div>
        </div>
      ) : entries.length > 0 ? (
        <div className="glass-card rounded-xl overflow-hidden animate-in stagger-4">
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Recent Entries
            </span>
            <span className="text-xs font-bold" style={{ fontFamily: "'B612 Mono', monospace", color: 'hsl(var(--status-hours))' }}>
              {monthlyHours.toFixed(1)}h total
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
            {entries.slice(0, 15).map((entry) => (
              <div key={entry.id} className="entry-row px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    {formatDateDisplay(entry.date)}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'B612 Mono', monospace" }}>
                    {formatTimeDisplay(entry.timeIn)} – {formatTimeDisplay(entry.timeOut)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {entry.description && (
                    <span className="text-xs max-w-32 truncate hidden sm:inline" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {entry.description}
                    </span>
                  )}
                  <span className="text-sm font-bold tabular-nums" style={{ fontFamily: "'B612 Mono', monospace", color: 'hsl(var(--status-hours))' }}>
                    {entry.hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center animate-in stagger-4">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--secondary))' }}>
            <Clock className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </div>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No entries yet. Log your first hours above.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingApp;
