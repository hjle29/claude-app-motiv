// jest.mock must appear before imports — Babel hoists it, keep it first in source
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

import { stepStore } from '@/store/stepStore';

const makeStep = (id: string, goalId = 'goal-1') => ({
  deadline: '2027-06-01',
  description: `Step ${id}`,
  goalId,
  id,
  isDone: false,
  keywords: ['health'],
  linkedRoutineIds: [] as string[],
});

describe('stepStore', () => {
  beforeEach(() => {
    stepStore.deleteStep('s-1');
    stepStore.deleteStep('s-2');
    stepStore.deleteStep('s-3');
  });

  it('returns empty array for unknown goalId', () => {
    expect(stepStore.getStepsByGoalId('goal-unknown')).toEqual([]);
  });

  it('saves and retrieves steps filtered by goalId', () => {
    stepStore.saveStep(makeStep('s-1', 'goal-1'));
    stepStore.saveStep(makeStep('s-2', 'goal-2'));
    const result = stepStore.getStepsByGoalId('goal-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('s-1');
  });

  it('updates an existing step in place', () => {
    stepStore.saveStep(makeStep('s-1'));
    stepStore.saveStep({ ...makeStep('s-1'), description: 'Updated' });
    const steps = stepStore.getStepsByGoalId('goal-1');
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toBe('Updated');
  });

  it('deletes a step', () => {
    stepStore.saveStep(makeStep('s-1'));
    stepStore.deleteStep('s-1');
    expect(stepStore.getStepsByGoalId('goal-1')).toHaveLength(0);
  });

  it('saves and retrieves linkedRoutineIds', () => {
    stepStore.saveStep({ ...makeStep('s-1'), linkedRoutineIds: ['r-1', 'r-2'] });
    const steps = stepStore.getStepsByGoalId('goal-1');
    expect(steps[0].linkedRoutineIds).toEqual(['r-1', 'r-2']);
  });
});
