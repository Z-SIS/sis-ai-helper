/**
 * Enhanced AI Audit Logging System with Full Prompt/Response Tracking
 * 
 * Comprehensive logging for AI model prompts, responses, validation results,
 * function calls, and performance metrics for debugging and compliance.
 */

import { z } from 'zod';
import { DeterministicConfig } from './deterministic-config';
import { ValidationResult } from './schema-validator';
import { GroundingResult } from './grounding-system';
import { EnhancedVerificationResult } from './enhanced-verification';
import { FunctionCallResult } from './function-calling-system';

// Enhanced audit log schema with full prompt/response tracking
export const EnhancedAuditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  
  // Request details
  taskType: z.string(),
  agentType: z.string(),
  input: z.any(),
  inputHash: z.string(),
  
  // AI model details
  model: z.string(),
  config: z.any(), // DeterministicConfig
  
  // Full prompt tracking
  prompts: z.object({
    systemPrompt: z.string(),
    userPrompt: z.string(),
    groundingPrompt: z.string().optional(),
    verificationPrompt: z.string().optional(),
    fullPrompt: z.string(),
    promptTokens: z.number()
  }),
  
  // Response details
  rawOutput: z.string(),
  parsedOutput: z.any().optional(),
  outputHash: z.string(),
  responseTokens: z.number(),
  
  // Function calling details
  functionCall: z.object({
    functionName: z.string().optional(),
    functionArgs: z.any().optional(),
    functionSuccess: z.boolean().optional(),
    functionError: z.string().optional()
  }).optional(),
  
  // Validation results
  validation: z.object({
    passed: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    confidence: z.number(),
    retryCount: z.number(),
    processingTime: z.number()
  }),
  
  // Enhanced grounding information
  grounding: z.object({
    enabled: z.boolean(),
    sources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      url: z.string().optional(),
      relevanceScore: z.number(),
      reliability: z.number(),
      category: z.string()
    })),
    sourceCount: z.number(),
    averageRelevance: z.number(),
    hasHighQualitySources: z.boolean(),
    groundingTime: z.number()
  }),
  
  // Enhanced verification results
  verification: z.object({
    passed: z.boolean(),
    confidence: z.number(),
    discrepancies: z.array(z.string()),
    verificationTime: z.number(),
    evidenceJustifications: z.array(z.object({
      fieldName: z.string(),
      evidence: z.object({
        directQuote: z.string(),
        sourceId: z.string(),
        reliabilityScore: z.number()
      }),
      confidence: z.number(),
      verificationStatus: z.string()
    })),
    criticalFieldValidation: z.object({
      criticalFieldsValid: z.boolean(),
      criticalIssues: z.array(z.string()),
      requiredHumanReview: z.boolean()
    })
  }).optional(),
  
  // Consensus validation (if used)
  consensusValidation: z.object({
    enabled: z.boolean(),
    candidateCount: z.number(),
    consensusConfidence: z.number(),
    consensusResult: z.any().optional(),
    requiresHumanReview: z.boolean()
  }).optional(),
  
  // Performance metrics
  performance: z.object({
    totalResponseTime: z.number(),
    modelResponseTime: z.number(),
    validationTime: z.number(),
    groundingTime: z.number(),
    verificationTime: z.number(),
    consensusTime: z.number().optional(),
    tokenCount: z.number().optional(),
    retryCount: z.number(),
    functionCallTime: z.number().optional()
  }),
  
  // Quality indicators
  quality: z.object({
    overallScore: z.number(),
    accuracyScore: z.number(),
    completenessScore: z.number(),
    reliabilityScore: z.number(),
    consistencyScore: z.number().optional()
  }),
  
  // Compliance and safety
  compliance: z.object({
    passedSafetyChecks: z.boolean(),
    flaggedContent: z.array(z.string()).optional(),
    dataPrivacyCompliant: z.boolean(),
    requiresHumanReview: z.boolean(),
    criticalFieldsReviewed: z.boolean(),
    antiHallucinationCompliant: z.boolean()
  }),
  
  // Environment info
  environment: z.object({
    nodeEnv: z.string(),
    apiVersion: z.string(),
    requestId: z.string().optional(),
    vercelId: z.string().optional(),
    userAgent: z.string().optional()
  })
});

export type EnhancedAuditLogEntry = z.infer<typeof EnhancedAuditLogEntrySchema>;

