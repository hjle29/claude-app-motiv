import type { DailyLog, Routine } from '@/store/schemas';

import { dailyLogSchema, routineSchema } from '@/store/schemas';
import { appStorage } from '@/store/storage';

const DAILY_LOGS_KEY = 'dailyLogs';
const ROUTINES_KEY = 'routines';

function getRoutines(): Routine[] {
  const raw = appStorage.getString(ROUTINES_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as unknown[]).map(r => routineSchema.parse(r));
  } catch {
    return [];
  }
}

function saveRoutine(routine: Routine): void {
  const current = getRoutines();
  const existingIndex = current.findIndex(r => r.id === routine.id);
  const updated =
    existingIndex >= 0
      ? current.map(r => (r.id === routine.id ? routine : r))
      : [...current, routine];
  appStorage.set(ROUTINES_KEY, JSON.stringify(updated));
}

function deleteRoutine(routineId: string): void {
  const updated = getRoutines().filter(r => r.id !== routineId);
  appStorage.set(ROUTINES_KEY, JSON.stringify(updated));
}

function getDailyLogs(date: string): DailyLog[] {
  const raw = appStorage.getString(DAILY_LOGS_KEY);
  if (!raw) return [];
  try {
    const all = (JSON.parse(raw) as unknown[]).map(l => dailyLogSchema.parse(l));
    return all.filter(l => l.date === date);
  } catch {
    return [];
  }
}

function saveDailyLog(log: DailyLog): void {
  const raw = appStorage.getString(DAILY_LOGS_KEY);
  const all: DailyLog[] = raw
    ? (JSON.parse(raw) as unknown[]).map(l => dailyLogSchema.parse(l))
    : [];
  const existingIndex = all.findIndex(
    l => l.routineId === log.routineId && l.date === log.date,
  );
  const updated =
    existingIndex >= 0
      ? all.map((l, i) => (i === existingIndex ? log : l))
      : [...all, log];
  appStorage.set(DAILY_LOGS_KEY, JSON.stringify(updated));
}

export const routineStore = {
  deleteRoutine,
  getDailyLogs,
  getRoutines,
  saveDailyLog,
  saveRoutine,
};
