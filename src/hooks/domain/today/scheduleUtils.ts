import type { Routine } from '@/store/schemas';

type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

const DAY_MAP: Record<number, Weekday> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export function isRoutineScheduledOnDate(routine: Routine, date: string): boolean {
  const { schedule } = routine;
  if (schedule.type === 'dateRange') {
    return date >= schedule.startDate && date <= schedule.endDate;
  }
  const dayIndex = new Date(date).getDay();
  return (schedule.days as string[]).includes(DAY_MAP[dayIndex]);
}
