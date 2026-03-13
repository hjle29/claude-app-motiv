// jest.mock must appear before imports (Babel hoists it, but keep it first in source)
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getGoals: jest.fn(),
  },
}));

import { renderHook } from '@testing-library/react-native';

import { goalStore } from '@/store/goalStore';

import { useOnboardingStatus } from './useOnboardingStatus';

describe('useOnboardingStatus', () => {
  it('returns isComplete false when no goals exist', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useOnboardingStatus());
    expect(result.current.isComplete).toBe(false);
  });

  it('returns isComplete true when at least one goal exists', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      {
        category: 'Family',
        createdAt: new Date().toISOString(),
        id: 'goal-1',
        keywords: ['marriage'],
        statement: 'Happy family',
      },
    ]);
    const { result } = renderHook(() => useOnboardingStatus());
    expect(result.current.isComplete).toBe(true);
  });
});
