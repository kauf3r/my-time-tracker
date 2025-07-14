import Airtable from 'airtable';

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME || 'Time Entries');

// Default user ID for single-user mode (evolution-ready)
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'andy';

/**
 * Create a new time entry in Airtable
 * @param {Object} entry - Time entry data
 * @returns {Promise<Object>} Created record
 */
export async function createTimeEntry(entry) {
  try {
    const record = await table.create([
      {
        fields: {
          'Entry ID': `Entry ${Date.now()}`, // Simple auto-generated ID
          'user_id': DEFAULT_USER_ID,
          'Date': entry.date,
          'Time In': entry.timeIn,
          'Time Out': entry.timeOut,
          'Hours': parseFloat(entry.hours) || 0,
          'Description': entry.description,
          'Win of Day': entry.winOfDay || '',
          'Tomorrow Plan': entry.tomorrowPlan || '',
        },
      },
    ]);

    return {
      id: record[0].id,
      ...record[0].fields,
    };
  } catch (error) {
    console.error('Detailed Airtable error:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
      stack: error.stack,
      fullError: error
    });
    throw new Error('Failed to save time entry');
  }
}

/**
 * Get all time entries for the current user
 * @param {string} userId - User ID (optional, defaults to DEFAULT_USER_ID)
 * @returns {Promise<Array>} Array of time entries
 */
export async function getTimeEntries(userId = DEFAULT_USER_ID) {
  try {
    const records = await table
      .select({
        filterByFormula: `{user_id} = "${userId}"`,
        sort: [{ field: 'Date', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      entryId: record.fields['Entry ID'],
      userId: record.fields['user_id'],
      date: record.fields['Date'],
      timeIn: record.fields['Time In'],
      timeOut: record.fields['Time Out'],
      hours: record.fields['Hours'],
      description: record.fields['Description'],
      winOfDay: record.fields['Win of Day'],
      tomorrowPlan: record.fields['Tomorrow Plan'],
      createdAt: record.fields['created_at'],
      updatedAt: record.fields['updated_at'],
    }));
  } catch (error) {
    console.error('Error fetching time entries:', error);
    throw new Error('Failed to fetch time entries');
  }
}

/**
 * Update a time entry
 * @param {string} recordId - Airtable record ID
 * @param {Object} updates - Updated fields
 * @returns {Promise<Object>} Updated record
 */
export async function updateTimeEntry(recordId, updates) {
  try {
    const record = await table.update([
      {
        id: recordId,
        fields: {
          'Date': updates.date,
          'Time In': updates.timeIn,
          'Time Out': updates.timeOut,
          'Hours': parseFloat(updates.hours) || 0,
          'Description': updates.description,
          'Win of Day': updates.winOfDay || '',
          'Tomorrow Plan': updates.tomorrowPlan || '',
        },
      },
    ]);

    return {
      id: record[0].id,
      ...record[0].fields,
    };
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw new Error('Failed to update time entry');
  }
}

/**
 * Delete a time entry
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTimeEntry(recordId) {
  try {
    await table.destroy([recordId]);
    return true;
  } catch (error) {
    console.error('Error deleting time entry:', error);
    throw new Error('Failed to delete time entry');
  }
}

/**
 * Get time entries for a specific date range (for invoice generation)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Array>} Array of time entries
 */
export async function getTimeEntriesForPeriod(startDate, endDate, userId = DEFAULT_USER_ID) {
  try {
    const records = await table
      .select({
        filterByFormula: `AND(
          {user_id} = "${userId}",
          IS_AFTER({Date}, "${startDate}"),
          IS_BEFORE({Date}, "${endDate}")
        )`,
        sort: [{ field: 'Date', direction: 'asc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      date: record.fields['Date'],
      timeIn: record.fields['Time In'],
      timeOut: record.fields['Time Out'],
      hours: record.fields['Hours'],
      description: record.fields['Description'],
    }));
  } catch (error) {
    console.error('Error fetching time entries for period:', error);
    throw new Error('Failed to fetch time entries for period');
  }
}