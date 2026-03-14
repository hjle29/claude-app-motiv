import { extractKeywords, generateGoalStatement } from '@/onboarding/utils/generateGoal';

describe('generateGoalStatement', () => {
  it('generates a statement for a family path', () => {
    const result = generateGoalStatement('Family', ['Starting a family', 'Getting married', 'By age 35']);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    const MIN_RESULT_LENGTH = 10;
    expect(result.length).toBeGreaterThan(MIN_RESULT_LENGTH);
  });

  it('generates a statement for a career path', () => {
    const result = generateGoalStatement('Career', ['Work abroad', 'Learn new skills', 'Within 3 years']);
    expect(result).toBeTruthy();
    const MIN_RESULT_LENGTH = 10;
    expect(result.length).toBeGreaterThan(MIN_RESULT_LENGTH);
  });

  it('handles Others category with free answers', () => {
    const result = generateGoalStatement('Others', ['Be happy', 'Live simply', 'Always']);
    expect(result).toBeTruthy();
  });
});

describe('extractKeywords', () => {
  it('extracts keywords from category and answer keywords', () => {
    const keywords = extractKeywords('Family', ['family', 'marriage', 'by-35']);
    expect(keywords).toContain('family');
    expect(keywords).toContain('marriage');
  });

  it('deduplicates keywords', () => {
    const keywords = extractKeywords('Family', ['family', 'family', 'marriage']);
    expect(keywords.filter(k => k === 'family')).toHaveLength(1);
  });
});
