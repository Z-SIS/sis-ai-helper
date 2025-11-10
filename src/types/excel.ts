import { AgentOutput } from '@/shared/schemas';

export interface ExcelHelperOutput {
  title: string;
  content: string;
  summary?: string;
  timestamp?: string;
  confidence_score: number;
  confidence: number;
  success: boolean;
  needsReview: boolean;
  answer: string;
  formula?: string;
  steps?: string[];
  alternativeSolutions?: string[];
  tips?: string[];
  data?: Record<string, any>;
}