import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS & VALIDATORS
// ============================================================================

// Common validation patterns
const commonValidations = {
  requiredString: (message: string) => z.string().min(1, message),
  optionalString: () => z.string().optional(),
  requiredEnum: <T extends z.ZodEnum<any>>(enumSchema: T, message: string) => enumSchema,
  requiredArray: (itemSchema: z.ZodTypeAny, message?: string) => z.array(itemSchema).min(1, message || 'At least one item is required'),
  optionalArray: (itemSchema: z.ZodTypeAny) => z.array(itemSchema).optional(),
  ratingSchema: z.enum(['high', 'medium', 'low']),
  dateSchema: z.string(),
  positiveNumber: z.number().positive(),
  optionalPositiveNumber: () => z.number().positive().optional(),
};

// ============================================================================
// AGENT SCHEMAS DEFINITION
// ============================================================================

// Company Research Agent
export const CompanyResearchInputSchema = z.object({
  companyName: commonValidations.requiredString('Company name is required'),
  industry: commonValidations.optionalString(),
  location: commonValidations.optionalString(),
});

export const CompanyResearchOutputSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  location: z.string(),
  description: z.string(),
  website: z.string().url(),
  foundedYear: commonValidations.optionalPositiveNumber(),
  employeeCount: z.union([
    z.string(),
    z.object({
      count: z.union([z.number(), z.string()]),
      source: z.string().optional(),
      confidenceScore: z.number().optional(),
    })
  ]).optional(),
  revenue: z.union([
    z.string(),
    z.object({
      amount: z.union([z.number(), z.string()]),
      currency: z.string().optional(),
      year: z.number().optional(),
    })
  ]).optional(),
  keyExecutives: commonValidations.optionalArray(
    z.object({
      name: z.string(),
      title: z.string(),
    })
  ),
  competitors: commonValidations.optionalArray(
    z.union([
      z.string(),
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    ])
  ),
  recentNews: commonValidations.optionalArray(
    z.object({
      title: z.string(),
      summary: z.string(),
      date: commonValidations.dateSchema,
    })
  ),
  lastUpdated: commonValidations.dateSchema,
  dataConfidence: z.number().min(0).max(1).optional(),
  unverifiedFields: z.array(z.string()).optional(),
});

// SOP Generation Agent
export const SopGenerationInputSchema = z.object({
  processName: commonValidations.requiredString('Process name is required'),
  department: commonValidations.optionalString(),
  purpose: commonValidations.optionalString(),
  scope: commonValidations.optionalString(),
});

export const SopGenerationOutputSchema = z.object({
  title: z.string(),
  version: z.string(),
  date: commonValidations.dateSchema,
  purpose: z.string(),
  scope: z.string(),
  responsibilities: commonValidations.requiredArray(z.string(), 'At least one responsibility is required'),
  procedure: commonValidations.requiredArray(
    z.object({
      step: commonValidations.positiveNumber,
      action: z.string(),
      details: z.string(),
      owner: z.string(),
    }),
    'At least one procedure step is required'
  ),
  references: commonValidations.optionalArray(z.string()),
});

// Email Composition Agent
const EmailToneSchema = z.enum(['formal', 'casual', 'friendly', 'professional', 'urgent']);

export const EmailCompositionInputSchema = z.object({
  recipient: commonValidations.requiredString('Recipient is required'),
  subject: commonValidations.requiredString('Subject is required'),
  tone: commonValidations.requiredEnum(EmailToneSchema, 'Tone is required'),
  purpose: commonValidations.requiredString('Purpose is required'),
  keyPoints: commonValidations.optionalArray(z.string()),
  callToAction: commonValidations.optionalString(),
});

export const EmailCompositionOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  tone: z.string(),
  wordCount: commonValidations.positiveNumber,
  suggestedImprovements: commonValidations.optionalArray(z.string()),
});

// Excel Helper Agent
export const ExcelHelperInputSchema = z.object({
  question: commonValidations.requiredString('Question is required'),
  context: commonValidations.optionalString(),
  excelVersion: commonValidations.optionalString(),
});

export const ExcelHelperOutputSchema = z.object({
  answer: z.string(),
  formula: commonValidations.optionalString(),
  steps: commonValidations.optionalArray(z.string()),
  alternativeSolutions: commonValidations.optionalArray(z.string()),
  tips: commonValidations.optionalArray(z.string()),
});

