import { futureSelfSchema, goalSchema } from '@/store/schemas/goal';

describe('goalSchema', () => {
  it('parses a valid goal', () => {
    const input = {
      id: 'goal-1',
      category: 'Family',
      keywords: ['marriage', 'children'],
      statement: 'I want to build a happy family',
      createdAt: '2026-03-12T00:00:00.000Z',
    };
    expect(() => goalSchema.parse(input)).not.toThrow();
  });

  it('rejects a goal with no keywords', () => {
    const input = {
      id: 'goal-1',
      category: 'Family',
      keywords: [],
      statement: 'I want to build a happy family',
      createdAt: '2026-03-12T00:00:00.000Z',
    };
    expect(() => goalSchema.parse(input)).toThrow();
  });
});

describe('futureSelfSchema', () => {
  it('parses a valid future self entry', () => {
    const input = {
      goalId: 'goal-1',
      timeframe: '5yr',
      narrative: "I'm 35, married with two kids living in Jeju.",
    };
    expect(() => futureSelfSchema.parse(input)).not.toThrow();
  });

  it('rejects an invalid timeframe', () => {
    const input = {
      goalId: 'goal-1',
      timeframe: '3yr',
      narrative: 'Some narrative',
    };
    expect(() => futureSelfSchema.parse(input)).toThrow();
  });
});

it('parses a goal with archivedAt set', () => {
  const input = {
    archivedAt: '2026-03-12T00:00:00.000Z',
    category: 'Health',
    createdAt: '2026-03-12T00:00:00.000Z',
    id: 'goal-1',
    keywords: ['health'],
    statement: 'Goal 1',
  };
  expect(() => goalSchema.parse(input)).not.toThrow();
});

it('parses a goal without archivedAt and defaults to undefined', () => {
  const input = {
    category: 'Health',
    createdAt: '2026-03-12T00:00:00.000Z',
    id: 'goal-1',
    keywords: ['health'],
    statement: 'Goal 1',
  };
  const result = goalSchema.parse(input);
  expect(result.archivedAt).toBeUndefined();
});
