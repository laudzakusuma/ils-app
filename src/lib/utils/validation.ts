import { z } from 'zod';

const healthDataSchema = z.object({
  heartRate: z.number().min(30).max(200).optional(),
  steps: z.number().min(0).optional(),
  hydration: z.number().min(0).max(100).optional(),
  energy: z.number().min(0).max(100).optional(),
  sleep: z.any().optional()
});

export function validateHealthData(data: any) {
  return healthDataSchema.parse(data);
}