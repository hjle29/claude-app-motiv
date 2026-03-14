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

import { goalStore } from '@/store/goalStore';

const makeGoal = (n: number) => ({
  category: 'Health',
  createdAt: new Date().toISOString(),
  id: `goal-${n}`,
  keywords: ['health'],
  statement: `Goal ${n}`,
});

describe('goalStore', () => {
  beforeEach(() => {
    goalStore.deleteGoal('goal-1');
    goalStore.deleteGoal('goal-2');
    goalStore.deleteGoal('goal-3');
    goalStore.deleteGoal('goal-4');
  });

  it('returns empty array when no goals stored', () => {
    expect(goalStore.getGoals()).toEqual([]);
  });

  it('saves and retrieves a goal', () => {
    goalStore.saveGoal(makeGoal(1));
    expect(goalStore.getGoals()).toHaveLength(1);
    expect(goalStore.getGoals()[0].id).toBe('goal-1');
  });

  it('updates an existing goal in place', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.saveGoal({ ...makeGoal(1), statement: 'Updated' });
    expect(goalStore.getGoals()).toHaveLength(1);
    expect(goalStore.getGoals()[0].statement).toBe('Updated');
  });

  it('enforces maximum of 3 goals', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.saveGoal(makeGoal(2));
    goalStore.saveGoal(makeGoal(3));
    expect(() => goalStore.saveGoal(makeGoal(4))).toThrow('Maximum of 3 goals allowed');
  });

  it('deletes a goal', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.deleteGoal('goal-1');
    expect(goalStore.getGoals()).toHaveLength(0);
  });

  it('does not count archived goals toward the maximum', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.saveGoal(makeGoal(2));
    goalStore.saveGoal(makeGoal(3));
    // Archive goal-3 (upsert — no new slot consumed)
    goalStore.saveGoal({ ...makeGoal(3), archivedAt: '2026-03-12T00:00:00.000Z' });
    // Only 2 active goals, so adding goal-4 must succeed
    expect(() => goalStore.saveGoal(makeGoal(4))).not.toThrow();
  });
});
