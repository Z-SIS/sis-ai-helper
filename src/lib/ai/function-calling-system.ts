/**
 * Function Calling System for Structured Outputs
 * 
 * Implements function calling and typed outputs to ensure
 * deterministic, structured data from AI models.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { DeterministicConfig } from './deterministic-config';

// Function definition interfaces
export interface FunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  properties?: Record<string, FunctionParameter>;
  items?: FunctionParameter;
  enum?: string[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, FunctionParameter>;
    required: string[];
  };
}

export interface FunctionCallResult {
  name: string;
  args: any;
  success: boolean;
  error?: string;
  confidence: number;
  validationErrors: string[];
}

// Company research function schema
export const CompanyResearchFunction: FunctionDefinition = {
  name: 'extract_company_research',
  description: 'Extract structured company research information with confidence scoring',
  parameters: {
    type: 'object',
    properties: {
      companyName: {
        name: 'companyName',
        type: 'string',
        description: 'The exact name of the company',
        required: true
      },
      industry: {
        name: 'industry',
        type: 'string',
        description: 'The industry sector the company operates in',
        required: false
      },
      location: {
        name: 'location',
        type: 'string',
        description: 'Company headquarters or primary location',
        required: false
      },
      description: {
        name: 'description',
        type: 'string',
        description: 'Brief description of the company business',
        required: false
      },
      website: {
        name: 'website',
        type: 'string',
        description: 'Company website URL',
        required: false
      },
      foundedYear: {
        name: 'foundedYear',
        type: 'number',
        description: 'Year the company was founded',
        required: false
      },
      employeeCount: {
        name: 'employeeCount',
        type: 'object',
        description: 'Number of employees',
        required: false,
        properties: {
          count: {
            name: 'count',
            type: 'number',
            description: 'Exact number of employees'
          },
          confidence: {
            name: 'confidence',
            type: 'number',
            description: 'Confidence score for employee count (0-1)'
          }
        }
      },
      revenue: {
        name: 'revenue',
        type: 'object',
        description: 'Company revenue information',
        required: false,
        properties: {
          amount: {
            name: 'amount',
            type: 'number',
            description: 'Revenue amount'
          },
          currency: {
            name: 'currency',
            type: 'string',
            description: 'Currency code (e.g., USD, EUR)'
          },
          year: {
            name: 'year',
            type: 'number',
            description: 'Year of revenue'
          },
          confidence: {
            name: 'confidence',
            type: 'number',
            description: 'Confidence score for revenue data (0-1)'
          }
        }
      },
      keyExecutives: {
        name: 'keyExecutives',
        type: 'array',
        description: 'List of key executives',
        required: false,
        items: {
          name: 'executive',
          type: 'object',
          description: 'Executive information',
          properties: {
            name: {
              name: 'name',
              type: 'string',
              description: 'Executive name'
            },
            title: {
              name: 'title',
              type: 'string',
              description: 'Executive title/position'
            },
            confidence: {
              name: 'confidence',
              type: 'number',
              description: 'Confidence score for executive information (0-1)'
            }
          }
        }
      },
      confidenceScore: {
        name: 'confidenceScore',
        type: 'number',
        description: 'Overall confidence score for the extracted data (0-1)',
        required: true
      },
      sources: {
        name: 'sources',
        type: 'array',
        description: 'List of sources used for extraction',
        required: false,
        items: {
          name: 'source',
          type: 'string',
          description: 'Source reference'
        }
      },
      unverifiedFields: {
        name: 'unverifiedFields',
        type: 'array',
        description: 'List of fields that could not be verified',
        required: false,
        items: {
          name: 'field',
          type: 'string',
          description: 'Field name that could not be verified'
        }
      }
    },
    required: ['companyName', 'confidenceScore']
  }
};

// Email composition function schema
export const EmailCompositionFunction: FunctionDefinition = {
  name: 'compose_email',
  description: 'Compose a professional email with structured components',
  parameters: {
    type: 'object',
    properties: {
      recipient: {
        name: 'recipient',
        type: 'string',
        description: 'Email recipient address',
        required: true
      },
      subject: {
        name: 'subject',
        type: 'string',
        description: 'Email subject line',
        required: true
      },
      body: {
        name: 'body',
        type: 'string',
        description: 'Email body content',
        required: true
      },
      tone: {
        name: 'tone',
        type: 'string',
        description: 'Email tone (formal, informal, friendly, professional, urgent)',
        required: true,
        enum: ['formal', 'informal', 'friendly', 'professional', 'urgent']
      },
      keyPoints: {
        name: 'keyPoints',
        type: 'array',
        description: 'Key points covered in the email',
        required: false,
        items: {
          name: 'point',
          type: 'string',
          description: 'Key point to be covered in the email'
        }
      },
      callToAction: {
        name: 'callToAction',
        type: 'string',
        description: 'Call to action for the recipient',
        required: false
      },
      confidenceScore: {
        name: 'confidenceScore',
        type: 'number',
        description: 'Confidence score for email quality (0-1)',
        required: true
      }
    },
    required: ['recipient', 'subject', 'body', 'tone', 'confidenceScore']
  }
};

// SOP generation function schema
export const SOPGenerationFunction: FunctionDefinition = {
  name: 'generate_sop',
  description: 'Generate standard operating procedure with structured components',
  parameters: {
    type: 'object',
    properties: {
      title: {
        name: 'title',
        type: 'string',
        description: 'SOP document title',
        required: true
      },
      version: {
        name: 'version',
        type: 'string',
        description: 'Document version',
        required: true
      },
      purpose: {
        name: 'purpose',
        type: 'string',
        description: 'Purpose of the SOP',
        required: true
      },
      scope: {
        name: 'scope',
        type: 'string',
        description: 'Scope of the SOP',
        required: true
      },
      responsibilities: {
        name: 'responsibilities',
        type: 'array',
        description: 'List of responsibilities',
        required: true,
        items: {
          name: 'responsibility',
          type: 'object',
          description: 'Responsibility object with role and tasks',
          properties: {
            role: {
              name: 'role',
              type: 'string',
              description: 'Role or position'
            },
            responsibilities: {
              name: 'responsibilities',
              type: 'array',
              description: 'List of responsibilities',
              items: {
                name: 'responsibility',
                type: 'string',
                description: 'Specific responsibility for this role'
              }
            }
          }
        }
      },
      procedures: {
        name: 'procedures',
        type: 'array',
        description: 'Step-by-step procedures',
        required: true,
        items: {
          name: 'procedure',
          type: 'object',
          description: 'Step-by-step procedure',
          properties: {
            step: {
              name: 'step',
              type: 'number',
              description: 'Procedure step number'
            },
            action: {
              name: 'action',
              type: 'string',
              description: 'Action to be performed'
            },
            owner: {
              name: 'owner',
              type: 'string',
              description: 'Person responsible for this step'
            },
            expectedOutcome: {
              name: 'expectedOutcome',
              type: 'string',
              description: 'Expected outcome of this step'
            },
            confidence: {
              name: 'confidence',
              type: 'number',
              description: 'Confidence score for this procedure step (0-1)'
            }
          }
        }
      },
      confidenceScore: {
        name: 'confidenceScore',
        type: 'number',
        description: 'Overall confidence score for SOP quality (0-1)',
        required: true
      }
    },
    required: ['title', 'version', 'purpose', 'scope', 'responsibilities', 'procedures', 'confidenceScore']
  }
};

// Function calling system class
export class FunctionCallingSystem {
  private genAI: any;
  private model: any;
  private config: DeterministicConfig;

  constructor(config: DeterministicConfig) {
    this.config = config;
    
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!googleApiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured for function calling');
    }
    
    this.genAI = new GoogleGenerativeAI(googleApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: config.temperature,
        topP: config.topP,
        maxOutputTokens: config.maxTokens
      },
      tools: [
        {
          functionDeclarations: [
            CompanyResearchFunction,
            EmailCompositionFunction,
            SOPGenerationFunction
          ]
        }
      ]
    });
  }

  async callFunction(
    functionName: string,
    prompt: string,
    context?: string
  ): Promise<FunctionCallResult> {
    try {
      // Build the full prompt with context
      const fullPrompt = this.buildFunctionPrompt(prompt, context);

      // Generate content with function calling
      const result = await this.model.generateContent([
        { text: fullPrompt }
      ]);

      const response = result.response;
      
      // Check if function was called
      const functionCalls = response.functionCalls();
      
      if (!functionCalls || functionCalls.length === 0) {
        return {
          name: functionName,
          args: {},
          success: false,
          error: 'No function call was made by the model',
          confidence: 0.0,
          validationErrors: ['Model did not call the expected function']
        };
      }

      // Get the first function call
      const functionCall = functionCalls[0];
      
      if (functionCall.name !== functionName) {
        return {
          name: functionName,
          args: {},
          success: false,
          error: `Model called wrong function: ${functionCall.name} instead of ${functionName}`,
          confidence: 0.0,
          validationErrors: [`Wrong function called: ${functionCall.name}`]
        };
      }

      // Validate the function arguments
      const validationResult = this.validateFunctionArguments(functionName, functionCall.args);
      
      return {
        name: functionName,
        args: functionCall.args,
        success: validationResult.isValid,
        error: validationResult.isValid ? undefined : validationResult.error,
        confidence: this.calculateFunctionConfidence(functionCall.args),
        validationErrors: validationResult.errors
      };

    } catch (error) {
      return {
        name: functionName,
        args: {},
        success: false,
        error: (error as Error).message,
        confidence: 0.0,
        validationErrors: [`Function calling failed: ${(error as Error).message}`]
      };
    }
  }

  private buildFunctionPrompt(prompt: string, context?: string): string {
    let fullPrompt = `You are a structured data extraction specialist. Use the appropriate function to extract information in the required format.

${context ? `Context: ${context}\n\n` : ''}

Task: ${prompt}

IMPORTANT:
- Use the function that best matches this task type
- Provide accurate, factual information only
- Include confidence scores for all data
- Use "UNKNOWN" for any uncertain information
- Do not invent facts or make assumptions

Available functions:
- extract_company_research: For company information extraction
- compose_email: For email composition
- generate_sop: For standard operating procedure generation

Call the appropriate function with the extracted information.`;

    return fullPrompt;
  }

  private validateFunctionArguments(functionName: string, args: any): {
    isValid: boolean;
    error?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      switch (functionName) {
        case 'extract_company_research':
          return this.validateCompanyResearchArgs(args);
        case 'compose_email':
          return this.validateEmailCompositionArgs(args);
        case 'generate_sop':
          return this.validateSOPGenerationArgs(args);
        default:
          return {
            isValid: false,
            error: `Unknown function: ${functionName}`,
            errors: [`Unknown function: ${functionName}`]
          };
      }
    } catch (error) {
      return {
        isValid: false,
        error: (error as Error).message,
        errors: [(error as Error).message]
      };
    }
  }

  private validateCompanyResearchArgs(args: any): {
    isValid: boolean;
    error?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!args.companyName || typeof args.companyName !== 'string') {
      errors.push('companyName is required and must be a string');
    }

    if (typeof args.confidenceScore !== 'number' || args.confidenceScore < 0 || args.confidenceScore > 1) {
      errors.push('confidenceScore is required and must be a number between 0 and 1');
    }

    // Optional field validation
    if (args.foundedYear && (typeof args.foundedYear !== 'number' || args.foundedYear < 1800 || args.foundedYear > new Date().getFullYear())) {
      errors.push('foundedYear must be a valid year between 1800 and current year');
    }

    if (args.website && (!args.website.startsWith('http') || !args.website.includes('.'))) {
      errors.push('website must be a valid URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateEmailCompositionArgs(args: any): {
    isValid: boolean;
    error?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!args.recipient || !args.recipient.includes('@')) {
      errors.push('recipient is required and must be a valid email address');
    }

    if (!args.subject || typeof args.subject !== 'string') {
      errors.push('subject is required and must be a string');
    }

    if (!args.body || typeof args.body !== 'string') {
      errors.push('body is required and must be a string');
    }

    if (!args.tone || !['formal', 'informal', 'friendly', 'professional', 'urgent'].includes(args.tone)) {
      errors.push('tone is required and must be one of: formal, informal, friendly, professional, urgent');
    }

    if (typeof args.confidenceScore !== 'number' || args.confidenceScore < 0 || args.confidenceScore > 1) {
      errors.push('confidenceScore is required and must be a number between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateSOPGenerationArgs(args: any): {
    isValid: boolean;
    error?: string;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!args.title || typeof args.title !== 'string') {
      errors.push('title is required and must be a string');
    }

    if (!args.version || typeof args.version !== 'string') {
      errors.push('version is required and must be a string');
    }

    if (!args.purpose || typeof args.purpose !== 'string') {
      errors.push('purpose is required and must be a string');
    }

    if (!args.scope || typeof args.scope !== 'string') {
      errors.push('scope is required and must be a string');
    }

    if (!Array.isArray(args.responsibilities) || args.responsibilities.length === 0) {
      errors.push('responsibilities is required and must be a non-empty array');
    }

    if (!Array.isArray(args.procedures) || args.procedures.length === 0) {
      errors.push('procedures is required and must be a non-empty array');
    }

    if (typeof args.confidenceScore !== 'number' || args.confidenceScore < 0 || args.confidenceScore > 1) {
      errors.push('confidenceScore is required and must be a number between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private calculateFunctionConfidence(args: any): number {
    // Base confidence from the function's confidence score
    let confidence = args.confidenceScore || 0.5;

    // Adjust based on completeness
    const totalFields = Object.keys(args).length;
    const nonNullFields = Object.values(args).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;

    const completeness = totalFields > 0 ? nonNullFields / totalFields : 0;
    confidence = confidence * 0.7 + completeness * 0.3;

    return Math.min(Math.max(confidence, 0), 1);
  }

  // Get available functions
  getAvailableFunctions(): FunctionDefinition[] {
    return [
      CompanyResearchFunction,
      EmailCompositionFunction,
      SOPGenerationFunction
    ];
  }

  // Get function by name
  getFunctionByName(name: string): FunctionDefinition | undefined {
    const functions = this.getAvailableFunctions();
    return functions.find(func => func.name === name);
  }
}

// Factory function
export function createFunctionCallingSystem(config: DeterministicConfig): FunctionCallingSystem {
  return new FunctionCallingSystem(config);
}