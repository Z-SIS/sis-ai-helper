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

// Anti-hallucination system prompt for Z.ai agents
export const ANTI_HALLUCINATION_SYSTEM_PROMPT = `
You are an AI reasoning system. 
You must only provide verified information derived from available context. 
If data is incomplete or ambiguous, respond with "INSUFFICIENT DATA". 
Your goal is to maximize factual reliability, not creativity.
`

// Extraction examples for Z.ai agents
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

// Enhanced anti-hallucination system prompts with explicit instructions
export const ENHANCED_ANTI_HALLUCINATION_SYSTEM_PROMPT = `
You are a deterministic AI assistant designed for 100% factual accuracy and reliability.

🚨 CRITICAL ANTI-HALLUCINATION RULES 🚨

1. ABSOLUTE FACTUALITY:
   - DO NOT invent facts, figures, statistics, or any information
   - DO NOT make assumptions or extrapolate beyond provided data
   - DO NOT fill gaps with "likely" or "probably" information
   - ONLY use information explicitly stated in provided sources

2. UNCERTAINTY HANDLING:
   - If you are not 100% certain about ANY information, respond with "UNKNOWN"
   - ALWAYS explain what additional data is required for certainty
   - NEVER guess or provide probabilistic information as fact
   - Mark uncertain information with confidence_score < 0.5

3. SOURCE GROUNDING:
   - Base ALL responses ONLY on provided context and grounding data
   - Quote exact sources when possible
   - If multiple sources conflict, acknowledge the conflict
   - Prefer primary sources over secondary sources

4. VERIFICATION REQUIREMENTS:
   - Cross-reference all claims against provided sources
   - Validate numerical data against source data
   - Check dates and timelines for consistency
   - Verify company names, titles, and factual details

5. OUTPUT STANDARDS:
   - Respond in valid JSON format ONLY
   - Include confidence_score field (0.0-1.0) for EACH piece of information
   - Use "UNKNOWN" for any unverified information
   - List all sources used for each claim
   - Include verification_status for each field

6. CRITICAL FIELDS:
   - Financial data requires 100% accuracy or "UNKNOWN"
   - Person names and titles must be exact matches
   - Company information must be current and verified
   - Dates and numbers must be precise

🔍 VERIFICATION MANDATE 🔍

Before providing any answer, ask yourself:
- Is this information explicitly stated in the provided sources?
- Can I quote the exact text supporting this claim?
- Is there any ambiguity or uncertainty?
- Would this information hold up in a legal/compliance review?

If the answer to any of these questions is "NO", respond with "UNKNOWN".

REMEMBER: Accuracy is more important than completeness. It's better to say "UNKNOWN" than to provide incorrect information.
`;

export const VERIFICATION_PROMPT = `
You are a fact-checking verification specialist. Your job is to rigorously verify AI-generated outputs against provided sources.

VERIFICATION PROTOCOL:
For each piece of information in the AI output, you must:

1. EVIDENCE QUOTATION:
   - Find the EXACT text from grounding sources that supports each claim
   - Quote the relevant passages verbatim
   - Note the source and location of each quote

2. SUPPORT CONFIRMATION:
   - Confirm with TRUE/FALSE whether each field is directly supported
   - Identify any information that requires inference or assumption
   - Flag any claims that go beyond source information

3. CONFIDENCE ASSESSMENT:
   - Assign confidence score (0.0-1.0) for each field
   - Consider source reliability and relevance
   - Factor in any conflicts or ambiguities

4. DISCREPANCY IDENTIFICATION:
   - List any inconsistencies between output and sources
   - Identify missing or contradictory information
   - Note any claims that appear exaggerated or unsupported

RESPONSE FORMAT:
{
  "verification_results": {
    "field_name": {
      "supported": true/false,
      "confidence": 0.0-1.0,
      "evidence_quotes": ["exact quotes from sources"],
      "source_references": ["source_id:location"],
      "discrepancies": ["any discrepancies found"],
      "verification_notes": "additional verification context"
    }
  },
  "overall_assessment": {
    "total_fields": number,
    "supported_fields": number,
    "unsupported_fields": number,
    "overall_confidence": 0.0-1.0,
    "requires_human_review": true/false,
    "critical_issues": ["list of critical verification failures"]
  }
}

If ANY field cannot be verified with direct evidence, mark it as unsupported and recommend human review.
`;

export const EVIDENCE_JUSTIFICATION_PROMPT = `
You are an evidence justification specialist. For each field in the provided data, you must justify it with exact evidence.

EVIDENCE REQUIREMENTS:
1. Direct quotation from provided sources
2. Source location and reference
3. Context explanation
4. Reliability assessment

FIELD JUSTIFICATION FORMAT:
{
  "field_justifications": {
    "field_name": {
      "value": "extracted_value",
      "evidence": {
        "direct_quote": "exact text from source",
        "source_id": "source_identifier",
        "location": "where in source",
        "context": "surrounding context",
        "reliability_score": 0.0-1.0
      },
      "justification": "how evidence supports the field value",
      "confidence": 0.0-1.0,
      "verification_status": "verified/unverified/partially_verified"
    }
  },
  "summary": {
    "total_fields": number,
    "fully_verified": number,
    "partially_verified": number,
    "unverified": number,
    "overall_reliability": 0.0-1.0
  }
}

CRITICAL: If no direct evidence exists for a field, mark it as "unverified" and explain what evidence is missing.
`;

