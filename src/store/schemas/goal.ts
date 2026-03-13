import * as z from 'zod';

export const goalSchema = z.object({
  category: z.string(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  keywords: z.array(z.string()).min(1),
  statement: z.string(),
});

export const futureSelfSchema = z.object({
  goalId: z.string(),
  narrative: z.string(),
  timeframe: z.enum(['5yr', '10yr']),
});

export type Goal = z.infer<typeof goalSchema>;
export type FutureSelf = z.infer<typeof futureSelfSchema>;
