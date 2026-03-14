import { useCallback, useState } from 'react';

import type { Step } from '@/store/schemas';

import { stepStore } from '@/store/stepStore';

function useSteps(goalId: string) {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const steps = stepStore.getStepsByGoalId(goalId);
  const completedCount = steps.filter(s => s.isDone).length;

  const addStep = useCallback(
    (step: Step) => {
      stepStore.saveStep(step);
      refresh();
    },
    [refresh],
  );

  const updateStep = useCallback(
    (step: Step) => {
      stepStore.saveStep(step);
      refresh();
    },
    [refresh],
  );

  const deleteStep = useCallback(
    (stepId: string) => {
      stepStore.deleteStep(stepId);
      refresh();
    },
    [refresh],
  );

  const toggleDone = useCallback(
    (stepId: string) => {
      const step = stepStore.getStepsByGoalId(goalId).find(s => s.id === stepId);
      if (!step) return;
      stepStore.saveStep({ ...step, isDone: !step.isDone });
      refresh();
    },
    [goalId, refresh],
  );

  return { addStep, completedCount, deleteStep, steps, toggleDone, updateStep };
}

export { useSteps };
