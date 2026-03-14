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

  it('defaults linkedRoutineIds to empty array when omitted', () => {
    const input = {
      deadline: '2027-06-01',
      description: 'Get IELTS 7.0',
      goalId: 'goal-1',
      id: 'step-1',
      isDone: false,
      keywords: ['english'],
    };
    const result = stepSchema.parse(input);
    expect(result.linkedRoutineIds).toEqual([]);
  });

  it('parses linkedRoutineIds when provided', () => {
    const input = {
      deadline: '2027-06-01',
      description: 'Get IELTS 7.0',
      goalId: 'goal-1',
      id: 'step-1',
      isDone: false,
      keywords: ['english'],
      linkedRoutineIds: ['routine-1', 'routine-2'],
    };
    const result = stepSchema.parse(input);
    expect(result.linkedRoutineIds).toEqual(['routine-1', 'routine-2']);
  });
});
