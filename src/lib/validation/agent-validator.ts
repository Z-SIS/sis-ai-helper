import { z } from 'zod';
import {
  AgentInputSchemas,
  AgentOutputSchemas,
  AgentType,
  AgentInput,
  AgentOutput,
  validateAgentInput as baseValidateAgentInput,
  validateAgentOutput as baseValidateAgentOutput,
  safeValidateAgentInput,
  safeValidateAgentOutput
} from '../../shared/schemas';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  path?: (string | number)[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface AgentValidationResult extends ValidationResult<AgentInput> {
  agentType: AgentType;
  metadata: {
    inputSize: number;
    estimatedTokens: number;
    complexity: 'simple' | 'medium' | 'complex';
  };
}

// ============================================================================
// AGENT VALIDATOR CLASS
// ============================================================================

export class AgentValidator {
  private static instance: AgentValidator;
  
  public static getInstance(): AgentValidator {
    if (!AgentValidator.instance) {
      AgentValidator.instance = new AgentValidator();
    }
    return AgentValidator.instance;
  }
  
  // Validate agent input
  public validateInput<T extends AgentInput>(
    agentType: AgentType,
    data: unknown
  ): AgentValidationResult {
    const startTime = Date.now();
    
    try {
      // Check if agent type exists
      if (!AgentInputSchemas[agentType]) {
        return {
          success: false,
          errors: [{
            field: 'agentType',
            message: `Invalid agent type: ${agentType}`,
            code: 'INVALID_AGENT_TYPE',
          }],
          agentType,
          metadata: {
            inputSize: 0,
            estimatedTokens: 0,
            complexity: 'simple',
          },
        };
      }
      
      // Validate input data
      const validationResult = safeValidateAgentInput(agentType, data);
      
      if (!validationResult.success) {
        const errors = (validationResult as any).error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
          path: err.path,
        }));
        
        return {
          success: false,
          errors,
          agentType,
          metadata: this.getMetadata(data),
        };
      }
      
      // Additional business logic validation
      const businessWarnings = this.validateBusinessRules(agentType, validationResult.data as AgentInput);
      
      return {
        success: true,
        data: validationResult.data as T,
        warnings: businessWarnings,
        agentType,
        metadata: this.getMetadata(validationResult.data as AgentInput),
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          code: 'VALIDATION_EXCEPTION',
        }],
        agentType,
        metadata: {
          inputSize: 0,
          estimatedTokens: 0,
          complexity: 'simple',
        },
      };
    } finally {
      const duration = Date.now() - startTime;
      console.log(`Validation for ${agentType} completed in ${duration}ms`);
    }
  }
  
  // Validate agent output
  public validateOutput<T extends AgentOutput>(
    agentType: AgentType,
    data: unknown
  ): ValidationResult<T> {
    try {
      const validationResult = safeValidateAgentOutput(agentType, data);
      
      if (!validationResult.success) {
        const errors = (validationResult as any).error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'OUTPUT_VALIDATION_ERROR',
          path: err.path,
        }));
        
        return {
          success: false,
          errors,
        };
      }
      
      // Additional output validation
      const warnings = this.validateOutputRules(agentType, validationResult.data as AgentOutput);
      
      return {
        success: true,
        data: validationResult.data as T,
        warnings,
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown output validation error',
          code: 'OUTPUT_VALIDATION_EXCEPTION',
        }],
      };
    }
  }
  
  // Validate batch of inputs
  public validateBatch<T extends AgentInput>(
    requests: Array<{ agentType: AgentType; data: unknown }>
  ): AgentValidationResult[] {
    return requests.map(req => this.validateInput(req.agentType, req.data));
  }
  
  // Private helper methods
  private getMetadata(data: any): {
    inputSize: number;
    estimatedTokens: number;
    complexity: 'simple' | 'medium' | 'complex';
  } {
    const inputSize = JSON.stringify(data).length;
    const estimatedTokens = Math.ceil(inputSize / 4);
    
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    if (estimatedTokens > 200) complexity = 'medium';
    if (estimatedTokens > 500) complexity = 'complex';
    
    return {
      inputSize,
      estimatedTokens,
      complexity,
    };
  }
  
  private validateBusinessRules(agentType: AgentType, data: AgentInput): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    switch (agentType) {
      case 'company-research':
        const companyData = data as any;
        if (companyData.companyName && companyData.companyName.length < 2) {
          warnings.push({
            field: 'companyName',
            message: 'Company name seems too short for accurate research',
            code: 'SHORT_COMPANY_NAME',
          });
        }
        break;
        
      case 'compose-email':
        const emailData = data as any;
        if (emailData.subject && emailData.subject.length > 100) {
          warnings.push({
            field: 'subject',
            message: 'Long subject lines may be truncated by email clients',
            code: 'LONG_SUBJECT',
          });
        }
        break;
        
      case 'slide-template':
        const slideData = data as any;
        if (slideData.slideCount && slideData.slideCount > 15) {
          warnings.push({
            field: 'slideCount',
            message: 'Presentations with many slides may lose audience attention',
            code: 'MANY_SLIDES',
          });
        }
        break;
    }
    
    return warnings;
  }
  
  private validateOutputRules(agentType: AgentType, data: AgentOutput): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    switch (agentType) {
      case 'company-research':
        const companyOutput = data as any;
        if (!companyOutput.website) {
          warnings.push({
            field: 'website',
            message: 'No website found - company may not have an online presence',
            code: 'NO_WEBSITE',
          });
        }
        break;
        
      case 'feasibility-check':
        const feasibilityOutput = data as any;
        if (feasibilityOutput.score < 30) {
          warnings.push({
            field: 'score',
            message: 'Very low feasibility score - project may not be viable',
            code: 'LOW_FEASIBILITY',
          });
        }
        break;
    }
    
    return warnings;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const agentValidator = AgentValidator.getInstance();

// Convenience functions
export const validateAgentInput = <T extends AgentInput>(
  agentType: AgentType,
  data: unknown
): AgentValidationResult => {
  return agentValidator.validateInput(agentType, data);
};

export const validateAgentOutput = <T extends AgentOutput>(
  agentType: AgentType,
  data: unknown
): ValidationResult<T> => {
  return agentValidator.validateOutput(agentType, data);
};

export const validateAgentBatch = (
  requests: Array<{ agentType: AgentType; data: unknown }>
): AgentValidationResult[] => {
  return agentValidator.validateBatch(requests);
};

// ============================================================================
// ERROR FORMATTER
// ============================================================================

export class ValidationErrorFormatter {
  static formatForAPI(validationResult: ValidationResult): {
    error?: string;
    details?: any;
    warnings?: any;
  } {
    if (!validationResult.success) {
      return {
        error: 'Validation failed',
        details: validationResult.errors?.map(err => ({
          field: err.field,
          message: err.message,
          code: err.code,
        })),
        warnings: validationResult.warnings?.map(warn => ({
          field: warn.field,
          message: warn.message,
          code: warn.code,
        })),
      };
    }
    
    return {
      warnings: validationResult.warnings?.map(warn => ({
        field: warn.field,
        message: warn.message,
        code: warn.code,
      })),
    };
  }
  
  static formatForUI(validationResult: ValidationResult): {
    errors: string[];
    warnings: string[];
  } {
    const errors = validationResult.errors?.map(err => 
      `${err.field}: ${err.message}`
    ) || [];
    
    const warnings = validationResult.warnings?.map(warn => 
      `${warn.field}: ${warn.message}`
    ) || [];
    
    return { errors, warnings };
  }
}