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

import { renderHook } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';

import { useDailyPlan } from './useDailyPlan';

const monday = '2026-03-09';

const weekdayRoutine = {
  id: 'r-weekday',
  name: 'Study English',
  schedule: { days: ['Mon', 'Wed', 'Fri'] as const, type: 'weekdays' as const },
  tags: ['english'],
};

const dateRangeRoutine = {
  id: 'r-range',
  name: 'Morning run',
  schedule: { endDate: '2026-12-31', startDate: '2026-01-01', type: 'dateRange' as const },
  tags: ['health'],
};

describe('useDailyPlan — routines', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty routines when none scheduled', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.routines).toHaveLength(0);
  });

  it('includes a weekday routine on a matching day', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.routines.map(r => r.id)).toContain('r-weekday');
  });

  it('excludes a weekday routine on a non-matching day', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan('2026-03-10')); // Tuesday
    expect(result.current.routines.map(r => r.id)).not.toContain('r-weekday');
  });

  it('includes a dateRange routine when date is within range', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([dateRangeRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.routines.map(r => r.id)).toContain('r-range');
  });
});

describe('useDailyPlan — completion rate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calculates completion rate correctly', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine, dateRangeRoutine]);
    (routineStore.getDailyLogs as jest.Mock).mockReturnValue([
      { date: monday, routineId: 'r-weekday', status: 'completed' },
      { date: monday, routineId: 'r-range', status: 'pending' },
    ]);
    const { result } = renderHook(() => useDailyPlan(monday));
    // 1 completed, 0 skipped, 2 total → 1/2 = 0.5
    expect(result.current.completionRate).toBe(0.5);
  });

  it('excludes skipped routines from denominator', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine, dateRangeRoutine]);
    (routineStore.getDailyLogs as jest.Mock).mockReturnValue([
      { date: monday, routineId: 'r-weekday', status: 'completed' },
      { date: monday, routineId: 'r-range', status: 'skipped', skipReason: 'sick' },
    ]);
    const { result } = renderHook(() => useDailyPlan(monday));
    // 1 completed, 1 skipped, 2 total → 1/(2-1) = 1.0
    expect(result.current.completionRate).toBe(1);
  });

  it('returns 0 when all routines are skipped', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    (routineStore.getDailyLogs as jest.Mock).mockReturnValue([
      { date: monday, routineId: 'r-weekday', status: 'skipped', skipReason: 'sick' },
    ]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.completionRate).toBe(0);
  });
});

describe('useDailyPlan — mutations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('markComplete calls saveDailyLog with completed status', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    result.current.markComplete('r-weekday');
    expect(routineStore.saveDailyLog).toHaveBeenCalledWith({
      date: monday,
      routineId: 'r-weekday',
      status: 'completed',
    });
  });

  it('markSkipped calls saveDailyLog with skipped status and reason', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    result.current.markSkipped('r-weekday', 'Sick');
    expect(routineStore.saveDailyLog).toHaveBeenCalledWith({
      date: monday,
      routineId: 'r-weekday',
      skipReason: 'Sick',
      status: 'skipped',
    });
  });
});
