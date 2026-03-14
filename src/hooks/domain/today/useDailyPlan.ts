import { useCallback, useState } from 'react';

import type { DailyLog, Routine } from '@/store/schemas';
import { routineStore } from '@/store/routineStore';

import { isRoutineScheduledOnDate } from './scheduleUtils';

export type DailyPlanRoutine = Routine & { log: DailyLog | null };

type DailyPlan = {
  addDailyOverride: (routineId: string) => void;
  completionRate: number;
  markComplete: (routineId: string) => void;
  markSkipped: (routineId: string, reason: string) => void;
  routines: DailyPlanRoutine[];
};

function calculateCompletionRate(routines: DailyPlanRoutine[]): number {
  if (routines.length === 0) return 0;
  const skipped = routines.filter(r => r.log?.status === 'skipped').length;
  const completed = routines.filter(r => r.log?.status === 'completed').length;
  const denominator = routines.length - skipped;
  if (denominator === 0) return 0;
  return completed / denominator;
}

function useDailyPlan(date: string): DailyPlan {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const allRoutines = routineStore.getRoutines();
  const overrideIds = routineStore.getDailyOverrideIds(date);
  const logs = routineStore.getDailyLogs(date);

  const scheduled = allRoutines.filter(r => isRoutineScheduledOnDate(r, date));
  const overrides = allRoutines.filter(
    r => overrideIds.includes(r.id) && !scheduled.some(s => s.id === r.id),
  );

  const routines: DailyPlanRoutine[] = [...scheduled, ...overrides].map(r => ({
    ...r,
    log: logs.find(l => l.routineId === r.id) ?? null,
  }));

  const completionRate = calculateCompletionRate(routines);

  const markComplete = useCallback(
    (routineId: string) => {
      routineStore.saveDailyLog({ date, routineId, status: 'completed' });
      refresh();
    },
    [date, refresh],
  );

  const markSkipped = useCallback(
    (routineId: string, reason: string) => {
      routineStore.saveDailyLog({ date, routineId, skipReason: reason, status: 'skipped' });
      refresh();
    },
    [date, refresh],
  );

  const addDailyOverride = useCallback(
    (routineId: string) => {
      routineStore.addDailyOverride(date, routineId);
      refresh();
    },
    [date, refresh],
  );

  return { addDailyOverride, completionRate, markComplete, markSkipped, routines };
}

export { useDailyPlan };