// Storage interface for enhanced audit logs
export interface EnhancedAuditStorage {
  save(entry: EnhancedAuditLogEntry): Promise<void>;
  query(filters: EnhancedAuditQueryFilters): Promise<EnhancedAuditLogEntry[]>;
  getStats(timeRange: { start: string; end: string }): Promise<EnhancedAuditStats>;
  getFullInteraction(id: string): Promise<EnhancedAuditLogEntry | null>;
  exportToCSV(filters: EnhancedAuditQueryFilters): Promise<string>;
  exportToJSON(filters: EnhancedAuditQueryFilters): Promise<string>;
}

export interface EnhancedAuditQueryFilters {
  userId?: string;
  taskType?: string;
  agentType?: string;
  dateRange?: { start: string; end: string };
  minConfidence?: number;
  requiresReview?: boolean;
  hasFunctionCalls?: boolean;
  hasVerification?: boolean;
  hasGrounding?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'confidence' | 'responseTime';
  sortOrder?: 'asc' | 'desc';
}

export interface EnhancedAuditStats {
  totalRequests: number;
  averageConfidence: number;
  successRate: number;
  averageResponseTime: number;
  errorsByType: Record<string, number>;
  usageByTaskType: Record<string, number>;
  qualityTrends: Array<{
    date: string;
    averageScore: number;
    requestCount: number;
  }>;
  functionCallStats: {
    totalFunctionCalls: number;
    successRate: number;
    mostUsedFunctions: Record<string, number>;
  };
  verificationStats: {
    totalVerifications: number;
    averageVerificationConfidence: number;
    criticalFieldFailures: number;
  };
  groundingStats: {
    totalGroundedQueries: number;
    averageSourceCount: number;
    averageRelevanceScore: number;
  };
}

// In-memory enhanced audit storage
export class EnhancedInMemoryAuditStorage implements EnhancedAuditStorage {
  private entries: EnhancedAuditLogEntry[] = [];
  private maxEntries: number = 10000;

  async save(entry: EnhancedAuditLogEntry): Promise<void> {
    this.entries.push(entry);
    
    // Keep only the most recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  async query(filters: EnhancedAuditQueryFilters): Promise<EnhancedAuditLogEntry[]> {
    let filtered = [...this.entries];

    // Apply filters
    if (filters.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId);
    }

    if (filters.taskType) {
      filtered = filtered.filter(entry => entry.taskType === filters.taskType);
    }

