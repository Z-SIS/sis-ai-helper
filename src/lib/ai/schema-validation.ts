import { z } from 'zod';

// ============================================================================
// PRODUCTION-READY SCHEMA VALIDATION
// ============================================================================

// Base response schema with confidence scoring
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  confidence: z.number().min(0).max(1),
  needsReview: z.boolean(),
  sources: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  timestamp: z.string(),
});

// Company Research Response Schema
export const CompanyResearchSchema = z.object({
  companyName: z.string(),
  description: z.string(),
  industry: z.string(),
  location: z.string(),
  website: z.string().optional(),
  foundedYear: z.number().optional(),
  employees: z.string().optional(),
  revenue: z.string().optional(),
  keyExecutives: z.array(z.object({
    name: z.string(),
    title: z.string(),
  })).optional(),
  competitors: z.array(z.string()).optional(),
  recentNews: z.array(z.object({
    title: z.string(),
    date: z.string(),
    summary: z.string(),
  })).optional(),
  dataConfidence: z.number().min(0).max(1),
  unverifiedFields: z.array(z.string()),
}).merge(BaseResponseSchema);

// SOP Generation Response Schema
export const SOPSchema = z.object({
  title: z.string(),
  version: z.string(),
  purpose: z.string(),
  scope: z.string(),
  responsibilities: z.array(z.object({
    role: z.string(),
    responsibilities: z.array(z.string()),
  })),
  procedures: z.array(z.object({
    step: z.number(),
    action: z.string(),
    owner: z.string(),
    estimatedTime: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
  })),
  references: z.array(z.string()).optional(),
  complianceNotes: z.array(z.string()).optional(),
  implementationConfidence: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// Email Composition Response Schema
export const EmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
  tone: z.string(),
  recipient: z.string(),
  ccs: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  expectedResponse: z.string().optional(),
  professionalismScore: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// Excel Helper Response Schema
export const ExcelHelperSchema = z.object({
  question: z.string(),
  answer: z.string(),
  formula: z.string().optional(),
  steps: z.array(z.string()),
  alternatives: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  excelVersion: z.string().optional(),
  technicalAccuracy: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// Feasibility Check Response Schema
export const FeasibilitySchema = z.object({
  projectName: z.string(),
  overallScore: z.number().min(0).max(100),
  technicalFeasibility: z.object({
    score: z.number().min(0).max(100),
    factors: z.array(z.string()),
    risks: z.array(z.string()),
  }),
  financialFeasibility: z.object({
    score: z.number().min(0).max(100),
    estimatedCost: z.string().optional(),
    roi: z.string().optional(),
    risks: z.array(z.string()),
  }),
  resourceFeasibility: z.object({
    score: z.number().min(0).max(100),
    requiredResources: z.array(z.string()),
    availability: z.string(),
    risks: z.array(z.string()),
  }),
  recommendation: z.string(),
  nextSteps: z.array(z.string()),
  confidenceLevel: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// Deployment Plan Response Schema
export const DeploymentPlanSchema = z.object({
  projectName: z.string(),
  strategy: z.string(),
  phases: z.array(z.object({
    phase: z.number(),
    name: z.string(),
    duration: z.string(),
    tasks: z.array(z.object({
      task: z.string(),
      owner: z.string(),
      dependencies: z.array(z.string()),
      estimatedTime: z.string(),
    })),
  })),
  prerequisites: z.array(z.string()),
  successCriteria: z.array(z.string()),
  monitoring: z.array(z.string()),
  communication: z.array(z.string()),
  rollback: z.array(z.string()),
  implementationConfidence: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// USPS Battlecard Response Schema
export const BattlecardSchema = z.object({
  companyName: z.string(),
  competitor: z.string(),
  productCategory: z.string(),
  positioning: z.object({
    ourPositioning: z.string(),
    competitorPositioning: z.string(),
  }),
  strengths: z.object({
    ourStrengths: z.array(z.string()),
    competitorStrengths: z.array(z.string()),
  }),
  weaknesses: z.object({
    ourWeaknesses: z.array(z.string()),
    competitorWeaknesses: z.array(z.string()),
  }),
  differentiators: z.array(z.string()),
  talkingPoints: z.array(z.string()),
  competitiveAdvantages: z.array(z.string()),
  actionItems: z.array(z.string()),
  confidenceLevel: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// Disbandment Plan Response Schema
export const DisbandmentPlanSchema = z.object({
  projectName: z.string(),
  reason: z.string(),
  timeline: z.string(),
  phases: z.array(z.object({
    phase: z.number(),
    name: z.string(),
    duration: z.string(),
    tasks: z.array(z.object({
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed']),
    })),
  })),
  assetDistribution: z.array(z.object({
    asset: z.string(),
    currentValue: z.string(),
    distributionPlan: z.string(),
    responsible: z.string(),
  })),
  knowledgeTransfer: z.array(z.object({
    knowledgeArea: z.string(),
    recipient: z.string(),
    method: z.string(),
    deadline: z.string(),
  })),
  legalConsiderations: z.array(z.string()),
  communication: z.array(z.string()),
  checklist: z.array(z.object({
    item: z.string(),
    completed: z.boolean(),
    responsible: z.string(),
  })),
  implementationConfidence: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// Slide Template Response Schema
export const SlideTemplateSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  purpose: z.string(),
  totalSlides: z.number(),
  estimatedDuration: z.string(),
  slides: z.array(z.object({
    slideNumber: z.number(),
    title: z.string(),
    content: z.array(z.string()),
    speakerNotes: z.string().optional(),
    visualSuggestions: z.string().optional(),
    estimatedTime: z.string().optional(),
  })),
  tips: z.array(z.string()),
  visualTheme: z.string().optional(),
  technicalRequirements: z.array(z.string()).optional(),
  contentAccuracy: z.number().min(0).max(1),
}).merge(BaseResponseSchema);

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateAgentResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Schema validation failed:', error.errors);
      throw new Error(`Response validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw new Error(`Response validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to calculate confidence scores based on response quality
export function calculateConfidence(response: any, agentType: string): number {
  let confidence = 0.8; // Base confidence
  
  // Deduct confidence for uncertain language
  const uncertainPhrases = ['might', 'could', 'possibly', 'unclear', 'unknown', 'unverified'];
  const responseText = JSON.stringify(response).toLowerCase();
  
  uncertainPhrases.forEach(phrase => {
    if (responseText.includes(phrase)) {
      confidence -= 0.1;
    }
  });
  
  // Bonus for complete responses
  if (agentType === 'company-research') {
    const requiredFields = ['companyName', 'description', 'industry', 'location'];
    const completeness = requiredFields.filter(field => response[field]).length / requiredFields.length;
    confidence += completeness * 0.2;
  }
  
  return Math.max(0, Math.min(1, confidence));
}

// Function to determine if review is needed
export function needsReview(confidence: number, agentType: string): boolean {
  const thresholds = {
    'company-research': 0.7,
    'generate-sop': 0.8,
    'compose-email': 0.9,
    'excel-helper': 0.8,
    'feasibility-check': 0.6,
    'deployment-plan': 0.7,
    'usps-battlecard': 0.7,
    'disbandment-plan': 0.8,
    'slide-template': 0.8,
  };
  
  return confidence < (thresholds[agentType as keyof typeof thresholds] || 0.7);
}