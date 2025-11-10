import { AgentOutput } from '@/types/agent';
import { z } from 'zod';

// Common fields we want to access in components
export const FormAgentOutputSchema = z.object({
  title: z.string(),
  content: z.string(),
  summary: z.string().optional(),
  confidence_score: z.number(),
  confidence: z.number(),
  success: z.boolean(),
  needsReview: z.boolean(),
  topic: z.string().optional(),
  warnings: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  // Form-specific fields directly in root
  purpose: z.string().optional(),
  scope: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  procedure: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  contentAccuracy: z.number().optional(),
  estimatedDuration: z.string().optional(),
  tips: z.array(z.string()).optional(),
  // Legacy data field support
  data: z.record(z.any()).optional(),
});

export type FormAgentOutput = z.infer<typeof FormAgentOutputSchema>;

// Helper for safely accessing fields that might be in data or root
export function getAnyField<T>(output: AgentOutput | null, field: keyof AgentOutput, defaultValue: T): T {
  if (!output) return defaultValue;
  
  // Check in root first since we've moved fields there
  const rootValue = output[field];
  if (rootValue !== undefined) {
    return rootValue as T;
  }
  
  // Fall back to data for legacy support
  if (output.data?.[field] !== undefined) {
    return output.data[field] as T;
  }

  return defaultValue;
}

// Utility function to safely access array fields
export function getArrayField(output: AgentOutput | null, field: keyof AgentOutput): string[] {
  return getAnyField(output, field, []);
}

// Helper for safely accessing string fields
export function getStringField(output: AgentOutput | null, field: keyof AgentOutput, defaultValue = ''): string {
  return getAnyField(output, field, defaultValue);
}

// Helper for safely accessing number fields
export function getNumberField(output: AgentOutput | null, field: keyof AgentOutput, defaultValue = 0): number {
  return getAnyField(output, field, defaultValue);
}