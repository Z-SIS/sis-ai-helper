import { AgentOutput } from '@/shared/schemas';

export function createAgentOutput(data: Partial<AgentOutput>): AgentOutput {
  const base: AgentOutput = {
    // Required fields with defaults
    title: (data as any).title || 'Response',
    content: (data as any).content || '',
    confidence_score: (data as any).confidence_score ?? (data as any).confidence ?? 0.85,
    confidence: (data as any).confidence ?? 0.85,
    success: (data as any).success ?? true,
    needsReview: (data as any).needsReview ?? false,
    // Optional fields with defaults
    summary: (data as any).summary || '',
    timestamp: (data as any).timestamp || new Date().toISOString(),
    topic: (data as any).topic,
    warnings: (data as any).warnings || [],
    sources: (data as any).sources || [],
    unverified_fields: (data as any).unverified_fields || [],
    data: {
      ...(data as any).data || {},
      // place form-specific fields inside data to avoid widening the base schema
      // Excel Helper specific fields
      ...(('answer' in (data as any) || 'formula' in (data as any)) ? {
        data: {
          ...(data.data || {}),
          answer: (data as any).answer,
          formula: (data as any).formula,
          steps: Array.isArray((data as any).steps) ? (data as any).steps : [],
          alternativeSolutions: Array.isArray((data as any).alternativeSolutions) ? (data as any).alternativeSolutions : [],
          tips: Array.isArray((data as any).tips) ? (data as any).tips : []
        }
      } : {}),
      
      // Other form-specific fields
      ...(('purpose' in (data as any) || 'scope' in (data as any)) ? {
        purpose: (data as any).purpose,
        scope: (data as any).scope,
        responsibilities: (data as any).responsibilities,
        procedure: (data as any).procedure,
        references: (data as any).references,
        companyName: (data as any).companyName,
        industry: (data as any).industry,
        location: (data as any).location,
        description: (data as any).description,
        contentAccuracy: (data as any).contentAccuracy,
        estimatedDuration: (data as any).estimatedDuration,
        tips: (data as any).tips,
      } : {}),
    },
  };

  return base;
}

export function createErrorAgentOutput(error: string): AgentOutput {
  return {
    title: 'Error',
    content: error,
    summary: 'An error occurred during processing',
    confidence: 0,
    confidence_score: 0,
    success: false,
    needsReview: true,
    warnings: [error],
    timestamp: new Date().toISOString(),
    sources: [],
    unverified_fields: []
  };
}

export function createRateLimitedAgentOutput(retryAfter?: string): AgentOutput {
  return {
    title: 'API Rate Limit Exceeded',
    content: `The API rate limit has been exceeded. Please try again ${retryAfter ? `after ${retryAfter}` : 'later'}.`,
    summary: 'Rate limit exceeded',
    confidence: 0,
    confidence_score: 0,
    success: false,
    needsReview: true,
    timestamp: new Date().toISOString(),
    sources: [],
    unverified_fields: [],
    data: {
      rateLimited: true,
      retryAfter: retryAfter || '60 seconds'
    }
  };
}