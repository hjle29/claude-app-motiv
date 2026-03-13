import { dailyLogSchema, routineSchema } from '@/store/schemas/routine';

describe('routineSchema', () => {
  it('parses a routine with weekday schedule', () => {
    const input = {
      id: 'routine-1',
      name: 'Study English 30 min',
      schedule: { days: ['Mon', 'Wed', 'Fri'], type: 'weekdays' },
      tags: ['english', 'learning'],
    };
    expect(() => routineSchema.parse(input)).not.toThrow();
  });

  it('parses a routine with date range schedule', () => {
    const input = {
      id: 'routine-2',
      name: 'Morning run',
      schedule: { endDate: '2026-06-30', startDate: '2026-04-01', type: 'dateRange' },
      tags: ['health'],
    };
    expect(() => routineSchema.parse(input)).not.toThrow();
  });

  it('rejects an invalid schedule type', () => {
    const input = {
      id: 'routine-3',
      name: 'Bad routine',
      schedule: { type: 'monthly' },
      tags: [],
    };
    expect(() => routineSchema.parse(input)).toThrow();
  });
});

describe('dailyLogSchema', () => {
  it('parses a completed log', () => {
    const input = {
      date: '2026-03-12',
      routineId: 'routine-1',
      status: 'completed',
    };
    expect(() => dailyLogSchema.parse(input)).not.toThrow();
  });

  it('parses a skipped log with reason', () => {
    const input = {
      date: '2026-03-12',
      routineId: 'routine-1',
      skipReason: 'sick',
      status: 'skipped',
    };
    expect(() => dailyLogSchema.parse(input)).not.toThrow();
  });
});
