/**
 * Strict JSON Schema Validation System
 * 
 * Provides comprehensive validation for AI outputs with retry logic,
 * confidence scoring, and detailed error reporting.
 */

import { z } from 'zod';
import { DeterministicConfig, AuditLogEntry } from './deterministic-config';

// Base schemas with confidence scoring
export const BaseResponseSchema = z.object({
  confidence_score: z.number().min(0).max(1),
  needs_review: z.boolean().optional(),
  unverified_fields: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  timestamp: z.string().datetime().optional(),
});

// Enhanced Company Research Schema with validation
export const EnhancedCompanyResearchSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().min(10),
  website: z.string().url().optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.union([
    z.string(),
    z.object({
      count: z.number().min(1),
      confidence_score: z.number().min(0).max(1)
    })
  ]).optional(),
  revenue: z.union([
    z.string(),
    z.object({
      amount: z.number().min(0),
      currency: z.string().length(3),
      confidence_score: z.number().min(0).max(1)
    })
  ]).optional(),
  keyExecutives: z.array(z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    confidence_score: z.number().min(0).max(1)
  })).optional(),
  competitors: z.array(z.string()).optional(),
  recentNews: z.array(z.object({
    title: z.string().min(1),
    summary: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    confidence_score: z.number().min(0).max(1)
  })).optional(),
  dataConfidence: z.number().min(0).max(1),
  unverifiedFields: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  needsReview: z.boolean(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).merge(BaseResponseSchema);

// Enhanced SOP Schema
export const EnhancedSOPSchema = z.object({
  title: z.string().min(5),
  version: z.string().min(1),
  purpose: z.string().min(10),
  scope: z.string().min(10),
  responsibilities: z.array(z.object({
    role: z.string().min(1),
    responsibilities: z.array(z.string().min(5))
  })),
  procedures: z.array(z.object({
    step: z.number().min(1),
    action: z.string().min(10),
    owner: z.string().min(1),
    expectedOutcome: z.string().min(5),
    confidence_score: z.number().min(0).max(1)
  })),
  references: z.array(z.string()).optional(),
  confidence_score: z.number().min(0).max(1),
  needs_review: z.boolean().optional(),
}).merge(BaseResponseSchema);

// Enhanced Email Schema
export const EnhancedEmailSchema = z.object({
  recipient: z.string().email(),
  subject: z.string().min(5),
  body: z.string().min(20),
  tone: z.enum(['formal', 'informal', 'friendly', 'professional', 'urgent']),
  keyPoints: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
  confidence_score: z.number().min(0).max(1),
  needs_review: z.boolean().optional(),
}).merge(BaseResponseSchema);

// Enhanced Excel Helper Schema
export const EnhancedExcelHelperSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  formulas: z.array(z.string()).optional(),
  steps: z.array(z.string().min(10)).optional(),
  alternatives: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  confidence_score: z.number().min(0).max(1),
  needs_review: z.boolean().optional(),
}).merge(BaseResponseSchema);

// Enhanced Feasibility Schema
export const EnhancedFeasibilitySchema = z.object({
  projectName: z.string().min(3),
  overallScore: z.number().min(0).max(100),
  technicalFeasibility: z.object({
    score: z.number().min(0).max(100),
    factors: z.array(z.string()),
    confidence_score: z.number().min(0).max(1)
  }),
  financialFeasibility: z.object({
    score: z.number().min(0).max(100),
    estimatedCost: z.string().optional(),
    roi: z.string().optional(),
    confidence_score: z.number().min(0).max(1)
  }),
  resourceFeasibility: z.object({
    score: z.number().min(0).max(100),
    requiredResources: z.array(z.string()),
    availability: z.string(),
    confidence_score: z.number().min(0).max(1)
  }),
  risks: z.array(z.object({
    risk: z.string().min(5),
    probability: z.enum(['low', 'medium', 'high']),
    impact: z.enum(['low', 'medium', 'high']),
    mitigation: z.string().min(10)
  })),
  recommendations: z.array(z.string().min(10)),
  confidence_score: z.number().min(0).max(1),
  needs_review: z.boolean().optional(),
}).merge(BaseResponseSchema);

// Validation result interface
export interface ValidationResult {
  success: boolean;
  data?: any;
  errors: string[];
  warnings: string[];
  confidence: number;
  needsReview: boolean;
  retryCount: number;
}

// Schema validator class
export class DeterministicValidator {
  private schemas: Map<string, z.ZodSchema>;
  private config: DeterministicConfig;

  constructor(config: DeterministicConfig) {
    this.config = config;
    this.schemas = new Map([
      ['company-research', EnhancedCompanyResearchSchema],
      ['generate-sop', EnhancedSOPSchema],
      ['compose-email', EnhancedEmailSchema],
      ['excel-helper', EnhancedExcelHelperSchema],
      ['feasibility-check', EnhancedFeasibilitySchema],
    ]);
  }

  async validateWithRetry(
    agentType: string, 
    rawOutput: string, 
    maxRetries: number = 3
  ): Promise<ValidationResult> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        const result = await this.validateSingle(agentType, rawOutput);
        
        if (result.success || result.confidence >= this.config.confidenceThreshold) {
          return {
            ...result,
            retryCount
          };
        }

