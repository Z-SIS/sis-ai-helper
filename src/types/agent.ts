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
  confidence?: number;
  success?: boolean;
  needsReview?: boolean;
  topic?: string;
  warnings?: string[];
  sources?: string[];
  data?: Record<string, any>;
  [k: string]: any;
}