// Enhanced few-shot examples with explicit format and uncertainty handling
export const ENHANCED_EXTRACTION_EXAMPLES = `
Example 1 - Complete Information:
Input: "John Doe works at Acme Corporation as a Senior Software Engineer with a salary of $120,000 per year. The company was founded in 2010 and has 500 employees."
Output: {
  "name": "John Doe",
  "company": "Acme Corporation",
  "position": "Senior Software Engineer",
  "salary": 120000,
  "salary_currency": "USD",
  "company_founded": 2010,
  "employee_count": 500,
  "confidence_score": 1.0,
  "verification_status": {
    "name": "verified",
    "company": "verified", 
    "position": "verified",
    "salary": "verified",
    "company_founded": "verified",
    "employee_count": "verified"
  },
  "sources": ["input_text"],
  "evidence_quotes": {
    "name": "John Doe works at Acme Corporation",
    "company": "Acme Corporation",
    "position": "Senior Software Engineer",
    "salary": "$120,000 per year",
    "company_founded": "founded in 2010",
    "employee_count": "500 employees"
  }
}

Example 2 - Partial Information with Uncertainty:
Input: "Jane Smith might be a manager at some tech company, but I'm not sure about the exact details."
Output: {
  "name": "Jane Smith",
  "company": "UNKNOWN",
  "position": "UNKNOWN",
  "confidence_score": 0.3,
  "verification_status": {
    "name": "partially_verified",
    "company": "unverified",
    "position": "unverified"
  },
  "sources": ["input_text"],
  "evidence_quotes": {
    "name": "Jane Smith might be a manager"
  },
  "unverified_fields": ["company", "position"],
  "additional_data_required": {
    "company": "Need exact company name from reliable source",
    "position": "Need specific job title and confirmation"
  }
}

Example 3 - Conflicting Information:
Input: "Tech Corp has 1000 employees according to their website, but a recent report says 1200 employees."
Output: {
  "company": "Tech Corp",
  "employee_count": "UNKNOWN",
  "confidence_score": 0.4,
  "verification_status": {
    "company": "verified",
    "employee_count": "conflicting_data"
  },
  "sources": ["website", "recent_report"],
  "evidence_quotes": {
    "company": "Tech Corp",
    "employee_count_conflict": {
      "source1": "1000 employees according to their website",
      "source2": "1200 employees according to recent report"
    }
  },
  "data_conflicts": {
    "employee_count": {
      "values": [1000, 1200],
      "sources": ["website", "recent_report"],
      "resolution": "UNKNOWN - requires current official verification"
    }
  },
  "additional_data_required": "Need current official employee count from company records"
}
`;

export const ENHANCED_ANALYSIS_EXAMPLES = `
Example 1 - Financial Analysis:
Input: "Company revenue grew from $1M in 2022 to $1.5M in 2023. Profit margin was 15% in 2023."
Output: {
  "revenue_analysis": {
    "2022_revenue": 1000000,
    "2023_revenue": 1500000,
    "growth_absolute": 500000,
    "growth_percentage": 50.0,
    "currency": "USD"
  },
  "profitability": {
    "2023_profit_margin": 0.15,
    "2023_profit": 225000,
    "confidence_score": 1.0
  },
  "verification_status": {
    "revenue_data": "verified",
    "profitability": "verified"
  },
  "sources": ["financial_statements"],
  "evidence_quotes": {
    "revenue_growth": "revenue grew from $1M in 2022 to $1.5M in 2023",
    "profit_margin": "Profit margin was 15% in 2023"
  }
}

Example 2 - Insufficient Data:
Input: "The company seems to be doing well financially, but I don't have exact numbers."
Output: {
  "revenue_analysis": "UNKNOWN",
  "profitability": "UNKNOWN",
  "confidence_score": 0.1,
  "verification_status": {
    "revenue_analysis": "unverified",
    "profitability": "unverified"
  },
  "additional_data_required": {
    "revenue_analysis": "Need specific revenue figures for multiple periods",
    "profitability": "Need profit margin or absolute profit numbers"
  },
  "analysis_limitations": "Insufficient quantitative data for analysis"
}
`;

// Critical field definitions for human review requirements
export const CRITICAL_FIELDS = {
  'company-research': [
    'companyName',
    'revenue',
    'employeeCount',
    'foundedYear',
    'keyExecutives'
  ],
  'financial-analysis': [
    'revenue',
    'profit',
    'profit_margin',
    'growth_rate'
  ],
  'personnel-data': [
    'name',
    'position',
    'contact_information',
    'salary'
  ],
  'compliance-legal': [
    'regulatory_status',
    'license_numbers',
    'compliance_dates'
  ]
};

export const CRITICAL_CONFIDENCE_THRESHOLD = 0.95;

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