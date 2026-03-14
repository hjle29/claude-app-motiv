// jest.mock must appear before imports — Babel hoists it, but keep it first in source
jest.mock('@/store/storage', () => {
  const store: Record<string, string> = {};
  return {
    appStorage: {
      delete: (key: string) => { delete store[key]; },
      getString: (key: string) => store[key] ?? undefined,
      set: (key: string, value: string) => { store[key] = value; },
    },
  };
});

import { routineStore } from '@/store/routineStore';

const makeRoutine = (id: string) => ({
  id,
  name: 'Study English',
  schedule: { days: ['Mon' as const, 'Wed' as const], type: 'weekdays' as const },
  tags: ['english'],
});

describe('routineStore', () => {
  beforeEach(() => {
    routineStore.deleteRoutine('r-1');
    routineStore.deleteRoutine('r-2');
  });

  it('returns empty array when no routines stored', () => {
    expect(routineStore.getRoutines()).toEqual([]);
  });

  it('saves and retrieves a routine', () => {
    routineStore.saveRoutine(makeRoutine('r-1'));
    expect(routineStore.getRoutines()).toHaveLength(1);
  });

  it('deletes a routine', () => {
    routineStore.saveRoutine(makeRoutine('r-2'));
    routineStore.deleteRoutine('r-2');
    const remaining = routineStore.getRoutines().filter(r => r.id === 'r-2');
    expect(remaining).toHaveLength(0);
  });

  it('saves and retrieves a daily log for a specific date', () => {
    routineStore.saveDailyLog({
      date: '2026-03-12',
      routineId: 'r-1',
      status: 'completed',
    });
    const logs = routineStore.getDailyLogs('2026-03-12');
    expect(logs).toHaveLength(1);
    expect(logs[0].status).toBe('completed');
  });

  it('saves a skipped log with reason', () => {
    routineStore.saveDailyLog({
      date: '2026-03-13',
      routineId: 'r-1',
      skipReason: 'sick',
      status: 'skipped',
    });
    const logs = routineStore.getDailyLogs('2026-03-13');
    expect(logs[0].skipReason).toBe('sick');
  });
});

describe('dailyOverride', () => {
  it('returns empty array when no overrides for a date', () => {
    expect(routineStore.getDailyOverrideIds('2026-03-12')).toEqual([]);
  });

  it('adds a routine id to a date override', () => {
    routineStore.addDailyOverride('2026-03-15', 'r-override-1');
    expect(routineStore.getDailyOverrideIds('2026-03-15')).toContain('r-override-1');
  });

  it('does not duplicate the same routine on the same date', () => {
    routineStore.addDailyOverride('2026-03-16', 'r-dup');
    routineStore.addDailyOverride('2026-03-16', 'r-dup');
    const ids = routineStore.getDailyOverrideIds('2026-03-16');
    expect(ids.filter(id => id === 'r-dup')).toHaveLength(1);
  });
});
