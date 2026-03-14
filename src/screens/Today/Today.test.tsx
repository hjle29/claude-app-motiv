// jest.mock must appear before all imports
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    addDailyOverride: jest.fn(),
    getDailyLogs: jest.fn().mockReturnValue([]),
    getDailyOverrideIds: jest.fn().mockReturnValue([]),
    getRoutines: jest.fn().mockReturnValue([]),
    saveDailyLog: jest.fn(),
  },
}));

import { render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import Today from './Today';

function renderToday() {
  return render(
    <TestAppWrapper>
      <Today />
    </TestAppWrapper>,
  );
}

describe('Today', () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders today's date cell in the calendar", () => {
    renderToday();
    const today = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
    expect(screen.getByTestId(`calendar-day-${today}`)).toBeTruthy();
  });

  it('renders add routine button when no routines', () => {
    renderToday();
    expect(screen.getByTestId('add-routine-button')).toBeTruthy();
  });
});
