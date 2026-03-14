// jest.mock must appear before all imports
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getDailyLogs: jest.fn().mockReturnValue([]),
    getDailyOverrideIds: jest.fn().mockReturnValue([]),
    getRoutines: jest.fn().mockReturnValue([]),
  },
}));

import { renderHook } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';

import { useMonthlyRates } from './useMonthlyRates';

describe('useMonthlyRates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a rate for every day of the month', () => {
    const { result } = renderHook(() => useMonthlyRates(2026, 2)); // March 2026 (month=2)
    const keys = Object.keys(result.current);
    expect(keys).toHaveLength(31);
    expect(keys[0]).toBe('2026-03-01');
    expect(keys[30]).toBe('2026-03-31');
  });

  it('returns 0 for all days when no routines', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useMonthlyRates(2026, 2));
    Object.values(result.current).forEach(rate => expect(rate).toBe(0));
  });
});
