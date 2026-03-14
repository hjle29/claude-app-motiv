// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getFutureSelf: jest.fn(),
    getGoals: jest.fn(),
    saveGoal: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react-native';

import { goalStore } from '@/store/goalStore';

import { useGoals } from './useGoals';

const makeGoal = (id: string, archivedAt?: string) => ({
  archivedAt,
  category: 'Health',
  createdAt: '2026-03-12T00:00:00.000Z',
  id,
  keywords: ['health'],
  statement: `Goal ${id}`,
});

beforeEach(() => {
  jest.clearAllMocks();
  (goalStore.getFutureSelf as jest.Mock).mockReturnValue([]);
});

describe('useGoals', () => {
  it('returns empty list when no goals stored', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useGoals());
    expect(result.current.goals).toEqual([]);
  });

  it('filters out archived goals from active list', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      makeGoal('g-1'),
      makeGoal('g-2', '2026-03-12T00:00:00.000Z'),
    ]);
    const { result } = renderHook(() => useGoals());
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].id).toBe('g-1');
  });

  it('addGoal calls saveGoal on the store', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useGoals());
    act(() => {
      result.current.addGoal(makeGoal('g-1'));
    });
    expect(goalStore.saveGoal).toHaveBeenCalledWith(makeGoal('g-1'));
  });

  it('updateGoal calls saveGoal on the store', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([makeGoal('g-1')]);
    const { result } = renderHook(() => useGoals());
    act(() => {
      result.current.updateGoal({ ...makeGoal('g-1'), statement: 'Updated' });
    });
    expect(goalStore.saveGoal).toHaveBeenCalledWith(
      expect.objectContaining({ statement: 'Updated' }),
    );
  });

  it('archiveGoal saves goal with archivedAt set', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([makeGoal('g-1')]);
    const { result } = renderHook(() => useGoals());
    act(() => {
      result.current.archiveGoal('g-1');
    });
    const saved = (goalStore.saveGoal as jest.Mock).mock.calls[0][0];
    expect(saved.id).toBe('g-1');
    expect(saved.archivedAt).toBeDefined();
  });

  it('futureSelfFor delegates to goalStore.getFutureSelf', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    (goalStore.getFutureSelf as jest.Mock).mockReturnValue([
      { goalId: 'g-1', narrative: 'I am living my dream.', timeframe: '5yr' },
    ]);
    const { result } = renderHook(() => useGoals());
    const narratives = result.current.futureSelfFor('g-1');
    expect(narratives).toHaveLength(1);
    expect(narratives[0].timeframe).toBe('5yr');
  });
});
