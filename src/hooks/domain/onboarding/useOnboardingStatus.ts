import { goalStore } from '@/store/goalStore';

function useOnboardingStatus() {
  const goals = goalStore.getGoals();
  return { isComplete: goals.length > 0 };
}

export { useOnboardingStatus };
