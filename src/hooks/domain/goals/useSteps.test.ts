// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/stepStore', () => ({
  stepStore: {
    deleteStep: jest.fn(),
    getStepsByGoalId: jest.fn(),
    saveStep: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react-native';

import { stepStore } from '@/store/stepStore';

import { useSteps } from './useSteps';

const makeStep = (id: string) => ({
  deadline: '2027-06-01',
  description: `Step ${id}`,
  goalId: 'goal-1',
  id,
  isDone: false,
  keywords: ['health'],
  linkedRoutineIds: [] as string[],
});

beforeEach(() => {
  jest.clearAllMocks();
  (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([]);
});

describe('useSteps', () => {
  it('returns empty steps for unknown goalId', () => {
    const { result } = renderHook(() => useSteps('goal-unknown'));
    expect(result.current.steps).toEqual([]);
  });

  it('returns steps for the given goalId', () => {
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([makeStep('s-1')]);
    const { result } = renderHook(() => useSteps('goal-1'));
    expect(result.current.steps).toHaveLength(1);
  });

  it('addStep calls saveStep on the store', () => {
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.addStep(makeStep('s-1'));
    });
    expect(stepStore.saveStep).toHaveBeenCalledWith(makeStep('s-1'));
  });

  it('deleteStep calls deleteStep on the store', () => {
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.deleteStep('s-1');
    });
    expect(stepStore.deleteStep).toHaveBeenCalledWith('s-1');
  });

  it('toggleDone flips isDone and saves the updated step', () => {
    const step = makeStep('s-1');
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([step]);
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.toggleDone('s-1');
    });
    expect(stepStore.saveStep).toHaveBeenCalledWith({ ...step, isDone: true });
  });

  it('completedCount counts steps with isDone true', () => {
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([
      { ...makeStep('s-1'), isDone: true },
      { ...makeStep('s-2'), isDone: false },
    ]);
    const { result } = renderHook(() => useSteps('goal-1'));
    expect(result.current.completedCount).toBe(1);
  });

  it('updateStep calls saveStep with the updated step', () => {
    const step = makeStep('s-1');
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([step]);
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.updateStep({ ...step, linkedRoutineIds: ['r-1'] });
    });
    expect(stepStore.saveStep).toHaveBeenCalledWith(
      expect.objectContaining({ linkedRoutineIds: ['r-1'] }),
    );
  });
});
