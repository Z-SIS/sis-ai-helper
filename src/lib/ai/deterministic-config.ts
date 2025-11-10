// src/lib/ai/deterministic-config.ts
// ------------------------------------------------------
// Central configuration for deterministic AI behavior
// Used by Z.ai agents and backend inference modules
// ------------------------------------------------------

export const ANTI_HALLUCINATION_SYSTEM_PROMPT = `
You are an AI reasoning system.
You must only provide verified information derived from available context.
If data is incomplete or ambiguous, respond with "INSUFFICIENT DATA".
Your goal is to maximize factual reliability, not creativity.
`

export const EXTRACTION_EXAMPLES = [
  {
    id: 1,
    task: 'Entity extraction',
    input: 'Reliance Group operates in foam and mattress industry.',
    output: ['Reliance Group', 'foam industry', 'mattress industry']
  },
  {
    id: 2,
    task: 'Keyword analysis',
    input: 'RARE Hospitality manages operations across 5 hospital locations.',
    output: ['RARE Hospitality', 'operations management', 'hospital network']
  }
]

// Verification prompts
export const VERIFICATION_PROMPT = `
Verify the following information for accuracy and completeness:
1. Check for factual consistency
2. Identify any missing critical information
3. Flag any potentially incorrect or unverifiable claims
4. Provide a confidence score (0-1) for each piece of information
`

export const EVIDENCE_JUSTIFICATION_PROMPT = `
For each claim made, provide:
1. The evidence supporting this claim
2. The strength of that evidence (strong/moderate/weak)
3. Any counter-evidence or alternative explanations
4. A final justification for accepting or rejecting the claim
`

export const CRITICAL_FIELDS = [
  'companyName',
  'industry',
  'location',
  'description',
  'website',
  'foundedYear',
  'employeeCount',
  'revenue'
]

export const CRITICAL_CONFIDENCE_THRESHOLD = 0.7

// Type definitions
export interface DeterministicConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  responseFormat?: 'json_object' | 'text';
  systemPrompt: string;
  confidenceThreshold?: number;
  enableVerification?: boolean;
}

export interface AuditLogEntry {
  timestamp: string;
  agentType: string;
  input: any;
  output: any;
  confidence: number;
  verificationStatus: 'verified' | 'unverified' | 'failed';
  processingTime: number;
}

// Default configuration
export const DEFAULT_DETERMINISTIC_CONFIG: DeterministicConfig = {
  temperature: 0.1,
  topP: 0.1,
  maxTokens: 2000,
  responseFormat: 'json_object',
  systemPrompt: ANTI_HALLUCINATION_SYSTEM_PROMPT,
  confidenceThreshold: 0.7,
  enableVerification: true
}

// Configuration getter function
export function getDeterministicConfig(taskType: 'extraction' | 'generation' | 'analysis'): DeterministicConfig {
  const baseConfig = { ...DEFAULT_DETERMINISTIC_CONFIG };
  
  switch (taskType) {
    case 'extraction':
      return {
        ...baseConfig,
        temperature: 0.0,
        topP: 0.0,
        maxTokens: 1500,
        systemPrompt: VERIFICATION_PROMPT
      };
    case 'generation':
      return {
        ...baseConfig,
        temperature: 0.2,
        topP: 0.2,
        maxTokens: 2500
      };
    case 'analysis':
      return {
        ...baseConfig,
        temperature: 0.1,
        topP: 0.1,
        maxTokens: 2000,
        systemPrompt: EVIDENCE_JUSTIFICATION_PROMPT
      };
    default:
      return baseConfig;
  }
}

// Add other deterministic prompt constants here as needed