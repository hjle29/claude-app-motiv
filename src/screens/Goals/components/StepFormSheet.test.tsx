import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import StepFormSheet from './StepFormSheet';

const onSave = jest.fn();
const onClose = jest.fn();

const existingStep = {
  deadline: '2027-06-01',
  description: 'Study daily',
  goalId: 'goal-1',
  id: 'step-1',
  isDone: false,
  keywords: ['health'],
  linkedRoutineIds: [] as string[],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StepFormSheet', () => {
  it('renders empty form for a new step', () => {
    render(
      <TestAppWrapper>
        <StepFormSheet
          goalId="goal-1"
          goalKeywords={['health']}
          onClose={onClose}
          onSave={onSave}
          step={undefined}
          visible
        />
      </TestAppWrapper>,
    );
    expect(screen.getByTestId('step-form-description')).toBeTruthy();
    expect(screen.getByTestId('step-form-deadline')).toBeTruthy();
  });

  it('pre-fills form when editing an existing step', () => {
    render(
      <TestAppWrapper>
        <StepFormSheet
          goalId="goal-1"
          goalKeywords={['health']}
          onClose={onClose}
          onSave={onSave}
          step={existingStep}
          visible
        />
      </TestAppWrapper>,
    );
    expect(screen.getByDisplayValue('Study daily')).toBeTruthy();
    expect(screen.getByDisplayValue('2027-06-01')).toBeTruthy();
  });

  it('calls onSave with step data when both fields are filled', () => {
    render(
      <TestAppWrapper>
        <StepFormSheet
          goalId="goal-1"
          goalKeywords={['health']}
          onClose={onClose}
          onSave={onSave}
          step={undefined}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.changeText(screen.getByTestId('step-form-description'), 'New step');
    fireEvent.changeText(screen.getByTestId('step-form-deadline'), '2027-01-01');
    fireEvent.press(screen.getByTestId('step-form-save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        deadline: '2027-01-01',
        description: 'New step',
        goalId: 'goal-1',
        keywords: ['health'],
      }),
    );
  });

  it('does not call onSave when description is empty', () => {
    render(
      <TestAppWrapper>
        <StepFormSheet
          goalId="goal-1"
          goalKeywords={['health']}
          onClose={onClose}
          onSave={onSave}
          step={undefined}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.changeText(screen.getByTestId('step-form-deadline'), '2027-01-01');
    fireEvent.press(screen.getByTestId('step-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not call onSave when deadline is empty', () => {
    render(
      <TestAppWrapper>
        <StepFormSheet
          goalId="goal-1"
          goalKeywords={['health']}
          onClose={onClose}
          onSave={onSave}
          step={undefined}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.changeText(screen.getByTestId('step-form-description'), 'New step');
    fireEvent.press(screen.getByTestId('step-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    render(
      <TestAppWrapper>
        <StepFormSheet
          goalId="goal-1"
          goalKeywords={['health']}
          onClose={onClose}
          onSave={onSave}
          step={undefined}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('step-form-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
