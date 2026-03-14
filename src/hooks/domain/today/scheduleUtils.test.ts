import { isRoutineScheduledOnDate } from './scheduleUtils';

const weekdayRoutine = {
  id: 'r-1',
  name: 'Study',
  schedule: { days: ['Mon', 'Wed', 'Fri'] as const, type: 'weekdays' as const },
  tags: [],
};

const rangeRoutine = {
  id: 'r-2',
  name: 'Run',
  schedule: { endDate: '2026-12-31', startDate: '2026-01-01', type: 'dateRange' as const },
  tags: [],
};

describe('isRoutineScheduledOnDate', () => {
  it('matches a weekday routine on a matching day (Monday)', () => {
    expect(isRoutineScheduledOnDate(weekdayRoutine, '2026-03-09')).toBe(true); // Monday
  });

  it('does not match a weekday routine on a non-matching day (Tuesday)', () => {
    expect(isRoutineScheduledOnDate(weekdayRoutine, '2026-03-10')).toBe(false); // Tuesday
  });

  it('matches a dateRange routine when within range', () => {
    expect(isRoutineScheduledOnDate(rangeRoutine, '2026-06-15')).toBe(true);
  });

  it('does not match a dateRange routine outside range', () => {
    expect(isRoutineScheduledOnDate(rangeRoutine, '2025-12-31')).toBe(false);
  });
});
