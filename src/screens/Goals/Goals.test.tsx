// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getFutureSelf: jest.fn(),
    getGoals: jest.fn(),
    saveGoal: jest.fn(),
  },
}));
jest.mock('@/store/stepStore', () => ({
  stepStore: {
    deleteStep: jest.fn(),
    getStepsByGoalId: jest.fn(),
    saveStep: jest.fn(),
  },
}));
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getRoutines: jest.fn(),
  },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import { goalStore } from '@/store/goalStore';
import { routineStore } from '@/store/routineStore';
import { stepStore } from '@/store/stepStore';
import TestAppWrapper from '@/tests/TestAppWrapper';

import Goals from './Goals';

beforeEach(() => {
  jest.clearAllMocks();
  (goalStore.getGoals as jest.Mock).mockReturnValue([]);
  (goalStore.getFutureSelf as jest.Mock).mockReturnValue([]);
  (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([]);
  (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
});

describe('Goals screen', () => {
  it('renders with testID', () => {
    render(
      <TestAppWrapper>
        <Goals />
      </TestAppWrapper>,
    );
    expect(screen.getByTestId('screen-goals')).toBeTruthy();
  });

  it('shows empty state when no goals', () => {
    render(
      <TestAppWrapper>
        <Goals />
      </TestAppWrapper>,
    );
    expect(screen.getByText('No goals yet.')).toBeTruthy();
  });

  it('renders a GoalCard for each active goal', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      {
        category: 'Health',
        createdAt: '2026-03-12T00:00:00.000Z',
        id: 'g-1',
        keywords: ['health'],
        statement: 'Get fit',
      },
    ]);
    render(
      <TestAppWrapper>
        <Goals />
      </TestAppWrapper>,
    );
    expect(screen.getByText('Get fit')).toBeTruthy();
  });

  it('shows Add Goal button when fewer than 3 active goals', () => {
    render(
      <TestAppWrapper>
        <Goals />
      </TestAppWrapper>,
    );
    expect(screen.getByTestId('goals-add-button')).toBeTruthy();
  });

  it('hides Add Goal button when 3 active goals exist', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      { category: 'Health', createdAt: '2026-03-12T00:00:00.000Z', id: 'g-1', keywords: ['a'], statement: 'Goal 1' },
      { category: 'Health', createdAt: '2026-03-12T00:00:00.000Z', id: 'g-2', keywords: ['b'], statement: 'Goal 2' },
      { category: 'Health', createdAt: '2026-03-12T00:00:00.000Z', id: 'g-3', keywords: ['c'], statement: 'Goal 3' },
    ]);
    render(
      <TestAppWrapper>
        <Goals />
      </TestAppWrapper>,
    );
    expect(screen.queryByTestId('goals-add-button')).toBeNull();
  });

  it('opens GoalWizard when Add Goal is pressed', () => {
    render(
      <TestAppWrapper>
        <Goals />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goals-add-button'));
    expect(screen.getByTestId('wizard-next')).toBeTruthy();
  });
});
