# Testing Patterns

**Analysis Date:** 2026-03-01

## Test Framework

**Status:** Not currently in use

**Runner:**
- No test runner configured (Jest, Vitest, or other frameworks absent)

**Assertion Library:**
- Not detected in package.json

**Run Commands:**
- No test-related npm scripts in `package.json`
- Existing commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`

## Test Coverage

**Current State:**
- No test files found in source directory (`src/` tree is clean of `*.test.*`, `*.spec.*` files)
- Testing library dependencies: not installed
- Coverage tracking: not configured

## Recommended Testing Architecture

While no tests currently exist, this section documents the ideal testing approach for this codebase based on its structure and technology stack.

### Testing Priorities (suggested order)

**High Priority - Core Business Logic:**
1. `src/lib/airtable.js` - All database operations
   - `createTimeEntry()` - POST to Airtable
   - `getTimeEntries()` - Fetch with filters
   - `getTimeEntriesForPeriod()` - Date range filtering for invoices
   - `updateTimeEntry()` - Record updates
   - `deleteTimeEntry()` - Record deletion

2. Airtable integration tests
   - Valid field mapping
   - Error handling for 403 NOT_AUTHORIZED
   - Query formula construction (filtering by user_id, date ranges)

3. Invoice calculations
   - `src/app/api/invoices/entries/route.js` - Monthly grouping logic
   - Hour calculation and summation
   - Rate multiplication

**Medium Priority - Component State:**
1. `src/components/TimeTrackingApp.jsx`
   - Form state management
   - Hour calculation trigger (when both timeIn and timeOut filled)
   - Form validation
   - Entry submission flow

2. `src/components/InvoiceGenerator.jsx`
   - Date range state
   - Period fetch and grouping
   - PDF generation trigger

**Lower Priority - UI/Rendering:**
1. Snapshot tests for static components
2. Accessibility tests for form inputs

## Test File Organization

**Suggested Structure:**
```
src/
├── lib/
│   ├── airtable.js
│   └── __tests__/
│       └── airtable.test.js
├── components/
│   ├── TimeTrackingApp.jsx
│   ├── InvoiceGenerator.jsx
│   └── __tests__/
│       ├── TimeTrackingApp.test.jsx
│       └── InvoiceGenerator.test.jsx
├── app/
│   └── api/
│       ├── time-entries/
│       │   └── route.js
│       └── __tests__/
│           └── time-entries.test.js
```

**Naming Pattern:**
- Test files colocated with source: `__tests__/` directory adjacent to source
- Test file names: `[sourceName].test.[js|jsx]`

## Test Structure

### Setup Pattern

For utility functions (e.g., Airtable operations):

```javascript
import { createTimeEntry, getTimeEntries } from '@/lib/airtable';

describe('Airtable', () => {
  beforeEach(() => {
    // Setup: Mock environment variables
    process.env.AIRTABLE_ACCESS_TOKEN = 'pat_test_token';
    process.env.AIRTABLE_BASE_ID = 'appTest123';
    process.env.AIRTABLE_TABLE_NAME = 'tblTest456';
  });

  afterEach(() => {
    // Cleanup: Clear mocks
    jest.clearAllMocks();
  });

  test('should create time entry with correct fields', async () => {
    // Arrange
    const mockEntry = {
      date: '2026-03-01',
      timeIn: '09:00',
      timeOut: '17:00',
      hours: '8.00',
      description: 'Test work',
      winOfDay: 'Completed feature',
      tomorrowPlan: 'Review code'
    };

    // Act
    const result = await createTimeEntry(mockEntry);

    // Assert
    expect(result).toHaveProperty('id');
    expect(result.Date).toBe(mockEntry.date);
  });
});
```

### Component Testing Pattern

For React components using React Testing Library:

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TimeTrackingApp from '@/components/TimeTrackingApp';

describe('TimeTrackingApp', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  test('should calculate hours when time in and out are entered', async () => {
    render(<TimeTrackingApp />);

    const timeInInput = screen.getByLabelText(/Time In/i);
    const timeOutInput = screen.getByLabelText(/Time Out/i);
    const hoursDisplay = screen.getByDisplayValue(/Calculated automatically/i);

    fireEvent.change(timeInInput, { target: { value: '09:00' } });
    fireEvent.change(timeOutInput, { target: { value: '17:00' } });

    await waitFor(() => {
      expect(hoursDisplay).toHaveValue('8.00');
    });
  });
});
```

