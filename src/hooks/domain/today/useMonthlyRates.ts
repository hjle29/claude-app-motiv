import type { DailyLog } from '@/store/schemas';
import { routineStore } from '@/store/routineStore';

import { isRoutineScheduledOnDate } from './scheduleUtils';

function calcRate(routineIds: string[], logs: DailyLog[]): number {
  if (routineIds.length === 0) return 0;
  const relevant = logs.filter(l => routineIds.includes(l.routineId));
  const skipped = relevant.filter(l => l.status === 'skipped').length;
  const completed = relevant.filter(l => l.status === 'completed').length;
  const denominator = routineIds.length - skipped;
  if (denominator === 0) return 0;
  return completed / denominator;
}

// month is 0-indexed (0=Jan, 2=Mar)
function useMonthlyRates(year: number, month: number): Record<string, number> {
  const allRoutines = routineStore.getRoutines();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rates: Record<string, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const scheduled = allRoutines.filter(r => isRoutineScheduledOnDate(r, date));
    const overrideIds = routineStore.getDailyOverrideIds(date);
    const overrides = allRoutines.filter(
      r => overrideIds.includes(r.id) && !scheduled.some(s => s.id === r.id),
    );
    const allIds = [...scheduled, ...overrides].map(r => r.id);
    const logs = routineStore.getDailyLogs(date);
    rates[date] = calcRate(allIds, logs);
  }

  return rates;
}

export { useMonthlyRates };