    if (filters.agentType) {
      filtered = filtered.filter(entry => entry.agentType === filters.agentType);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= start && entryDate <= end;
      });
    }

    if (filters.minConfidence) {
      filtered = filtered.filter(entry => entry.validation.confidence >= filters.minConfidence!);
    }

    if (filters.requiresReview !== undefined) {
      filtered = filtered.filter(entry => entry.compliance.requiresHumanReview === filters.requiresReview);
    }

    if (filters.hasFunctionCalls !== undefined) {
      filtered = filtered.filter(entry => !!entry.functionCall === filters.hasFunctionCalls);
    }

    if (filters.hasVerification !== undefined) {
      filtered = filtered.filter(entry => !!entry.verification === filters.hasVerification);
    }

    if (filters.hasGrounding !== undefined) {
      filtered = filtered.filter(entry => entry.grounding.enabled === filters.hasGrounding);
    }

    // Sort
    const sortBy = filters.sortBy || 'timestamp';
    const sortOrder = filters.sortOrder || 'desc';
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'confidence':
          aValue = a.validation.confidence;
          bValue = b.validation.confidence;
          break;
        case 'responseTime':
          aValue = a.performance.totalResponseTime;
          bValue = b.performance.totalResponseTime;
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    
    return filtered.slice(offset, offset + limit);
  }

  async getStats(timeRange: { start: string; end: string }): Promise<EnhancedAuditStats> {
    const entries = await this.query({
      dateRange: timeRange
    });

    const totalRequests = entries.length;
    const averageConfidence = entries.reduce((sum, entry) => sum + entry.validation.confidence, 0) / totalRequests;
    const successRate = entries.filter(entry => entry.validation.passed).length / totalRequests;
    const averageResponseTime = entries.reduce((sum, entry) => sum + entry.performance.totalResponseTime, 0) / totalRequests;

    // Error analysis
    const errorsByType: Record<string, number> = {};
    entries.forEach(entry => {
      entry.validation.errors.forEach(error => {
        errorsByType[error] = (errorsByType[error] || 0) + 1;
      });
    });

    // Usage by task type
    const usageByTaskType: Record<string, number> = {};
    entries.forEach(entry => {
      usageByTaskType[entry.taskType] = (usageByTaskType[entry.taskType] || 0) + 1;
    });

    // Quality trends
    const qualityTrends: Array<{ date: string; averageScore: number; requestCount: number }> = [];
    const groupedByDate: Record<string, EnhancedAuditLogEntry[]> = {};
    
    entries.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(entry);
    });

    Object.entries(groupedByDate).forEach(([date, dayEntries]) => {
      const averageScore = dayEntries.reduce((sum, entry) => sum + entry.quality.overallScore, 0) / dayEntries.length;
      qualityTrends.push({
        date,
        averageScore,
        requestCount: dayEntries.length
      });
    });

    // Function call stats
    const functionCallEntries = entries.filter(entry => entry.functionCall);
    const functionCallStats = {
      totalFunctionCalls: functionCallEntries.length,
      successRate: functionCallEntries.filter(entry => entry.functionCall?.functionSuccess).length / Math.max(functionCallEntries.length, 1),
      mostUsedFunctions: this.getMostUsedFunctions(functionCallEntries)
    };

    // Verification stats
    const verificationEntries = entries.filter(entry => entry.verification);
    const verificationStats = {
      totalVerifications: verificationEntries.length,
      averageVerificationConfidence: verificationEntries.reduce((sum, entry) => sum + (entry.verification?.confidence || 0), 0) / Math.max(verificationEntries.length, 1),
      criticalFieldFailures: verificationEntries.filter(entry => !entry.verification?.criticalFieldValidation.criticalFieldsValid).length
    };

    // Grounding stats
    const groundingEntries = entries.filter(entry => entry.grounding.enabled);
    const groundingStats = {
      totalGroundedQueries: groundingEntries.length,
      averageSourceCount: groundingEntries.reduce((sum, entry) => sum + entry.grounding.sourceCount, 0) / Math.max(groundingEntries.length, 1),
      averageRelevanceScore: groundingEntries.reduce((sum, entry) => sum + entry.grounding.averageRelevance, 0) / Math.max(groundingEntries.length, 1)
    };

    return {
      totalRequests,
      averageConfidence,
      successRate,
      averageResponseTime,
      errorsByType,
      usageByTaskType,
      qualityTrends: qualityTrends.sort((a, b) => a.date.localeCompare(b.date)),
      functionCallStats,
      verificationStats,
      groundingStats
    };
  }

  async getFullInteraction(id: string): Promise<EnhancedAuditLogEntry | null> {
    const entry = this.entries.find(e => e.id === id);
    return entry || null;
  }

  async exportToCSV(filters: EnhancedAuditQueryFilters): Promise<string> {
    const entries = await this.query(filters);
    
    const headers = [
      'id', 'timestamp', 'taskType', 'agentType', 'confidence',
      'responseTime', 'requiresReview', 'hasFunctionCalls', 'hasVerification',
      'hasGrounding', 'overallQualityScore', 'errors'
    ];

    const csvRows = [headers.join(',')];
    
    entries.forEach(entry => {
      const row = [
        entry.id,
        entry.timestamp,
        entry.taskType,
        entry.agentType,
        entry.validation.confidence,
        entry.performance.totalResponseTime,
        entry.compliance.requiresHumanReview,
        !!entry.functionCall,
        !!entry.verification,
        entry.grounding.enabled,
        entry.quality.overallScore,
        `"${entry.validation.errors.join('; ')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  async exportToJSON(filters: EnhancedAuditQueryFilters): Promise<string> {
    const entries = await this.query(filters);
    return JSON.stringify(entries, null, 2);
  }

  private getMostUsedFunctions(functionCallEntries: EnhancedAuditLogEntry[]): Record<string, number> {
    const functionCounts: Record<string, number> = {};
    
    functionCallEntries.forEach(entry => {
      const functionName = entry.functionCall?.functionName;
      if (functionName) {
        functionCounts[functionName] = (functionCounts[functionName] || 0) + 1;
      }
    });

    return functionCounts;
  }
}

// Enhanced audit logger class
export class EnhancedAuditLogger {
  private storage: EnhancedAuditStorage;
  private config: DeterministicConfig;

  constructor(storage: EnhancedAuditStorage, config: DeterministicConfig) {
    this.storage = storage;
    this.config = config;
  }

  async logInteraction(params: {
    taskType: string;
    agentType: string;
    input: any;
    model: string;
    
    // Prompt tracking
    prompts: {
      systemPrompt: string;
      userPrompt: string;
      groundingPrompt?: string;
      verificationPrompt?: string;
      fullPrompt: string;
      promptTokens: number;
    };
    
    // Response tracking
    rawOutput: string;
    parsedOutput?: any;
    responseTokens: number;
    
    // Function calling
    functionCallResult?: FunctionCallResult;
    functionCallTime?: number;
    
    // Validation
    validation: ValidationResult;
    validationTime: number;
    
    // Grounding
    groundingResult?: GroundingResult;
    groundingTime?: number;
    
    // Verification
    verificationResult?: EnhancedVerificationResult;
    verificationTime?: number;
    
    // Consensus validation
    consensusResult?: any;
    consensusTime?: number;
    
    // Performance
    totalResponseTime: number;
    modelResponseTime: number;
    
    // Session info
    sessionId?: string;
    userId?: string;
    requestId?: string;
  }): Promise<void> {
    const entry: EnhancedAuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      sessionId: params.sessionId,
      userId: params.userId,
      
      taskType: params.taskType,
      agentType: params.agentType,
      input: params.input,
      inputHash: this.hashObject(params.input),
      
      model: params.model,
      config: this.config,
      
      prompts: params.prompts,
      
      rawOutput: params.rawOutput,
      parsedOutput: params.parsedOutput,
      outputHash: this.hashString(params.rawOutput),
      responseTokens: params.responseTokens,
      
      functionCall: params.functionCallResult ? {
        functionName: params.functionCallResult.name,
        functionArgs: params.functionCallResult.args,
        functionSuccess: params.functionCallResult.success,
        functionError: params.functionCallResult.error
      } : undefined,
      
      validation: {
        passed: params.validation.success,
        errors: params.validation.errors,
        warnings: params.validation.warnings,
        confidence: params.validation.confidence,
        retryCount: params.validation.retryCount,
        processingTime: params.validationTime
      },
      
          grounding: {
            enabled: !!params.groundingResult,
            sources: (params.groundingResult?.sources || []).map(source => ({
              id: source.id,
              title: source.title,
              content: source.content,
              url: source.url,
              relevanceScore: source.relevanceScore,
              reliability: source.reliability,
              category: source.category
            })),
            sourceCount: params.groundingResult?.sources?.length || 0,
            averageRelevance: params.groundingResult?.totalRelevanceScore || 0,
            hasHighQualitySources: params.groundingResult?.hasHighQualitySources || false,
            groundingTime: params.groundingTime || 0
          },
      
          verification: params.verificationResult ? {
      passed: (params.verificationResult.overallAssessment?.overallConfidence || 0) >= (this.config.confidenceThreshold ?? 0),
      confidence: params.verificationResult.overallAssessment?.overallConfidence || 0,
            discrepancies: params.verificationResult.overallAssessment?.criticalIssues || [],
            verificationTime: params.verificationTime || 0,
            evidenceJustifications: (params.verificationResult.evidenceJustifications || []).map(justification => ({
              fieldName: justification.fieldName,
              evidence: {
                directQuote: justification.evidence?.directQuote || '',
                sourceId: justification.evidence?.sourceId || '',
                reliabilityScore: justification.evidence?.reliabilityScore || 0
              },
              confidence: justification.confidence || 0,
              verificationStatus: justification.verificationStatus || ''
            })),
            criticalFieldValidation: {
              criticalFieldsValid: (params.verificationResult.overallAssessment?.criticalIssues || []).length === 0,
              criticalIssues: params.verificationResult.overallAssessment?.criticalIssues || [],
              requiredHumanReview: params.verificationResult.overallAssessment?.requiresHumanReview || false
            }
          } : undefined,
      
      consensusValidation: params.consensusResult ? {
        enabled: true,
        candidateCount: params.consensusResult.candidates?.length || 0,
        consensusConfidence: params.consensusResult.consensusConfidence || 0,
        consensusResult: params.consensusResult.consensusResult,
        requiresHumanReview: params.consensusResult.requiresHumanReview || false
      } : undefined,
      
      performance: {
        totalResponseTime: params.totalResponseTime,
        modelResponseTime: params.modelResponseTime,
        validationTime: params.validationTime,
        groundingTime: params.groundingTime || 0,
        verificationTime: params.verificationTime || 0,
        consensusTime: params.consensusTime || 0,
        tokenCount: this.estimateTokenCount(params.rawOutput),
        retryCount: params.validation.retryCount,
        functionCallTime: params.functionCallTime || 0
      },
      
      quality: this.calculateQualityScores(params.validation, params.groundingResult, params.verificationResult),
      
      compliance: {
        passedSafetyChecks: !this.hasFlaggedContent(params.rawOutput),
        flaggedContent: this.detectFlaggedContent(params.rawOutput),
        dataPrivacyCompliant: this.checkDataPrivacy(params.input, params.rawOutput),
  requiresHumanReview: (params.validation as any).needsReview || (params.validation.confidence < (this.config.confidenceThreshold ?? 0)),
        criticalFieldsReviewed: !params.verificationResult || params.verificationResult.overallAssessment.criticalIssues.length === 0,
        antiHallucinationCompliant: !this.detectHallucinations(params.rawOutput, params.groundingResult)
      },
      
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        apiVersion: '2.1.0',
        requestId: params.requestId,
        vercelId: process.env.VERCEL_ID || 'unknown',
        userAgent: process.env.USER_AGENT || 'unknown'
      }
    };

    try {
      await this.storage.save(entry);
      console.log(`Enhanced audit log saved: ${entry.id}`);
    } catch (error) {
      console.error('Failed to save enhanced audit log:', error);
    }
  }

  async queryLogs(filters: EnhancedAuditQueryFilters): Promise<EnhancedAuditLogEntry[]> {
    return await this.storage.query(filters);
  }

  async getStats(timeRange: { start: string; end: string }): Promise<EnhancedAuditStats> {
    return await this.storage.getStats(timeRange);
  }

  async getFullInteraction(id: string): Promise<EnhancedAuditLogEntry | null> {
    return await this.storage.getFullInteraction(id);
  }

  async exportData(filters: EnhancedAuditQueryFilters, format: 'csv' | 'json'): Promise<string> {
    if (format === 'csv') {
      return await this.storage.exportToCSV(filters);
    } else {
      return await this.storage.exportToJSON(filters);
    }
  }

  // Private helper methods
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashObject(obj: any): string {
    return this.hashString(JSON.stringify(obj));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateQualityScores(
    validation: ValidationResult,
    groundingResult?: GroundingResult,
    verificationResult?: EnhancedVerificationResult
  ): EnhancedAuditLogEntry['quality'] {
    const accuracyScore = validation.confidence;
    const completenessScore = 1 - (validation.warnings.length / Math.max(validation.warnings.length + 1, 1));
    const reliabilityScore = groundingResult ? 
      (groundingResult.hasHighQualitySources ? 0.9 : 0.6) * groundingResult.totalRelevanceScore : 
      0.5;
    
    let overallScore = (accuracyScore * 0.4 + completenessScore * 0.3 + reliabilityScore * 0.3);
    
    if (verificationResult) {
      overallScore = overallScore * 0.7 + verificationResult.overallAssessment.overallConfidence * 0.3;
    }

    return {
      overallScore,
      accuracyScore,
      completenessScore,
      reliabilityScore,
      consistencyScore: verificationResult?.overallAssessment.overallConfidence
    };
  }

  private hasFlaggedContent(content: string): boolean {
    const flaggedTerms = ['password', 'secret', 'private key', 'token', 'api key'];
    const lowerContent = content.toLowerCase();
    return flaggedTerms.some(term => lowerContent.includes(term));
  }

  private detectFlaggedContent(content: string): string[] {
    const flaggedTerms = ['password', 'secret', 'private key', 'token', 'api key'];
    const lowerContent = content.toLowerCase();
    return flaggedTerms.filter(term => lowerContent.includes(term));
  }

  private checkDataPrivacy(input: any, output: string): boolean {
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
      /\b\d{3}-\d{2}-\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    ];

    const inputStr = JSON.stringify(input).toLowerCase();
    const outputStr = output.toLowerCase();

    return !sensitivePatterns.some(pattern => 
      pattern.test(inputStr) || pattern.test(outputStr)
    );
  }

  private detectHallucinations(output: string, groundingResult?: GroundingResult): boolean {
    // Simple hallucination detection - check for uncertainty markers
    const uncertaintyMarkers = ['might be', 'probably', 'likely', 'perhaps', 'possibly'];
    const lowerOutput = output.toLowerCase();
    
    return uncertaintyMarkers.some(marker => lowerOutput.includes(marker)) && 
           (!groundingResult || groundingResult.sources.length === 0);
  }
}

// Factory function
export function createEnhancedAuditLogger(config: DeterministicConfig): EnhancedAuditLogger {
  const storage = new EnhancedInMemoryAuditStorage();
  return new EnhancedAuditLogger(storage, config);
}

// Note: EnhancedInMemoryAuditStorage is exported via its declaration above; no extra re-export needed.