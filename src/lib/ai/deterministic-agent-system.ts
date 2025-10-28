/**
 * Deterministic AI Agent System
 * 
 * Integrates all deterministic AI components:
 * - Configuration management
 * - Schema validation
 * - Grounding/RAG
 * - Verification
 * - Audit logging
 */

import { 
  getDeterministicConfig, 
  DEFAULT_DETERMINISTIC_CONFIG,
  type DeterministicConfig 
} from './deterministic-config';
import { 
  createDeterministicValidator, 
  createOutputVerifier,
  type ValidationResult 
} from './schema-validator';
import { 
  createGroundingSystem, 
  createGroundedPromptBuilder,
  type GroundingResult 
} from './grounding-system';
import { 
  createAuditLogger,
  type AuditLogger 
} from './audit-logger';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Enhanced agent interface
export interface DeterministicAgentRequest {
  agentType: string;
  input: any;
  taskType?: 'extraction' | 'analysis' | 'composition' | 'default';
  sessionId?: string;
  userId?: string;
  requestId?: string;
  customConfig?: Partial<DeterministicConfig>;
}

export interface DeterministicAgentResponse {
  success: boolean;
  data?: any;
  confidence: number;
  needsReview: boolean;
  warnings: string[];
  errors: string[];
  metadata: {
    processingTime: number;
    validationTime: number;
    groundingTime: number;
    verificationTime: number;
    retryCount: number;
    sources: string[];
    qualityScore: number;
  };
}

// Main deterministic agent system
export class DeterministicAgentSystem {
  private config: DeterministicConfig;
  private validator: any;
  private verifier: any;
  private groundingSystem: any;
  private promptBuilder: any;
  private auditLogger: AuditLogger;
  private genAI: any;

  constructor(config: Partial<DeterministicConfig> = {}) {
    this.config = { ...DEFAULT_DETERMINISTIC_CONFIG, ...config };
    
    // Initialize components
    this.validator = createDeterministicValidator(this.config);
    this.verifier = createOutputVerifier(this.config);
    this.groundingSystem = createGroundingSystem();
    this.promptBuilder = createGroundedPromptBuilder(this.groundingSystem);
    this.auditLogger = createAuditLogger(this.config);
    
    // Initialize Google AI
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!googleApiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(googleApiKey);
  }

