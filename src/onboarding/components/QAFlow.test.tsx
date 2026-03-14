import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import QAFlow from './QAFlow';

const rounds = [
  {
    options: [
      { keyword: 'option-a', label: 'Option A' },
      { keyword: 'option-b', label: 'Option B', terminal: true },
    ],
    question: 'Round 1 question?',
  },
  {
    options: [
      { keyword: 'option-c', label: 'Option C' },
      { keyword: 'option-d', label: 'Option D', terminal: true },
    ],
    question: 'Round 2 question?',
  },
  {
    options: [
      { keyword: 'option-e', label: 'Option E' },
    ],
    question: 'Round 3 question?',
  },
];

const onComplete = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('QAFlow', () => {
  it('completes after all rounds when no terminal option selected', () => {
    render(
      <TestAppWrapper>
        <QAFlow onComplete={onComplete} rounds={rounds} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('qa-option-option-a'));
    fireEvent.press(screen.getByTestId('qa-option-option-c'));
    fireEvent.press(screen.getByTestId('qa-option-option-e'));
    expect(onComplete).toHaveBeenCalledWith(
      ['Option A', 'Option C', 'Option E'],
      ['option-a', 'option-c', 'option-e'],
    );
  });

  it('calls onComplete early when a terminal option is selected in round 1', () => {
    render(
      <TestAppWrapper>
        <QAFlow onComplete={onComplete} rounds={rounds} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('qa-option-option-b'));
    expect(onComplete).toHaveBeenCalledWith(['Option B'], ['option-b']);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete early when a terminal option is selected in round 2', () => {
    render(
      <TestAppWrapper>
        <QAFlow onComplete={onComplete} rounds={rounds} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('qa-option-option-a'));
    fireEvent.press(screen.getByTestId('qa-option-option-d'));
    expect(onComplete).toHaveBeenCalledWith(
      ['Option A', 'Option D'],
      ['option-a', 'option-d'],
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows correct step count', () => {
    render(
      <TestAppWrapper>
        <QAFlow onComplete={onComplete} rounds={rounds} />
      </TestAppWrapper>,
    );
    expect(screen.getByText('Step 1 of 3')).toBeTruthy();
  });
});
