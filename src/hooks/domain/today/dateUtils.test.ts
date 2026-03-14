import { toLocalDateString } from './dateUtils';

describe('toLocalDateString', () => {
  it('formats a date as YYYY-MM-DD using local time', () => {
    const date = new Date(2026, 2, 9); // March 9, 2026 local time
    expect(toLocalDateString(date)).toBe('2026-03-09');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5); // January 5
    expect(toLocalDateString(date)).toBe('2026-01-05');
  });
});