// Feasibility Check Agent
export const FeasibilityCheckInputSchema = z.object({
  projectName: commonValidations.requiredString('Project name is required'),
  description: commonValidations.requiredString('Description is required'),
  budget: commonValidations.optionalString(),
  timeline: commonValidations.optionalString(),
  resources: commonValidations.optionalArray(z.string()),
  constraints: commonValidations.optionalArray(z.string()),
});

export const FeasibilityCheckOutputSchema = z.object({
  projectName: z.string(),
  overallFeasibility: commonValidations.ratingSchema,
  score: z.number().min(0).max(100),
  technicalFeasibility: z.object({
    rating: commonValidations.ratingSchema,
    details: z.string(),
  }),
  financialFeasibility: z.object({
    rating: commonValidations.ratingSchema,
    details: z.string(),
  }),
  resourceFeasibility: z.object({
    rating: commonValidations.ratingSchema,
    details: z.string(),
  }),
  risks: commonValidations.requiredArray(
    z.object({
      risk: z.string(),
      impact: commonValidations.ratingSchema,
      mitigation: z.string(),
    }),
    'At least one risk assessment is required'
  ),
  recommendations: commonValidations.requiredArray(z.string(), 'At least one recommendation is required'),
});

// Deployment Plan Agent
const EnvironmentSchema = z.enum(['development', 'staging', 'production']);

export const DeploymentPlanInputSchema = z.object({
  projectName: commonValidations.requiredString('Project name is required'),
  projectType: commonValidations.optionalString(),
  environment: commonValidations.requiredEnum(EnvironmentSchema, 'Environment is required'),
  teamSize: commonValidations.optionalPositiveNumber(),
  timeline: commonValidations.optionalString(),
});

export const DeploymentPlanOutputSchema = z.object({
  projectName: z.string(),
  deploymentStrategy: z.string(),
  phases: commonValidations.requiredArray(
    z.object({
      phase: commonValidations.positiveNumber,
      name: z.string(),
      description: z.string(),
      duration: z.string(),
      tasks: commonValidations.requiredArray(z.string(), 'At least one task is required'),
      dependencies: commonValidations.optionalArray(z.string()),
      rollbackPlan: z.string(),
    }),
    'At least one deployment phase is required'
  ),
  prerequisites: commonValidations.requiredArray(z.string(), 'At least one prerequisite is required'),
  successCriteria: commonValidations.requiredArray(z.string(), 'At least one success criterion is required'),
  monitoring: commonValidations.requiredArray(z.string(), 'At least one monitoring item is required'),
  communicationPlan: z.string(),
});

// USPS Battlecard Agent
export const UspsBattlecardInputSchema = z.object({
  companyName: commonValidations.requiredString('Company name is required'),
  competitor: commonValidations.requiredString('Competitor name is required'),
  productCategory: commonValidations.optionalString(),
  targetMarket: commonValidations.optionalString(),
});

export const UspsBattlecardOutputSchema = z.object({
  companyName: z.string(),
  competitor: z.string(),
  productCategory: z.string(),
  overview: z.object({
    ourPositioning: z.string(),
    competitorPositioning: z.string(),
  }),
  strengths: z.object({
    ours: commonValidations.requiredArray(z.string(), 'At least one strength is required'),
    competitor: commonValidations.requiredArray(z.string(), 'At least one competitor strength is required'),
  }),
  weaknesses: z.object({
    ours: commonValidations.optionalArray(z.string()),
    competitor: commonValidations.optionalArray(z.string()),
  }),
  keyDifferentiators: commonValidations.requiredArray(z.string(), 'At least one key differentiator is required'),
  talkingPoints: commonValidations.requiredArray(z.string(), 'At least one talking point is required'),
  competitiveAdvantages: commonValidations.requiredArray(z.string(), 'At least one competitive advantage is required'),
  recommendedActions: commonValidations.requiredArray(z.string(), 'At least one recommended action is required'),
});

// Disbandment Plan Agent
export const DisbandmentPlanInputSchema = z.object({
  projectName: commonValidations.requiredString('Project name is required'),
  reason: commonValidations.requiredString('Reason is required'),
  timeline: commonValidations.optionalString(),
  stakeholders: commonValidations.optionalArray(z.string()),
});

