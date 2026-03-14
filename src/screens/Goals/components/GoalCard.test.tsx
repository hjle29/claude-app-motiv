// jest.mock must appear before imports — Babel hoists it, keep it first in source
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

import { routineStore } from '@/store/routineStore';
import { stepStore } from '@/store/stepStore';
import TestAppWrapper from '@/tests/TestAppWrapper';

import GoalCard from './GoalCard';

const goal = {
  category: 'Health',
  createdAt: '2026-03-12T00:00:00.000Z',
  id: 'goal-1',
  keywords: ['fitness'],
  statement: 'Get fit and healthy',
};

const futureSelf = [
  { goalId: 'goal-1', narrative: 'I am fit.', timeframe: '5yr' as const },
];

const onEdit = jest.fn();
const onArchive = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([]);
  (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
});

describe('GoalCard', () => {
  it('renders goal statement', () => {
    render(
      <TestAppWrapper>
        <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />
      </TestAppWrapper>,
    );
    expect(screen.getByText('Get fit and healthy')).toBeTruthy();
  });

  it('is collapsed by default and expands on tap', () => {
    render(
      <TestAppWrapper>
        <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />
      </TestAppWrapper>,
    );
    expect(screen.queryByText('I am fit.')).toBeNull();
    fireEvent.press(screen.getByTestId('goal-card-header-goal-1'));
    expect(screen.getByText('I am fit.')).toBeTruthy();
  });

  it('shows step count in header', () => {
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([
      {
        deadline: '2027-01-01',
        description: 'Step A',
        goalId: 'goal-1',
        id: 's-1',
        isDone: true,
        keywords: [],
        linkedRoutineIds: [],
      },
      {
        deadline: '2027-01-01',
        description: 'Step B',
        goalId: 'goal-1',
        id: 's-2',
        isDone: false,
        keywords: [],
        linkedRoutineIds: [],
      },
    ]);
    render(
      <TestAppWrapper>
        <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />
      </TestAppWrapper>,
    );
    expect(screen.getByText('1 / 2 steps')).toBeTruthy();
  });

  it('calls onEdit when Edit is pressed (expanded)', () => {
    render(
      <TestAppWrapper>
        <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goal-card-header-goal-1'));
    fireEvent.press(screen.getByTestId('goal-card-edit-goal-1'));
    expect(onEdit).toHaveBeenCalledWith(goal);
  });

  it('calls onArchive when Archive is pressed (expanded)', () => {
    render(
      <TestAppWrapper>
        <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goal-card-header-goal-1'));
    fireEvent.press(screen.getByTestId('goal-card-archive-goal-1'));
    expect(onArchive).toHaveBeenCalledWith('goal-1');
  });
});
