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

// Add other deterministic prompt constants here as needed