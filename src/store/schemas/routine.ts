import * as z from 'zod';

const weekday = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const weekdaysSchedule = z.object({
  days: z.array(weekday).min(1),
  type: z.literal('weekdays'),
});

const dateRangeSchedule = z.object({
  endDate: z.iso.date(),
  startDate: z.iso.date(),
  type: z.literal('dateRange'),
});

export const routineSchema = z.object({
  id: z.string(),
  name: z.string(),
  schedule: z.discriminatedUnion('type', [weekdaysSchedule, dateRangeSchedule]),
  tags: z.array(z.string()),
});

export const dailyLogSchema = z.object({
  date: z.iso.date(),
  routineId: z.string(),
  skipReason: z.string().optional(),
  status: z.enum(['completed', 'skipped', 'pending']),
});

export type DailyLog = z.infer<typeof dailyLogSchema>;
export type Routine = z.infer<typeof routineSchema>;