        // If confidence is too low, retry
        retryCount++;
        lastError = new Error(`Confidence too low: ${result.confidence}`);
        
      } catch (error) {
        retryCount++;
        lastError = error as Error;
        
        if (retryCount >= maxRetries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    return {
      success: false,
      errors: [lastError?.message || 'Validation failed after retries'],
      warnings: [],
      confidence: 0,
      needsReview: true,
      retryCount
    };
  }

  private async validateSingle(agentType: string, rawOutput: string): Promise<ValidationResult> {
    const schema = this.schemas.get(agentType);
    if (!schema) {
      throw new Error(`No schema found for agent type: ${agentType}`);
    }

    try {
      // Parse JSON
      let parsedOutput: any;
      try {
        parsedOutput = JSON.parse(rawOutput);
      } catch (parseError) {
        throw new Error(`Invalid JSON: ${(parseError as Error).message}`);
      }

      // Validate against schema
      const validationResult = schema.safeParse(parsedOutput);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        throw new Error(`Schema validation failed: ${errors.join(', ')}`);
      }

      const validatedData = validationResult.data;
      
      // Calculate overall confidence
      const confidence = this.calculateConfidence(validatedData);
      
      // Check if review is needed
      const needsReview = confidence < this.config.confidenceThreshold || 
                         validatedData.needs_review === true ||
                         (validatedData.unverified_fields?.length || 0) > 0;

      // Generate warnings
      const warnings = this.generateWarnings(validatedData);

      return {
        success: true,
        data: validatedData,
        errors: [],
        warnings,
        confidence,
        needsReview,
        retryCount: 0
      };

    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        warnings: [],
        confidence: 0,
        needsReview: true,
        retryCount: 0
      };
    }
  }

  private calculateConfidence(data: any): number {
    // Base confidence from data
    let confidence = data.confidence_score || 0.5;
    
    // Adjust based on unverified fields
    const unverifiedCount = data.unverified_fields?.length || 0;
    const totalFields = Object.keys(data).length;
    if (totalFields > 0) {
      confidence *= (1 - (unverifiedCount / totalFields) * 0.3);
    }
    
    // Adjust based on data completeness
    const completeness = this.calculateCompleteness(data);
    confidence = confidence * 0.7 + completeness * 0.3;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private calculateCompleteness(data: any): number {
    const fields = Object.keys(data);
    const nonEmptyFields = fields.filter(key => {
      const value = data[key];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });
    
    return fields.length > 0 ? nonEmptyFields.length / fields.length : 0;
  }

  private generateWarnings(data: any): string[] {
    const warnings: string[] = [];
    
    // Check for missing optional but important fields
    if (!data.website && data.companyName) {
      warnings.push('Website information not available');
    }
    
    if (!data.foundedYear && data.companyName) {
      warnings.push('Company founding year not available');
    }
    
    if (data.confidence_score < 0.7) {
      warnings.push('Low confidence score - data may be unreliable');
    }
    
    const unverifiedCount = data.unverified_fields?.length || 0;
    if (unverifiedCount > 3) {
      warnings.push('Many fields are unverified - manual review recommended');
    }
    
    return warnings;
  }
}

// Verification system for double-checking outputs
export class OutputVerifier {
  private config: DeterministicConfig;

  constructor(config: DeterministicConfig) {
    this.config = config;
  }

  async verifyOutput(
    agentType: string,
    originalOutput: any,
    groundingData?: string[]
  ): Promise<{
    verified: boolean;
    confidence: number;
    discrepancies: string[];
    verificationReport: any;
  }> {
    if (!this.config.enableVerification) {
      return {
        verified: true,
        confidence: originalOutput.confidence_score || 0.8,
        discrepancies: [],
        verificationReport: null
      };
    }

    try {
      // Create verification prompt
      const verificationPrompt = this.createVerificationPrompt(
        originalOutput, 
        groundingData
      );

      // For now, implement a simple verification logic
      // In a full implementation, this would call the AI model again
      const verificationResult = this.performBasicVerification(originalOutput);

      return verificationResult;

    } catch (error) {
      console.error('Verification failed:', error);
      return {
        verified: false,
        confidence: 0,
        discrepancies: ['Verification process failed'],
        verificationReport: null
      };
    }
  }

  private createVerificationPrompt(output: any, groundingData?: string[]): string {
    return `${VERIFICATION_PROMPT}

Output to verify:
${JSON.stringify(output, null, 2)}

${groundingData && groundingData.length > 0 ? 
  `Grounding data:\n${groundingData.join('\n\n')}` : 
  'No grounding data available.'
}

Please verify this output for accuracy and completeness.`;
  }

  private performBasicVerification(output: any): {
    verified: boolean;
    confidence: number;
    discrepancies: string[];
    verificationReport: any;
  } {
    const discrepancies: string[] = [];
    let confidence = output.confidence_score || 0.8;

    // Check for basic consistency
    if (output.companyName && typeof output.companyName !== 'string') {
      discrepancies.push('Company name should be a string');
      confidence -= 0.2;
    }

    if (output.website && !output.website.startsWith('http')) {
      discrepancies.push('Website URL format appears invalid');
      confidence -= 0.1;
    }

    if (output.foundedYear && (output.foundedYear < 1800 || output.foundedYear > new Date().getFullYear())) {
      discrepancies.push('Founding year appears unrealistic');
      confidence -= 0.2;
    }

    const verified = confidence >= this.config.confidenceThreshold;

    return {
      verified,
      confidence: Math.max(confidence, 0),
      discrepancies,
      verificationReport: {
        method: 'basic_validation',
        checks_performed: ['format_validation', 'consistency_check', 'range_validation'],
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Factory function to create validator with config
export function createDeterministicValidator(config: DeterministicConfig): DeterministicValidator {
  return new DeterministicValidator(config);
}

export function createOutputVerifier(config: DeterministicConfig): OutputVerifier {
  return new OutputVerifier(config);
}