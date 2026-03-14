import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import StepItem from './StepItem';

const step = {
  deadline: '2027-06-01',
  description: 'Study English daily',
  goalId: 'goal-1',
  id: 'step-1',
  isDone: false,
  keywords: ['english'],
  linkedRoutineIds: ['r-1', 'r-2'],
};

const onToggleDone = jest.fn();
const onEdit = jest.fn();
const onDelete = jest.fn();
const onLinkRoutines = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

function renderStep() {
  return render(
    <TestAppWrapper>
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />
    </TestAppWrapper>,
  );
}

describe('StepItem', () => {
  it('renders description and deadline', () => {
    renderStep();
    expect(screen.getByText('Study English daily')).toBeTruthy();
    expect(screen.getByText('2027-06-01')).toBeTruthy();
  });

  it('shows linked routine count', () => {
    renderStep();
    expect(screen.getByText('2 routines')).toBeTruthy();
  });

  it('calls onToggleDone when toggle is pressed', () => {
    renderStep();
    fireEvent.press(screen.getByTestId('step-toggle-step-1'));
    expect(onToggleDone).toHaveBeenCalledWith('step-1');
  });

  it('calls onEdit when edit is pressed', () => {
    renderStep();
    fireEvent.press(screen.getByTestId('step-edit-step-1'));
    expect(onEdit).toHaveBeenCalledWith(step);
  });

  it('calls onDelete when delete is pressed', () => {
    renderStep();
    fireEvent.press(screen.getByTestId('step-delete-step-1'));
    expect(onDelete).toHaveBeenCalledWith('step-1');
  });

  it('calls onLinkRoutines when link button is pressed', () => {
    renderStep();
    fireEvent.press(screen.getByTestId('step-link-routines-step-1'));
    expect(onLinkRoutines).toHaveBeenCalledWith(step);
  });
});
