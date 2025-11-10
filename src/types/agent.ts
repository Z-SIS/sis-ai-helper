export interface AgentInput {
  projectName?: string;
  description?: string;
  budget?: string;
  timeline?: string;
  resources?: string[];
  constraints?: string[];
  topic?: string;
  purpose?: string;
  keyPoints?: string[];
  audience?: string;
  slideCount?: string;
}

export interface AgentOutput {
  title: string;
  content: string;
  summary?: string;
  timestamp?: string;
  confidence: number;
  confidence_score: number;
  success: boolean;
  needsReview: boolean;
  topic?: string;
  warnings?: string[];
  sources?: string[];
  unverified_fields?: string[];
  data?: Record<string, any>;
  // Form-specific fields
  purpose?: string;
  scope?: string;
  responsibilities?: string[];
  procedure?: string[];
  references?: string[];
  companyName?: string;
  industry?: string;
  location?: string;
  description?: string;
  contentAccuracy?: number;
  estimatedDuration?: string;
  tips?: string[];
}