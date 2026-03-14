// jest.mock must appear before all imports
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getGoals: jest.fn().mockReturnValue([
      {
        category: 'Career',
        createdAt: new Date().toISOString(),
        id: 'goal-1',
        keywords: ['career'],
        statement: 'Work abroad',
      },
    ]),
  },
}));

jest.mock('@react-navigation/native', (): Record<string, unknown> => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ reset: mockReset }),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import StepsSetup from './StepsSetup';

const mockReset = jest.fn();

function renderStepsSetup() {
  return render(
    <TestAppWrapper>
      <StepsSetup />
    </TestAppWrapper>,
  );
}

describe('StepsSetup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders goals and finish button', () => {
    renderStepsSetup();
    expect(screen.getByText('Work abroad')).toBeTruthy();
    expect(screen.getByTestId('finish-button')).toBeTruthy();
  });

  it('tapping Finish calls navigation.reset to MainTabs', () => {
    renderStepsSetup();
    fireEvent.press(screen.getByTestId('finish-button'));
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'main_tabs' }],
    });
  });
});
