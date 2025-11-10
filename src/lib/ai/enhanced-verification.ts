/**
 * Enhanced Verification System with Evidence Justification
 * 
 * Implements multi-layer verification with evidence quotation,
 * confidence assessment, and critical field validation.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  VERIFICATION_PROMPT, 
  EVIDENCE_JUSTIFICATION_PROMPT,
  CRITICAL_FIELDS,
  CRITICAL_CONFIDENCE_THRESHOLD
} from './deterministic-config';
import { GroundingResult } from './grounding-system';

// Verification result interfaces
export interface EvidenceJustification {
  fieldName: string;
  value: any;
  evidence: {
    directQuote: string;
    sourceId: string;
    location: string;
    context: string;
    reliabilityScore: number;
  };
  justification: string;
  confidence: number;
  verificationStatus: 'verified' | 'unverified' | 'partially_verified' | 'conflicting_data';
}

export interface FieldVerificationResult {
  fieldName: string;
  supported: boolean;
  confidence: number;
  evidenceQuotes: string[];
  sourceReferences: string[];
  discrepancies: string[];
  verificationNotes: string;
  isCritical: boolean;
}

export interface EnhancedVerificationResult {
  verificationResults: Record<string, FieldVerificationResult>;
  overallAssessment: {
    totalFields: number;
    supportedFields: number;
    unsupportedFields: number;
    overallConfidence: number;
    requiresHumanReview: boolean;
    criticalIssues: string[];
  };
  evidenceJustifications: EvidenceJustification[];
  processingTime: number;
  modelUsed: string;
}

export interface ConsensusCandidate {
  candidateId: number;
  data: any;
  confidence: number;
  validationErrors: string[];
  consistencyScore: number;
}

// Enhanced verification system class
export class EnhancedVerificationSystem {
  private genAI: any;
  private model: any;

  constructor() {
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!googleApiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured for verification');
    }
    
    this.genAI = new GoogleGenerativeAI(googleApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.0, // Ultra-deterministic for verification
        topP: 0.0,
        topK: 10,
        candidateCount: 1,
        maxOutputTokens: 4096,
        responseFormat: { mimeType: "application/json" }
      }
    });
  }

  async performEnhancedVerification(
    agentType: string,
    outputData: any,
    groundingResult?: GroundingResult,
    originalPrompt?: string
  ): Promise<EnhancedVerificationResult> {
    const startTime = Date.now();

    try {
      // Step 1: Evidence justification for each field
      const evidenceJustifications = await this.performEvidenceJustification(
        outputData,
        groundingResult
      );

      // Step 2: Field-by-field verification
      const verificationResults = await this.performFieldVerification(
        outputData,
        groundingResult,
        originalPrompt
      );

      // Step 3: Critical field validation
      const criticalFieldValidation = this.validateCriticalFields(
        agentType,
        verificationResults
      );

      // Step 4: Overall assessment
      const overallAssessment = this.calculateOverallAssessment(
        verificationResults,
        criticalFieldValidation
      );

      return {
        verificationResults,
        overallAssessment,
        evidenceJustifications,
        processingTime: Date.now() - startTime,
        modelUsed: 'gemini-2.0-flash-exp'
      };

    } catch (error) {
      console.error('Enhanced verification failed:', error);
      
      // Return a failed verification result
      return {
        verificationResults: {},
        overallAssessment: {
          totalFields: 0,
          supportedFields: 0,
          unsupportedFields: 0,
          overallConfidence: 0,
          requiresHumanReview: true,
          criticalIssues: [`Verification process failed: ${(error as Error).message}`]
        },
        evidenceJustifications: [],
        processingTime: Date.now() - startTime,
        modelUsed: 'gemini-2.0-flash-exp'
      };
    }
  }

  private async performEvidenceJustification(
    outputData: any,
    groundingResult?: GroundingResult
  ): Promise<EvidenceJustification[]> {
    const justifications: EvidenceJustification[] = [];

    // Prepare grounding context
    const groundingText = groundingResult?.sources.map(source => 
      `Source: ${source.title}\nContent: ${source.content}\nReliability: ${source.reliability}\n`
    ).join('\n---\n') || 'No grounding sources available.';

    for (const [fieldName, fieldValue] of Object.entries(outputData)) {
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        // Handle nested objects
        const nestedJustifications = await this.performEvidenceJustification(fieldValue, groundingResult);
        justifications.push(...nestedJustifications);
      } else if (typeof fieldValue !== 'function') {
        // Process individual fields
        try {
          const justificationPrompt = this.buildEvidenceJustificationPrompt(
            fieldName,
            fieldValue,
            groundingText
          );

          const result = await this.model.generateContent([
            { text: EVIDENCE_JUSTIFICATION_PROMPT },
            { text: justificationPrompt }
          ]);

          const response = result.response.text();
          const parsedResponse = JSON.parse(response);

          if (parsedResponse.field_justifications && parsedResponse.field_justifications[fieldName]) {
            const fieldJustification = parsedResponse.field_justifications[fieldName];
            justifications.push({
              fieldName,
              value: fieldValue,
              evidence: fieldJustification.evidence || {
                directQuote: 'No direct quote available',
                sourceId: 'unknown',
                location: 'unknown',
                context: 'No context available',
                reliabilityScore: 0.0
              },
              justification: fieldJustification.justification || 'No justification provided',
              confidence: fieldJustification.confidence || 0.0,
              verificationStatus: fieldJustification.verification_status || 'unverified'
            });
          }

        } catch (error) {
          console.warn(`Evidence justification failed for field ${fieldName}:`, error);
          justifications.push({
            fieldName,
            value: fieldValue,
            evidence: {
              directQuote: 'No evidence available',
              sourceId: 'none',
              location: 'none',
              context: 'No context',
              reliabilityScore: 0.0
            },
            justification: `Evidence justification failed: ${(error as Error).message}`,
            confidence: 0.0,
            verificationStatus: 'unverified'
          });
        }
      }
    }

    return justifications;
  }

  private async performFieldVerification(
    outputData: any,
    groundingResult?: GroundingResult,
    originalPrompt?: string
  ): Promise<Record<string, FieldVerificationResult>> {
    const verificationResults: Record<string, FieldVerificationResult> = {};

    // Prepare verification context
    const groundingText = groundingResult?.sources.map(source => 
      `Source ID: ${source.id}\nTitle: ${source.title}\nContent: ${source.content}\nReliability: ${source.reliability}\n`
    ).join('\n---\n') || 'No grounding sources available.';

    const verificationPrompt = this.buildVerificationPrompt(
      outputData,
      groundingText,
      originalPrompt
    );

    try {
      const result = await this.model.generateContent([
        { text: VERIFICATION_PROMPT },
        { text: verificationPrompt }
      ]);

      const response = result.response.text();
      const parsedResponse = JSON.parse(response);

      if (parsedResponse.verification_results) {
        for (const [fieldName, verification] of Object.entries(parsedResponse.verification_results)) {
          const fieldVerification = verification as any;
          
          verificationResults[fieldName] = {
            fieldName,
            supported: fieldVerification.supported || false,
            confidence: fieldVerification.confidence || 0.0,
            evidenceQuotes: fieldVerification.evidence_quotes || [],
            sourceReferences: fieldVerification.source_references || [],
            discrepancies: fieldVerification.discrepancies || [],
            verificationNotes: fieldVerification.verification_notes || '',
            isCritical: this.isCriticalField(fieldName)
          };
        }
      }

    } catch (error) {
      console.error('Field verification failed:', error);
      
      // Create failed verification results for all fields
      for (const fieldName of Object.keys(outputData)) {
        if (typeof outputData[fieldName] !== 'object' || outputData[fieldName] === null) {
          verificationResults[fieldName] = {
            fieldName,
            supported: false,
            confidence: 0.0,
            evidenceQuotes: [],
            sourceReferences: [],
            discrepancies: [`Verification failed: ${(error as Error).message}`],
            verificationNotes: 'Verification process failed',
            isCritical: this.isCriticalField(fieldName)
          };
        }
      }
    }

    return verificationResults;
  }

  private validateCriticalFields(
    agentType: string,
    verificationResults: Record<string, FieldVerificationResult>
  ): {
    criticalFieldsValid: boolean;
    criticalIssues: string[];
    requiredHumanReview: boolean;
  } {
  // CRITICAL_FIELDS is a global list of required critical fields across agents
  const criticalFieldsForAgent = CRITICAL_FIELDS || [];
    const criticalIssues: string[] = [];
    let allCriticalValid = true;

    for (const fieldName of criticalFieldsForAgent) {
      const verification = verificationResults[fieldName];
      
      if (!verification) {
        criticalIssues.push(`Critical field '${fieldName}' is missing from verification results`);
        allCriticalValid = false;
        continue;
      }

      if (verification.confidence < CRITICAL_CONFIDENCE_THRESHOLD) {
        criticalIssues.push(
          `Critical field '${fieldName}' has low confidence: ${verification.confidence} < ${CRITICAL_CONFIDENCE_THRESHOLD}`
        );
        allCriticalValid = false;
      }

      if (!verification.supported) {
        criticalIssues.push(`Critical field '${fieldName}' is not supported by sources`);
        allCriticalValid = false;
      }

      if (verification.discrepancies.length > 0) {
        criticalIssues.push(
          `Critical field '${fieldName}' has discrepancies: ${verification.discrepancies.join(', ')}`
        );
        allCriticalValid = false;
      }
    }

    return {
      criticalFieldsValid: allCriticalValid,
      criticalIssues,
      requiredHumanReview: !allCriticalValid
    };
  }

  private calculateOverallAssessment(
    verificationResults: Record<string, FieldVerificationResult>,
    criticalFieldValidation: any
  ): EnhancedVerificationResult['overallAssessment'] {
    const totalFields = Object.keys(verificationResults).length;
    const supportedFields = Object.values(verificationResults).filter(v => v.supported).length;
    const unsupportedFields = totalFields - supportedFields;

    // Calculate overall confidence
    const confidences = Object.values(verificationResults).map(v => v.confidence);
    const overallConfidence = confidences.length > 0 ? 
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0;

    // Determine if human review is required
    const requiresHumanReview = 
      overallConfidence < CRITICAL_CONFIDENCE_THRESHOLD ||
      criticalFieldValidation.requiredHumanReview ||
      unsupportedFields > 0;

    // Collect critical issues
    const criticalIssues = [...criticalFieldValidation.criticalIssues];
    
    // Add issues from unsupported critical fields
    Object.entries(verificationResults).forEach(([fieldName, verification]) => {
      if (verification.isCritical && !verification.supported) {
        criticalIssues.push(`Critical field '${fieldName}' is not supported by sources`);
      }
    });

    return {
      totalFields,
      supportedFields,
      unsupportedFields,
      overallConfidence,
      requiresHumanReview,
      criticalIssues
    };
  }

  private buildEvidenceJustificationPrompt(
    fieldName: string,
    fieldValue: any,
    groundingText: string
  ): string {
    return `Please provide evidence justification for this field:

Field Name: ${fieldName}
Field Value: ${JSON.stringify(fieldValue)}

Available Sources:
${groundingText}

Analyze the provided sources and determine if there is direct evidence supporting this field value.
Provide exact quotes, source references, and assess reliability.
`;
  }

  private buildVerificationPrompt(
    outputData: any,
    groundingText: string,
    originalPrompt?: string
  ): string {
    return `Please verify this AI-generated output against the provided sources:

AI Output to Verify:
${JSON.stringify(outputData, null, 2)}

${originalPrompt ? `Original Prompt: ${originalPrompt}\n` : ''}

Available Sources for Verification:
${groundingText}

For each field in the output, determine if it is supported by the provided sources.
Provide exact evidence quotes and assess confidence levels.
`;
  }

  private isCriticalField(fieldName: string): boolean {
    return (CRITICAL_FIELDS || []).includes(fieldName);
  }
}

// N-best candidates with consensus validation
export class ConsensusValidationSystem {
  private verificationSystem: EnhancedVerificationSystem;

  constructor() {
    this.verificationSystem = new EnhancedVerificationSystem();
  }

  async generateAndValidateCandidates(
    agentType: string,
    prompt: string,
    numCandidates: number = 3,
    groundingResult?: GroundingResult
  ): Promise<{
    candidates: ConsensusCandidate[];
    consensusResult: any;
    consensusConfidence: number;
    requiresHumanReview: boolean;
  }> {
    const candidates: ConsensusCandidate[] = [];

    // Generate multiple candidates
    for (let i = 0; i < numCandidates; i++) {
      try {
        const candidateData = await this.generateSingleCandidate(prompt);
        const verification = await this.verificationSystem.performEnhancedVerification(
          agentType,
          candidateData,
          groundingResult,
          prompt
        );

        candidates.push({
          candidateId: i,
          data: candidateData,
          confidence: verification.overallAssessment.overallConfidence,
          validationErrors: verification.overallAssessment.criticalIssues,
          consistencyScore: this.calculateConsistencyScore(candidateData, candidates)
        });

      } catch (error) {
        console.warn(`Failed to generate candidate ${i}:`, error);
      }
    }

    // Analyze consensus
    const consensusResult = this.calculateConsensus(candidates);
    const consensusConfidence = this.calculateConsensusConfidence(candidates);
    const requiresHumanReview = consensusConfidence < CRITICAL_CONFIDENCE_THRESHOLD;

    return {
      candidates,
      consensusResult,
      consensusConfidence,
      requiresHumanReview
    };
  }

  private async generateSingleCandidate(prompt: string): Promise<any> {
    // This would use the same AI model to generate a candidate
    // For now, return a placeholder
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.0,
        topP: 0.0,
        candidateCount: 1,
        maxOutputTokens: 2048
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch {
      return { raw_response: response };
    }
  }

  private calculateConsistencyScore(candidate: any, previousCandidates: ConsensusCandidate[]): number {
    if (previousCandidates.length === 0) return 1.0;

    // Simple consistency calculation based on field overlap
    let totalFields = 0;
    let matchingFields = 0;

    for (const prevCandidate of previousCandidates) {
      const candidateFields = Object.keys(candidate);
      const prevFields = Object.keys(prevCandidate.data);
      
      totalFields += Math.max(candidateFields.length, prevFields.length);
      
      const commonFields = candidateFields.filter(field => prevFields.includes(field));
      const matchingValues = commonFields.filter(field => 
        JSON.stringify(candidate[field]) === JSON.stringify(prevCandidate.data[field])
      );
      
      matchingFields += matchingValues.length;
    }

    return totalFields > 0 ? matchingFields / totalFields : 1.0;
  }

  private calculateConsensus(candidates: ConsensusCandidate[]): any {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0].data;

    // Find the candidate with highest confidence
    const bestCandidate = candidates.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return bestCandidate.data;
  }

  private calculateConsensusConfidence(candidates: ConsensusCandidate[]): number {
    if (candidates.length === 0) return 0.0;
    if (candidates.length === 1) return candidates[0].confidence;

    // Calculate weighted average based on consistency
    const totalWeight = candidates.reduce((sum, candidate) => 
      sum + candidate.confidence * candidate.consistencyScore, 0
    );
    
    const totalPossibleWeight = candidates.reduce((sum, candidate) => 
      sum + candidate.consistencyScore, 0
    );

    return totalPossibleWeight > 0 ? totalWeight / totalPossibleWeight : 0.0;
  }
}

// Factory functions
export function createEnhancedVerificationSystem(): EnhancedVerificationSystem {
  return new EnhancedVerificationSystem();
}

export function createConsensusValidationSystem(): ConsensusValidationSystem {
  return new ConsensusValidationSystem();
}