### API Route Testing Pattern

For Next.js API routes:

```javascript
import { POST, GET } from '@/app/api/time-entries/route';

describe('/api/time-entries', () => {
  test('POST should validate required fields', async () => {
    const mockRequest = {
      json: async () => ({
        date: '2026-03-01',
        timeIn: '09:00',
        timeOut: '17:00',
        description: ''  // Missing required field
      })
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  test('GET should return entries array', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.entries)).toBe(true);
  });
});
```

## Mocking

### Framework:** Jest (recommended for Next.js)

### Patterns:

**Mocking Airtable Client:**
```javascript
jest.mock('airtable', () => {
  return jest.fn(() => ({
    base: jest.fn(() => jest.fn(() => ({
      create: jest.fn().mockResolvedValue([{ id: 'rec123', fields: {...} }]),
      select: jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([])
      })
    })))
  }));
});
```

**Mocking Fetch for API Calls:**
```javascript
global.fetch = jest.fn((url, options) => {
  if (url.includes('/api/time-entries')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ entries: [] })
    });
  }
  return Promise.reject(new Error('Unhandled fetch'));
});
```

**Mocking Environment Variables:**
```javascript
beforeEach(() => {
  process.env.AIRTABLE_ACCESS_TOKEN = 'pat_mock_token';
  process.env.HOURLY_RATE = '25';
});

afterEach(() => {
  delete process.env.AIRTABLE_ACCESS_TOKEN;
  delete process.env.HOURLY_RATE;
});
```

### What to Mock:
- External API calls (Airtable SDK)
- Fetch requests
- Environment variables
- Date/time (for invoice period tests)

### What NOT to Mock:
- `calculateHours()` function (simple arithmetic)
- Tailwind/styling utilities
- React hooks in isolation (test component behavior instead)

## Test Coverage Targets

**Recommended Minimums:**
- **Critical business logic** (Airtable operations, calculations): 80%+ coverage
- **Component state management**: 70%+ coverage
- **UI rendering**: 50%+ (snapshot tests acceptable)
- **Overall target**: 60%+ initially, scale to 75%+ over time

**Gaps to Address First:**
1. Invoice entry grouping logic in `src/app/api/invoices/entries/route.js`
2. Airtable field validation and error scenarios in `src/lib/airtable.js`
3. Form validation in `TimeTrackingApp.jsx`
4. Time calculation edge cases (midnight crossing, negative times)

## Test Running Strategy

**Suggested Configuration:**

```json
// package.json additions
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.js',
    '!src/components/ui/**'
  ]
};
```

## Integration Testing Considerations

**Airtable Integration:**
- Use test base/table separate from production
- Create fixtures with known data before test suite
- Clean up test records after test completion
- Test both happy path and error scenarios (403, 404, rate limits)

**Invoice Generation:**
- Integration test: fetch entries → group by month → calculate totals → verify PDF output
- Mock PDF generation to avoid file I/O in unit tests
- Test with data spanning multiple months

## Continuous Testing Strategy

**Pre-commit Hooks:**
- Run linter (already configured): `npm run lint`
- Add pre-commit test checks via Husky (recommended)

**Testing Workflow:**
1. Write test first (TDD optional but recommended for bug fixes)
2. Run tests locally: `npm run test`
3. Maintain watch mode during development: `npm run test:watch`
4. Check coverage before PR: `npm run test:coverage`

---

*Testing analysis: 2026-03-01*
