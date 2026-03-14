import * as z from 'zod';

export const stepSchema = z.object({
  deadline: z.iso.date(),
  description: z.string(),
  goalId: z.string(),
  id: z.string(),
  isDone: z.boolean(),
  keywords: z.array(z.string()),
  linkedRoutineIds: z.array(z.string()).default([]),
});

export type Step = z.infer<typeof stepSchema>;
