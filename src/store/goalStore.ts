import type { FutureSelf, Goal } from '@/store/schemas';

import { futureSelfSchema, goalSchema } from '@/store/schemas';
import { appStorage } from '@/store/storage';

const FUTURE_SELVES_KEY = 'futureSelf';
const GOALS_KEY = 'goals';
const MAX_GOALS = 3;

function getGoals(): Goal[] {
  const raw = appStorage.getString(GOALS_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as unknown[]).map(g => goalSchema.parse(g));
  } catch {
    return [];
  }
}

function saveGoal(goal: Goal): void {
  const current = getGoals();
  const existingIndex = current.findIndex(g => g.id === goal.id);
  let updated: Goal[];
  if (existingIndex >= 0) {
    updated = current.map(g => (g.id === goal.id ? goal : g));
  } else {
    if (current.length >= MAX_GOALS) {
      throw new Error(`Maximum of ${MAX_GOALS} goals allowed`);
    }
    updated = [...current, goal];
  }
  appStorage.set(GOALS_KEY, JSON.stringify(updated));
}

function deleteGoal(goalId: string): void {
  const updated = getGoals().filter(g => g.id !== goalId);
  appStorage.set(GOALS_KEY, JSON.stringify(updated));
}

function getFutureSelf(goalId: string): FutureSelf[] {
  const raw = appStorage.getString(FUTURE_SELVES_KEY);
  if (!raw) return [];
  try {
    const all = (JSON.parse(raw) as unknown[]).map(f => futureSelfSchema.parse(f));
    return all.filter(f => f.goalId === goalId);
  } catch {
    return [];
  }
}

function saveFutureSelf(entry: FutureSelf): void {
  const raw = appStorage.getString(FUTURE_SELVES_KEY);
  const all: FutureSelf[] = raw
    ? (JSON.parse(raw) as unknown[]).map(f => futureSelfSchema.parse(f))
    : [];
  const existingIndex = all.findIndex(
    f => f.goalId === entry.goalId && f.timeframe === entry.timeframe,
  );
  const updated =
    existingIndex >= 0
      ? all.map((f, i) => (i === existingIndex ? entry : f))
      : [...all, entry];
  appStorage.set(FUTURE_SELVES_KEY, JSON.stringify(updated));
}

export const goalStore = {
  deleteGoal,
  getFutureSelf,
  getGoals,
  saveFutureSelf,
  saveGoal,
};
