import { useCallback, useState } from 'react';

import type { FutureSelf, Goal } from '@/store/schemas';

import { goalStore } from '@/store/goalStore';

function useGoals() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const allGoals = goalStore.getGoals();
  const goals = allGoals.filter(g => !g.archivedAt);

  const addGoal = useCallback(
    (goal: Goal) => {
      goalStore.saveGoal(goal);
      refresh();
    },
    [refresh],
  );

  const updateGoal = useCallback(
    (goal: Goal) => {
      goalStore.saveGoal(goal);
      refresh();
    },
    [refresh],
  );

  const archiveGoal = useCallback(
    (goalId: string) => {
      const goal = goalStore.getGoals().find(g => g.id === goalId);
      if (!goal) return;
      goalStore.saveGoal({ ...goal, archivedAt: new Date().toISOString() });
      refresh();
    },
    [refresh],
  );

  const futureSelfFor = useCallback((goalId: string): FutureSelf[] => {
    return goalStore.getFutureSelf(goalId);
  }, []);

  return { addGoal, archiveGoal, futureSelfFor, goals, updateGoal };
}

export { useGoals };
