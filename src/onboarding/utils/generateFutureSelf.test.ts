import { generateFutureSelfNarrative } from '@/onboarding/utils/generateFutureSelf';

describe('generateFutureSelfNarrative', () => {
  it('generates a 5yr narrative', () => {
    const result = generateFutureSelfNarrative({
      answers: ['Where I live', 'A sense of peace', "I'm proud of the choices I made"],
      goalStatement: 'Build a happy family',
      timeframe: '5yr',
    });
    expect(result).toBeTruthy();
    expect(result).toContain('5 years');
  });

  it('generates a 10yr narrative', () => {
    const result = generateFutureSelfNarrative({
      answers: ['My work', 'A feeling of achievement', 'I feel inspired every day'],
      goalStatement: 'Work abroad in tech',
      timeframe: '10yr',
    });
    expect(result).toContain('10 years');
  });

  it('includes the goal statement in the narrative', () => {
    const result = generateFutureSelfNarrative({
      answers: ['My lifestyle', 'Freedom and flexibility', 'I finally feel balanced'],
      goalStatement: 'Start a business',
      timeframe: '5yr',
    });
    expect(result).toContain('Start a business');
  });
});