export const DisbandmentPlanOutputSchema = z.object({
  projectName: z.string(),
  reason: z.string(),
  disbandmentDate: commonValidations.dateSchema,
  phases: commonValidations.requiredArray(
    z.object({
      phase: commonValidations.positiveNumber,
      name: z.string(),
      description: z.string(),
      duration: z.string(),
      tasks: commonValidations.requiredArray(z.string(), 'At least one task is required'),
      responsible: z.string(),
    }),
    'At least one disbandment phase is required'
  ),
  assetDistribution: commonValidations.requiredArray(
    z.object({
      asset: z.string(),
      disposition: z.string(),
      responsible: z.string(),
    }),
    'At least one asset distribution item is required'
  ),
  knowledgeTransfer: commonValidations.requiredArray(
    z.object({
      knowledgeArea: z.string(),
      recipient: z.string(),
      method: z.string(),
      deadline: commonValidations.dateSchema,
    }),
    'At least one knowledge transfer item is required'
  ),
  legalConsiderations: commonValidations.requiredArray(z.string(), 'At least one legal consideration is required'),
  communicationPlan: z.string(),
  finalChecklist: commonValidations.requiredArray(z.string(), 'At least one checklist item is required'),
});

// Slide Template Agent
const PresentationPurposeSchema = z.enum(['informative', 'persuasive', 'educational', 'update']);

export const SlideTemplateInputSchema = z.object({
  topic: commonValidations.requiredString('Topic is required'),
  audience: commonValidations.optionalString(),
  purpose: commonValidations.requiredEnum(PresentationPurposeSchema, 'Purpose is required'),
  slideCount: z.number().min(1).max(20).optional(),
  keyPoints: commonValidations.optionalArray(z.string()),
});

export const SlideTemplateOutputSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  audience: z.string(),
  purpose: z.string(),
  slides: commonValidations.requiredArray(
    z.object({
      slideNumber: commonValidations.positiveNumber,
      title: z.string(),
      content: commonValidations.requiredArray(z.string(), 'At least one content item is required'),
      speakerNotes: commonValidations.optionalString(),
      visualSuggestions: commonValidations.optionalString(),
    }),
    'At least one slide is required'
  ),
  presentationTips: commonValidations.requiredArray(z.string(), 'At least one presentation tip is required'),
  estimatedDuration: z.string(),
});

// ============================================================================
// SCHEMA REGISTRY
// ============================================================================

export const AgentInputSchemas = {
  'company-research': CompanyResearchInputSchema,
  'generate-sop': SopGenerationInputSchema,
  'compose-email': EmailCompositionInputSchema,
  'excel-helper': ExcelHelperInputSchema,
  'feasibility-check': FeasibilityCheckInputSchema,
  'deployment-plan': DeploymentPlanInputSchema,
  'usps-battlecard': UspsBattlecardInputSchema,
  'disbandment-plan': DisbandmentPlanInputSchema,
  'slide-template': SlideTemplateInputSchema,
} as const;

export const AgentOutputSchemas = {
  'company-research': CompanyResearchOutputSchema,
  'generate-sop': SopGenerationOutputSchema,
  'compose-email': EmailCompositionOutputSchema,
  'excel-helper': ExcelHelperOutputSchema,
  'feasibility-check': FeasibilityCheckOutputSchema,
  'deployment-plan': DeploymentPlanOutputSchema,
  'usps-battlecard': UspsBattlecardOutputSchema,
  'disbandment-plan': DisbandmentPlanOutputSchema,
  'slide-template': SlideTemplateOutputSchema,
} as const;

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type CompanyResearchInput = z.infer<typeof CompanyResearchInputSchema>;
export type CompanyResearchOutput = z.infer<typeof CompanyResearchOutputSchema>;
export type SopGenerationInput = z.infer<typeof SopGenerationInputSchema>;
export type SopGenerationOutput = z.infer<typeof SopGenerationOutputSchema>;
export type EmailCompositionInput = z.infer<typeof EmailCompositionInputSchema>;
export type EmailCompositionOutput = z.infer<typeof EmailCompositionOutputSchema>;
export type ExcelHelperInput = z.infer<typeof ExcelHelperInputSchema>;
export type ExcelHelperOutput = z.infer<typeof ExcelHelperOutputSchema>;
export type FeasibilityCheckInput = z.infer<typeof FeasibilityCheckInputSchema>;
export type FeasibilityCheckOutput = z.infer<typeof FeasibilityCheckOutputSchema>;
export type DeploymentPlanInput = z.infer<typeof DeploymentPlanInputSchema>;
export type DeploymentPlanOutput = z.infer<typeof DeploymentPlanOutputSchema>;
export type UspsBattlecardInput = z.infer<typeof UspsBattlecardInputSchema>;
export type UspsBattlecardOutput = z.infer<typeof UspsBattlecardOutputSchema>;
export type DisbandmentPlanInput = z.infer<typeof DisbandmentPlanInputSchema>;
export type DisbandmentPlanOutput = z.infer<typeof DisbandmentPlanOutputSchema>;
export type SlideTemplateInput = z.infer<typeof SlideTemplateInputSchema>;
export type SlideTemplateOutput = z.infer<typeof SlideTemplateOutputSchema>;

