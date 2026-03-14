// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getRoutines: jest.fn(),
  },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';
import TestAppWrapper from '@/tests/TestAppWrapper';

import LinkedRoutinesSheet from './LinkedRoutinesSheet';

const onSave = jest.fn();
const onClose = jest.fn();

const routines = [
  {
    id: 'r-1',
    name: 'Morning run',
    schedule: { days: ['Mon' as const], type: 'weekdays' as const },
    tags: ['health'],
  },
  {
    id: 'r-2',
    name: 'Study 30 min',
    schedule: { days: ['Tue' as const], type: 'weekdays' as const },
    tags: ['learning'],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (routineStore.getRoutines as jest.Mock).mockReturnValue(routines);
});

describe('LinkedRoutinesSheet', () => {
  it('renders all routines from the library', () => {
    render(
      <TestAppWrapper>
        <LinkedRoutinesSheet
          linkedRoutineIds={[]}
          onClose={onClose}
          onSave={onSave}
          visible
        />
      </TestAppWrapper>,
    );
    expect(screen.getByText('Morning run')).toBeTruthy();
    expect(screen.getByText('Study 30 min')).toBeTruthy();
  });

  it('calls onSave with selected routine IDs', () => {
    render(
      <TestAppWrapper>
        <LinkedRoutinesSheet
          linkedRoutineIds={[]}
          onClose={onClose}
          onSave={onSave}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('routine-check-r-1'));
    fireEvent.press(screen.getByTestId('linked-routines-save'));
    expect(onSave).toHaveBeenCalledWith(['r-1']);
  });

  it('pre-checks already linked routines', () => {
    render(
      <TestAppWrapper>
        <LinkedRoutinesSheet
          linkedRoutineIds={['r-2']}
          onClose={onClose}
          onSave={onSave}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('linked-routines-save'));
    expect(onSave).toHaveBeenCalledWith(['r-2']);
  });

  it('allows unchecking an already-linked routine', () => {
    render(
      <TestAppWrapper>
        <LinkedRoutinesSheet
          linkedRoutineIds={['r-1', 'r-2']}
          onClose={onClose}
          onSave={onSave}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('routine-check-r-1'));
    fireEvent.press(screen.getByTestId('linked-routines-save'));
    expect(onSave).toHaveBeenCalledWith(['r-2']);
  });

  it('calls onClose when cancelled', () => {
    render(
      <TestAppWrapper>
        <LinkedRoutinesSheet
          linkedRoutineIds={[]}
          onClose={onClose}
          onSave={onSave}
          visible
        />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('linked-routines-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
