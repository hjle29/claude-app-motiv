import { futureSelfRounds, qaTree } from './qaTree';

const MIN_ROUNDS = 3;
const MAX_ROUNDS = 5;
const MIN_OPTIONS = 3;
const MAX_OPTIONS = 5;

describe('qaTree', () => {
  it('has exactly 10 categories', () => {
    expect(qaTree).toHaveLength(10);
  });

  it('each category has between 3 and 5 rounds', () => {
    for (const category of qaTree) {
      expect(category.rounds.length).toBeGreaterThanOrEqual(MIN_ROUNDS);
      expect(category.rounds.length).toBeLessThanOrEqual(MAX_ROUNDS);
    }
  });

  it('each round has between 3 and 5 options', () => {
    for (const category of qaTree) {
      for (const round of category.rounds) {
        expect(round.options.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
        expect(round.options.length).toBeLessThanOrEqual(MAX_OPTIONS);
      }
    }
  });

  it('each category has at least one terminal option across its rounds', () => {
    for (const category of qaTree) {
      const hasTerminal = category.rounds.some(round =>
        round.options.some(option => option.terminal === true),
      );
      expect(hasTerminal).toBe(true);
    }
  });

  it('includes all expected category keywords', () => {
    const keywords = qaTree.map(c => c.keyword);
    expect(keywords).toContain('health');
    expect(keywords).toContain('mental');
    expect(keywords).toContain('career');
    expect(keywords).toContain('finance');
    expect(keywords).toContain('relationships');
    expect(keywords).toContain('learning');
    expect(keywords).toContain('travel');
    expect(keywords).toContain('creativity');
    expect(keywords).toContain('growth');
    expect(keywords).toContain('impact');
  });
});

describe('futureSelfRounds', () => {
  it('has exactly 3 rounds', () => {
    expect(futureSelfRounds).toHaveLength(3);
  });
});
