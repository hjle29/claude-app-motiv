import { stepSchema } from '@/store/schemas/step';

describe('stepSchema', () => {
  it('parses a valid step', () => {
    const input = {
      deadline: '2027-06-01',
      description: 'Get IELTS 7.0',
      goalId: 'goal-1',
      id: 'step-1',
      isDone: false,
      keywords: ['english', 'ielts'],
    };
    expect(() => stepSchema.parse(input)).not.toThrow();
  });

  it('parses a completed step', () => {
    const input = {
      deadline: '2027-06-01',
      description: 'Get IELTS 7.0',
      goalId: 'goal-1',
      id: 'step-1',
      isDone: true,
      keywords: ['english'],
    };
    const result = stepSchema.parse(input);
    expect(result.isDone).toBe(true);
  });
});
