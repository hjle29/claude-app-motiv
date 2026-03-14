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

const DAILY_OVERRIDES_KEY = 'dailyOverrides';

function getDailyOverrideIds(date: string): string[] {
  const raw = appStorage.getString(DAILY_OVERRIDES_KEY);
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as Record<string, string[]>;
    return all[date] ?? [];
  } catch {
    return [];
  }
}

function addDailyOverride(date: string, routineId: string): void {
  const raw = appStorage.getString(DAILY_OVERRIDES_KEY);
  const all: Record<string, string[]> = raw
    ? (JSON.parse(raw) as Record<string, string[]>)
    : {};
  const existing = all[date] ?? [];
  if (existing.includes(routineId)) return;
  appStorage.set(
    DAILY_OVERRIDES_KEY,
    JSON.stringify({ ...all, [date]: [...existing, routineId] }),
  );
}

export const routineStore = {
  addDailyOverride,
  deleteRoutine,
  getDailyLogs,
  getDailyOverrideIds,
  getRoutines,
  saveDailyLog,
  saveRoutine,
};
