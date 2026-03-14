import { render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import FutureSelfSection from './FutureSelfSection';

const bothNarratives = [
  { goalId: 'g-1', narrative: 'I am 35 and thriving.', timeframe: '5yr' as const },
  { goalId: 'g-1', narrative: 'I am 40 and fulfilled.', timeframe: '10yr' as const },
];

describe('FutureSelfSection', () => {
  it('renders both 5yr and 10yr narratives', () => {
    render(
      <TestAppWrapper>
        <FutureSelfSection futureSelf={bothNarratives} />
      </TestAppWrapper>,
    );
    expect(screen.getByText('5 years')).toBeTruthy();
    expect(screen.getByText('I am 35 and thriving.')).toBeTruthy();
    expect(screen.getByText('10 years')).toBeTruthy();
    expect(screen.getByText('I am 40 and fulfilled.')).toBeTruthy();
  });

  it('renders placeholder when no narratives exist', () => {
    render(
      <TestAppWrapper>
        <FutureSelfSection futureSelf={[]} />
      </TestAppWrapper>,
    );
    expect(screen.getByText('No future self written yet.')).toBeTruthy();
  });

  it('shows placeholder for missing 10yr when only 5yr exists', () => {
    render(
      <TestAppWrapper>
        <FutureSelfSection futureSelf={[bothNarratives[0]]} />
      </TestAppWrapper>,
    );
    expect(screen.getByText('I am 35 and thriving.')).toBeTruthy();
    expect(screen.getByText('Not written yet.')).toBeTruthy();
  });
});
