import { z } from 'zod';
import { BaseResponseSchema } from '../schemas';

// Excel Helper Output Schema
export const ExcelHelperOutputSchema = BaseResponseSchema.extend({
  answer: z.string(),
  formula: z.string().optional(),
  steps: z.array(z.string()).optional(),
  alternativeSolutions: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export type ExcelHelperOutput = z.infer<typeof ExcelHelperOutputSchema>;