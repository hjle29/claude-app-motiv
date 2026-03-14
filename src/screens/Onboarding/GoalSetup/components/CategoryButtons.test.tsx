import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import CategoryButtons from './CategoryButtons';

const onSelect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CategoryButtons', () => {
  it('renders all 10 category buttons plus Others (11 total)', () => {
    render(
      <TestAppWrapper>
        <CategoryButtons onSelect={onSelect} />
      </TestAppWrapper>,
    );
    expect(screen.getByTestId('category-health')).toBeTruthy();
    expect(screen.getByTestId('category-mental')).toBeTruthy();
    expect(screen.getByTestId('category-career')).toBeTruthy();
    expect(screen.getByTestId('category-finance')).toBeTruthy();
    expect(screen.getByTestId('category-relationships')).toBeTruthy();
    expect(screen.getByTestId('category-learning')).toBeTruthy();
    expect(screen.getByTestId('category-travel')).toBeTruthy();
    expect(screen.getByTestId('category-creativity')).toBeTruthy();
    expect(screen.getByTestId('category-growth')).toBeTruthy();
    expect(screen.getByTestId('category-impact')).toBeTruthy();
    expect(screen.getByTestId('category-others')).toBeTruthy();
  });

  it('calls onSelect with correct label and keyword when tapped', () => {
    render(
      <TestAppWrapper>
        <CategoryButtons onSelect={onSelect} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('category-health'));
    expect(onSelect).toHaveBeenCalledWith('Health & Fitness', 'health');
  });

  it('calls onSelect with others keyword when Others is tapped', () => {
    render(
      <TestAppWrapper>
        <CategoryButtons onSelect={onSelect} />
      </TestAppWrapper>,
    );
    fireEvent.press(screen.getByTestId('category-others'));
    expect(onSelect).toHaveBeenCalledWith('Others', 'others');
  });
});
