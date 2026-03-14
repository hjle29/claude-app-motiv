import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import GoalFormSheet from './GoalFormSheet';

const onSave = jest.fn();
const onClose = jest.fn();

const existingGoal = {
  category: 'Health',
  createdAt: '2026-03-12T00:00:00.000Z',
  id: 'goal-1',
  keywords: ['fitness', 'wellness'],
  statement: 'Get healthy',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GoalFormSheet', () => {
  it('renders empty form for new goal', () => {
    render(
      <TestAppWrapper>
        <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />
      </TestAppWrapper>,
    );
    expect(screen.getByTestId('goal-form-statement')).toBeTruthy();
    expect(screen.getByTestId('goal-form-keywords')).toBeTruthy();
  });

  it('pre-fills form when editing existing goal', () => {
    render(
      <TestAppWrapper>
        <GoalFormSheet goal={existingGoal} onClose={onClose} onSave={onSave} visible />
      </TestAppWrapper>,
    );
    expect(screen.getByDisplayValue('Get healthy')).toBeTruthy();
    expect(screen.getByDisplayValue('fitness, wellness')).toBeTruthy();
  });

  it('calls onSave with goal data when all fields filled', () => {
    render(
      <TestAppWrapper>
        <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goal-category-Family'));
    fireEvent.changeText(screen.getByTestId('goal-form-statement'), 'My goal');
    fireEvent.changeText(screen.getByTestId('goal-form-keywords'), 'family, love');
    fireEvent.press(screen.getByTestId('goal-form-save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Family',
        keywords: ['family', 'love'],
        statement: 'My goal',
      }),
    );
  });

  it('does not call onSave when statement is empty', () => {
    render(
      <TestAppWrapper>
        <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goal-category-Health'));
    fireEvent.changeText(screen.getByTestId('goal-form-keywords'), 'health');
    fireEvent.press(screen.getByTestId('goal-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not call onSave when keywords are empty', () => {
    render(
      <TestAppWrapper>
        <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goal-category-Health'));
    fireEvent.changeText(screen.getByTestId('goal-form-statement'), 'My goal');
    fireEvent.press(screen.getByTestId('goal-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    render(
      <TestAppWrapper>
        <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('goal-form-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
