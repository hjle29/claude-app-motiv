// jest.mock must appear before all imports
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getFutureSelf: jest.fn().mockReturnValue([]),
    getGoals: jest.fn().mockReturnValue([
      {
        category: 'Career',
        createdAt: new Date().toISOString(),
        id: 'goal-1',
        keywords: ['career', 'abroad'],
        statement: 'Work abroad in tech',
      },
    ]),
    saveFutureSelf: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import FutureSelf from './FutureSelf';

const mockNavigate = jest.fn();

function renderFutureSelf() {
  return render(
    <TestAppWrapper>
      <FutureSelf />
    </TestAppWrapper>,
  );
}

describe('FutureSelf', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders goal selector and skip button', () => {
    renderFutureSelf();
    expect(screen.getByTestId('goal-selector-goal-1')).toBeTruthy();
    expect(screen.getByTestId('skip-button')).toBeTruthy();
  });

  it('tapping skip navigates to StepsSetup', () => {
    renderFutureSelf();
    fireEvent.press(screen.getByTestId('skip-button'));
    expect(mockNavigate).toHaveBeenCalledWith('onboarding_steps_setup');
  });

  it('selecting a goal and timeframe shows Q&A flow', () => {
    renderFutureSelf();
    fireEvent.press(screen.getByTestId('goal-selector-goal-1'));
    fireEvent.press(screen.getByTestId('timeframe-5yr'));
    expect(screen.getByTestId('future-self-qa')).toBeTruthy();
  });
});
