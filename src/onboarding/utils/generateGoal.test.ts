import { extractKeywords, generateGoalStatement } from '@/onboarding/utils/generateGoal';

describe('generateGoalStatement', () => {
  // Legacy categories (backward compat)
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

  // New categories
  it('generates a statement for Health & Fitness', () => {
    const result = generateGoalStatement('Health & Fitness', ['Physical fitness', 'Build muscle', 'In 6 months']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Mental Wellness', () => {
    const result = generateGoalStatement('Mental Wellness', ['Reducing stress & anxiety']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Career & Work', () => {
    const result = generateGoalStatement('Career & Work', ['Get promoted', 'Learn new skills', 'Within 1 year']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Finance', () => {
    const result = generateGoalStatement('Finance', ['Grow investments', 'Financial independence']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Relationships', () => {
    const result = generateGoalStatement('Relationships', ['Deepening friendships', 'Better communication']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Education & Learning', () => {
    const result = generateGoalStatement('Education & Learning', ['A new language']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Travel & Adventure', () => {
    const result = generateGoalStatement('Travel & Adventure', ['Seeing the world', 'Europe', 'Within 1 year']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Creativity & Hobbies', () => {
    const result = generateGoalStatement('Creativity & Hobbies', ['Music (playing or producing)', 'Build a portfolio']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Personal Growth', () => {
    const result = generateGoalStatement('Personal Growth', ['Building better habits', 'Morning routine']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for Social Impact', () => {
    const result = generateGoalStatement('Social Impact', ['Environmental sustainability', 'Volunteer regularly']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
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

  it('lowercases all keywords', () => {
    const keywords = extractKeywords('Health', ['Fitness', 'MUSCLE']);
    expect(keywords).toContain('health');
    expect(keywords).toContain('fitness');
    expect(keywords).toContain('muscle');
  });
});