// Union types for all inputs and outputs
export type AgentInput = 
  | CompanyResearchInput
  | SopGenerationInput
  | EmailCompositionInput
  | ExcelHelperInput
  | FeasibilityCheckInput
  | DeploymentPlanInput
  | UspsBattlecardInput
  | DisbandmentPlanInput
  | SlideTemplateInput;

export type AgentOutput = 
  | CompanyResearchOutput
  | SopGenerationOutput
  | EmailCompositionOutput
  | ExcelHelperOutput
  | FeasibilityCheckOutput
  | DeploymentPlanOutput
  | UspsBattlecardOutput
  | DisbandmentPlanOutput
  | SlideTemplateOutput;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const validateAgentInput = <T extends keyof typeof AgentInputSchemas>(
  agentType: T,
  data: unknown
): z.infer<typeof AgentInputSchemas[T]> => {
  return AgentInputSchemas[agentType].parse(data);
};

export const validateAgentOutput = <T extends keyof typeof AgentOutputSchemas>(
  agentType: T,
  data: unknown
): z.infer<typeof AgentOutputSchemas[T]> => {
  return AgentOutputSchemas[agentType].parse(data);
};

export const safeValidateAgentInput = <T extends keyof typeof AgentInputSchemas>(
  agentType: T,
  data: unknown
): { success: true; data: z.infer<typeof AgentInputSchemas[T]> } | { success: false; error: z.ZodError } => {
  const result = AgentInputSchemas[agentType].safeParse(data);
  return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
};

export const safeValidateAgentOutput = <T extends keyof typeof AgentOutputSchemas>(
  agentType: T,
  data: unknown
): { success: true; data: z.infer<typeof AgentOutputSchemas[T]> } | { success: false; error: z.ZodError } => {
  const result = AgentOutputSchemas[agentType].safeParse(data);
  return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
};

// ============================================================================
// AGENT METADATA
// ============================================================================

export const AgentMetadata = {
  'company-research': {
    name: 'Company Research',
    description: 'Research companies and gather comprehensive information',
    category: 'research',
    requiresWebSearch: true,
    estimatedTokens: { input: 100, output: 800 },
  },
  'generate-sop': {
    name: 'Generate SOP',
    description: 'Create detailed Standard Operating Procedures',
    category: 'documentation',
    requiresWebSearch: false,
    estimatedTokens: { input: 150, output: 1200 },
  },
  'compose-email': {
    name: 'Compose Email',
    description: 'Draft professional emails with various tones',
    category: 'communication',
    requiresWebSearch: false,
    estimatedTokens: { input: 200, output: 400 },
  },
  'excel-helper': {
    name: 'Excel Helper',
    description: 'Get Excel formulas, tips, and solutions',
    category: 'productivity',
    requiresWebSearch: false,
    estimatedTokens: { input: 100, output: 600 },
  },
  'feasibility-check': {
    name: 'Feasibility Check',
    description: 'Assess project feasibility across multiple dimensions',
    category: 'analysis',
    requiresWebSearch: false,
    estimatedTokens: { input: 300, output: 1000 },
  },
  'deployment-plan': {
    name: 'Deployment Plan',
    description: 'Create comprehensive deployment strategies',
    category: 'operations',
    requiresWebSearch: false,
    estimatedTokens: { input: 200, output: 1500 },
  },
  'usps-battlecard': {
    name: 'USPS Battlecard',
    description: 'Generate competitive analysis tools',
    category: 'sales',
    requiresWebSearch: false,
    estimatedTokens: { input: 150, output: 800 },
  },
  'disbandment-plan': {
    name: 'Disbandment Plan',
    description: 'Create project wind-down procedures',
    category: 'operations',
    requiresWebSearch: false,
    estimatedTokens: { input: 200, output: 1200 },
  },
  'slide-template': {
    name: 'Slide Template',
    description: 'Generate presentation content and structure',
    category: 'presentation',
    requiresWebSearch: false,
    estimatedTokens: { input: 150, output: 1000 },
  },
} as const;

export type AgentType = keyof typeof AgentMetadata;
export type AgentCategory = 'research' | 'documentation' | 'communication' | 'productivity' | 'analysis' | 'operations' | 'sales' | 'presentation';