// jest.mock must appear before all imports (Babel hoists at runtime, but keep first in source)
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    deleteGoal: jest.fn(),
    getGoals: jest.fn().mockReturnValue([]),
    saveGoal: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset }),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import GoalSetup from './GoalSetup';

const mockNavigate = jest.fn();
const mockReset = jest.fn();

function renderGoalSetup() {
  return render(
    <TestAppWrapper>
      <GoalSetup />
    </TestAppWrapper>,
  );
}

describe('GoalSetup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the goal input and category buttons', () => {
    renderGoalSetup();
    expect(screen.getByTestId('goal-text-input')).toBeTruthy();
    expect(screen.getByTestId('category-family')).toBeTruthy();
    expect(screen.getByTestId('category-health')).toBeTruthy();
  });

  it('tapping a category shows the Q&A flow', () => {
    renderGoalSetup();
    fireEvent.press(screen.getByTestId('category-family'));
    expect(screen.getByText('What matters most to you about family?')).toBeTruthy();
  });

  it('Continue button is disabled with no goals', () => {
    renderGoalSetup();
    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });
});
