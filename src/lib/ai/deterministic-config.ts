/**
 * Deterministic AI Configuration System
 * 
 * This configuration ensures consistent, factual, and reliable AI outputs
 * by implementing strict parameters and validation rules.
 */

export interface DeterministicConfig {
  // Core deterministic parameters
  temperature: number;
  topP: number;
  topK?: number;
  maxOutputTokens: number;
  
  // Safety and reliability
  candidateCount: number;
  stopSequences?: string[];
  
  // Structured output requirements
  responseFormat: 'json_object' | 'text';
  strictJsonOutput: boolean;
  
  // Validation and retry
  maxRetries: number;
  validationThreshold: number;
  
  // Grounding and verification
  enableGrounding: boolean;
  enableVerification: boolean;
  enableSelfCheck: boolean;
  
  // Anti-hallucination settings
  allowUnknown: boolean;
  requireConfidence: boolean;
  confidenceThreshold: number;
}

export const DEFAULT_DETERMINISTIC_CONFIG: DeterministicConfig = {
  // Ultra-deterministic parameters
  temperature: 0.0,
  topP: 0.1, // Low for focused outputs
  topK: 20,  // Limited vocabulary
  maxOutputTokens: 2048,
  
  // Safety first
  candidateCount: 1, // Single best response
  stopSequences: [],
  
  // Strict structured output
  responseFormat: 'json_object',
  strictJsonOutput: true,
  
  // Robust validation
  maxRetries: 3,
  validationThreshold: 0.95,
  
  // Multi-layer verification
  enableGrounding: true,
  enableVerification: true,
  enableSelfCheck: true,
  
  // Anti-hallucination
  allowUnknown: true,
  requireConfidence: true,
  confidenceThreshold: 0.9
};

export const EXTRACTION_CONFIG: DeterministicConfig = {
  ...DEFAULT_DETERMINISTIC_CONFIG,
  temperature: 0.0,
  topP: 0.0, // Ultra-deterministic for extraction
  topK: 10,
  maxOutputTokens: 1024,
  confidenceThreshold: 0.95
};

export const ANALYSIS_CONFIG: DeterministicConfig = {
  ...DEFAULT_DETERMINISTIC_CONFIG,
  temperature: 0.1,
  topP: 0.2,
  maxOutputTokens: 3072,
  confidenceThreshold: 0.85
};

export const COMPOSITION_CONFIG: DeterministicConfig = {
  ...DEFAULT_DETERMINISTIC_CONFIG,
  temperature: 0.2, // Slightly more creative for composition
  topP: 0.3,
  maxOutputTokens: 4096,
  confidenceThreshold: 0.8
};

// Task-specific configuration selector
export function getDeterministicConfig(taskType: 'extraction' | 'analysis' | 'composition' | 'default'): DeterministicConfig {
  switch (taskType) {
    case 'extraction':
      return EXTRACTION_CONFIG;
    case 'analysis':
      return ANALYSIS_CONFIG;
    case 'composition':
      return COMPOSITION_CONFIG;
    default:
      return DEFAULT_DETERMINISTIC_CONFIG;
  }
}

// Anti-hallucination system prompts
export const ANTI_HALLUCINATION_SYSTEM_PROMPT = `
You are a deterministic AI assistant designed for factual accuracy and reliability.

CRITICAL RULES:
1. NEVER invent facts, figures, or information
2. If you are not 100% certain about any information, respond with "UNKNOWN" and explain what data is needed
3. Base all responses ONLY on the provided context and grounding data
4. Do not make assumptions or extrapolate beyond the given information
5. If multiple sources conflict, acknowledge the conflict and mark as uncertain
6. Always cite your sources when possible
7. For numerical data, provide exact values or ranges if uncertain

OUTPUT REQUIREMENTS:
- Respond in valid JSON format only
- Include a "confidence_score" field (0.0-1.0) for each piece of information
- Use "UNKNOWN" for any information you cannot verify
- Provide source references when available

Remember: Accuracy is more important than completeness. It's better to say "UNKNOWN" than to provide incorrect information.
`;

export const VERIFICATION_PROMPT = `
Please verify the following AI-generated response for accuracy and completeness:

For each piece of information provided:
1. Check if it is directly supported by the grounding data
2. Confirm the exact wording matches the source
3. Validate numerical values and dates
4. Identify any assumptions or extrapolations

Respond with a verification report containing:
- "verified": boolean for each field
- "confidence": number (0.0-1.0)
- "evidence": direct quotes from sources
- "discrepancies": any inconsistencies found
- "overall_reliability": "HIGH" | "MEDIUM" | "LOW"

If any information cannot be verified, mark it as "UNVERIFIED".
`;

// Few-shot examples for different tasks
export const EXTRACTION_EXAMPLES = `
Example 1:
Input: "John Doe works at Acme Corp as a Senior Engineer and earns $120,000 per year."
Output: {
  "name": "John Doe",
  "company": "Acme Corp",
  "position": "Senior Engineer",
  "salary": 120000,
  "salary_currency": "USD",
  "confidence_score": 1.0,
  "sources": ["input_text"]
}

Example 2:
Input: "The meeting might be next week, but I'm not sure about the exact date."
Output: {
  "meeting_date": "UNKNOWN",
  "meeting_timeframe": "next_week",
  "confidence_score": 0.3,
  "sources": ["input_text"],
  "notes": "Exact date not specified in input"
}
`;

export const ANALYSIS_EXAMPLES = `
Example 1:
Input: Company data showing revenue growth from $1M to $1.5M over 2 years
Output: {
  "revenue_growth": {
    "absolute": 500000,
    "percentage": 50.0,
    "period": "2_years",
    "confidence_score": 1.0
  },
  "trend": "positive",
  "data_quality": "verified",
  "sources": ["financial_statements"]
}
`;

// Schema validation helpers
export interface ValidationSchema {
  type: 'object';
  properties: Record<string, any>;
  required: string[];
  additionalProperties: boolean;
}

export function createValidationSchema(fields: Record<string, any>): ValidationSchema {
  return {
    type: 'object',
    properties: fields,
    required: Object.keys(fields),
    additionalProperties: false
  };
}

// Logging configuration for audit trails
export interface AuditLogEntry {
  timestamp: string;
  taskType: string;
  input: any;
  output: any;
  config: DeterministicConfig;
  validation: {
    passed: boolean;
    errors: string[];
    confidence: number;
  };
  grounding: {
    sources: string[];
    relevance_score: number;
  };
  verification: {
    passed: boolean;
    confidence: number;
    discrepancies: string[];
  };
  performance: {
    responseTime: number;
    tokenCount: number;
    retryCount: number;
  };
}