  async processRequest(request: DeterministicAgentRequest): Promise<DeterministicAgentResponse> {
    const startTime = Date.now();
    let validationTime = 0;
    let groundingTime = 0;
    let verificationTime = 0;
    let retryCount = 0;
    let rawOutput = '';
    let validatedData: any = null;
    let groundingResult: GroundingResult | undefined;
    let verificationResult: any;

    try {
      // Determine task type
      const taskType = request.taskType || this.getTaskTypeFromAgent(request.agentType);
      
      // Get configuration for this task
      const effectiveConfig = { ...this.config, ...request.customConfig };
      
      // Step 1: Build grounded prompt
      const groundingStart = Date.now();
      const { prompt, groundingResult: gr, hasGrounding } = await this.promptBuilder.buildGroundedPrompt(
        this.getBasePrompt(request.agentType),
        this.buildQueryFromInput(request.input),
        JSON.stringify(request.input)
      );
      groundingResult = gr;
      groundingTime = Date.now() - groundingStart;

      // Step 2: Generate AI response
      const modelStart = Date.now();
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: effectiveConfig.temperature,
          maxOutputTokens: effectiveConfig.maxOutputTokens,
          topP: effectiveConfig.topP,
          topK: effectiveConfig.topK,
          candidateCount: effectiveConfig.candidateCount,
          responseFormat: effectiveConfig.responseFormat === 'json_object' ? 
            { mimeType: "application/json" } : undefined
        }
      });

      const result = await model.generateContent([
        { text: prompt },
        { text: this.buildUserPrompt(request.agentType, request.input) }
      ]);

      rawOutput = result.response.text();
      const modelTime = Date.now() - modelStart;

      if (!rawOutput) {
        throw new Error('No response received from AI model');
      }

      // Step 3: Validate output
      const validationStart = Date.now();
      const validationResult = await this.validator.validateWithRetry(
        request.agentType,
        rawOutput,
        effectiveConfig.maxRetries
      );
      validationTime = Date.now() - validationStart;
      retryCount = validationResult.retryCount;

      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      validatedData = validationResult.data;

      // Step 4: Verify output if enabled
      if (effectiveConfig.enableVerification) {
        const verificationStart = Date.now();
        verificationResult = await this.verifier.verifyOutput(
          request.agentType,
          validatedData,
          groundingResult?.sources.map(s => s.content)
        );
        verificationTime = Date.now() - verificationStart;
      }

      // Step 5: Calculate final confidence and quality
      const finalConfidence = this.calculateFinalConfidence(
        validationResult.confidence,
        verificationResult?.confidence,
        groundingResult?.totalRelevanceScore
      );

      const needsReview = finalConfidence < effectiveConfig.confidenceThreshold ||
                         validationResult.needsReview ||
                         (verificationResult && !verificationResult.verified);

      // Step 6: Log the interaction
      await this.auditLogger.logInteraction({
        taskType,
        agentType: request.agentType,
        input: request.input,
        model: 'gemini-2.0-flash-exp',
        rawOutput,
        parsedOutput: validatedData,
        validation: validationResult,
        groundingResult,
        verificationResult,
        performance: {
          totalResponseTime: Date.now() - startTime,
          modelResponseTime: modelTime,
          validationTime,
          groundingTime,
          verificationTime,
          tokenCount: this.estimateTokenCount(rawOutput)
        },
        sessionId: request.sessionId,
        userId: request.userId,
        requestId: request.requestId
      });

      return {
        success: true,
        data: validatedData,
        confidence: finalConfidence,
        needsReview,
        warnings: validationResult.warnings,
        errors: [],
        metadata: {
          processingTime: Date.now() - startTime,
          validationTime,
          groundingTime,
          verificationTime,
          retryCount,
          sources: groundingResult?.sources.map(s => s.title) || [],
          qualityScore: this.calculateQualityScore(validationResult, groundingResult, verificationResult)
        }
      };

    } catch (error) {
      // Log failed interaction
      await this.auditLogger.logInteraction({
        taskType: request.taskType || 'unknown',
        agentType: request.agentType,
        input: request.input,
        model: 'gemini-2.0-flash-exp',
        rawOutput,
        validation: {
          success: false,
          errors: [(error as Error).message],
          warnings: [],
          confidence: 0,
          retryCount,
          processingTime: validationTime
        },
        performance: {
          totalResponseTime: Date.now() - startTime,
          modelResponseTime: 0,
          validationTime,
          groundingTime,
          verificationTime
        },
        sessionId: request.sessionId,
        userId: request.userId,
        requestId: request.requestId
      });

      return {
        success: false,
        confidence: 0,
        needsReview: true,
        warnings: [],
        errors: [(error as Error).message],
        metadata: {
          processingTime: Date.now() - startTime,
          validationTime,
          groundingTime,
          verificationTime,
          retryCount,
          sources: groundingResult?.sources.map(s => s.title) || [],
          qualityScore: 0
        }
      };
    }
  }

  private getTaskTypeFromAgent(agentType: string): 'extraction' | 'analysis' | 'composition' | 'default' {
    if (agentType === 'company-research') return 'extraction';
    if (agentType === 'compose-email' || agentType === 'slide-template') return 'composition';
    return 'analysis';
  }

  private getBasePrompt(agentType: string): string {
    const prompts: Record<string, string> = {
      'company-research': 'Extract accurate company information from the provided data and context.',
      'generate-sop': 'Create standard operating procedures based on the requirements.',
      'compose-email': 'Generate a professional email based on the specifications.',
      'excel-helper': 'Provide Excel solutions and formulas.',
      'feasibility-check': 'Analyze feasibility and provide assessment.',
      'deployment-plan': 'Create deployment plan with phases and requirements.',
      'usps-battlecard': 'Generate competitive battlecard analysis.',
      'disbandment-plan': 'Create project disbandment plan.',
      'slide-template': 'Generate slide content and structure.'
    };
    
    return prompts[agentType] || 'Process the request accurately.';
  }

  private buildQueryFromInput(input: any): string {
    if (typeof input === 'string') return input;
    if (input.companyName) return `${input.companyName} company information`;
    if (input.projectName) return `${input.projectName} project details`;
    if (input.question) return input.question;
    if (input.recipient) return `email to ${input.recipient}`;
    return JSON.stringify(input);
  }

  private buildUserPrompt(agentType: string, input: any): string {
    return `Process this request: ${JSON.stringify(input, null, 2)}`;
  }

  private calculateFinalConfidence(
    validationConfidence: number,
    verificationConfidence?: number,
    groundingRelevance?: number
  ): number {
    let confidence = validationConfidence;
    
    if (verificationConfidence !== undefined) {
      confidence = (confidence + verificationConfidence) / 2;
    }
    
    if (groundingRelevance !== undefined) {
      confidence = confidence * 0.7 + groundingRelevance * 0.3;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private calculateQualityScore(
    validation: ValidationResult,
    grounding?: GroundingResult,
    verification?: any
  ): number {
    let score = validation.confidence;
    
    if (grounding && grounding.hasHighQualitySources) {
      score += 0.1;
    }
    
    if (verification && verification.verified) {
      score += 0.1;
    }
    
    if (validation.warnings.length === 0) {
      score += 0.05;
    }
    
    return Math.min(score, 1);
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  // Public methods for configuration and monitoring
  updateConfig(newConfig: Partial<DeterministicConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): DeterministicConfig {
    return { ...this.config };
  }

  async getAuditStats(timeRange: { start: string; end: string }) {
    return await this.auditLogger.getStats(timeRange);
  }

  async queryAuditLogs(filters: any) {
    return await this.auditLogger.queryLogs(filters);
  }
}

// Factory function
export function createDeterministicAgentSystem(config?: Partial<DeterministicConfig>): DeterministicAgentSystem {
  return new DeterministicAgentSystem(config);
}

// Export singleton instance
export const deterministicAgentSystem = createDeterministicAgentSystem();