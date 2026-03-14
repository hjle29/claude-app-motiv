import type { Step } from '@/store/schemas';

import { stepSchema } from '@/store/schemas';
import { appStorage } from '@/store/storage';

const STEPS_KEY = 'steps';

function getAllSteps(): Step[] {
  const raw = appStorage.getString(STEPS_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as unknown[]).flatMap(s => {
      try {
        return [stepSchema.parse(s)];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

function getStepsByGoalId(goalId: string): Step[] {
  return getAllSteps().filter(s => s.goalId === goalId);
}

function saveStep(step: Step): void {
  const current = getAllSteps();
  const existingIndex = current.findIndex(s => s.id === step.id);
  const updated =
    existingIndex >= 0
      ? current.map(s => (s.id === step.id ? step : s))
      : [...current, step];
  appStorage.set(STEPS_KEY, JSON.stringify(updated));
}

function deleteStep(stepId: string): void {
  const updated = getAllSteps().filter(s => s.id !== stepId);
  appStorage.set(STEPS_KEY, JSON.stringify(updated));
}

export const stepStore = {
  deleteStep,
  getStepsByGoalId,
  saveStep,
};
