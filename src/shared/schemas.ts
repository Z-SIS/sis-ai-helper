import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const BaseResponseSchema = z.object({
  success: z.boolean(),
  confidence: z.number().min(0).max(1),
  needsReview: z.boolean(),
  sources: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  timestamp: z.string(),
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const AgentInputSchemas = {
  'generate-sop': z.object({
    processName: z.string(),
    department: z.string().optional(),
    purpose: z.string().optional(),
    scope: z.string().optional(),
  }),
  
  'company-research': z.object({
    companyName: z.string(),
    industry: z.string().optional(),
    location: z.string().optional(),
  }),
  
  'compose-email': z.object({
    recipient: z.string(),
    subject: z.string(),
    tone: z.string(),
    purpose: z.string(),
    keyPoints: z.array(z.string()).optional(),
    callToAction: z.string().optional(),
  }),
  
  'excel-helper': z.object({
    question: z.string(),
    context: z.string().optional(),
    excelVersion: z.string().optional(),
  }),
  
  'feasibility-check': z.object({
    projectName: z.string(),
    description: z.string().optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    resources: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
  }),
  
  'deployment-plan': z.object({
    projectName: z.string(),
    projectType: z.string().optional(),
    environment: z.string(),
    teamSize: z.string().optional(),
    timeline: z.string().optional(),
  }),
  
  'usps-battlecard': z.object({
    companyName: z.string(),
    competitor: z.string(),
    productCategory: z.string().optional(),
    targetMarket: z.string().optional(),
  }),
  
  'disbandment-plan': z.object({
    projectName: z.string(),
    reason: z.string(),
    timeline: z.string().optional(),
    stakeholders: z.array(z.string()).optional(),
  }),
  
  'slide-template': z.object({
    topic: z.string(),
    audience: z.string().optional(),
    purpose: z.string(),
    slideCount: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
  }),
} as const;

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const AgentOutputSchemas = {
  'generate-sop': z.object({
    title: z.string(),
    version: z.string(),
    date: z.string(),
    purpose: z.string(),
    scope: z.string(),
    responsibilities: z.array(z.string()),
    procedure: z.array(z.object({
      step: z.number(),
      action: z.string(),
      details: z.string(),
      owner: z.string(),
    })),
    references: z.array(z.string()).optional(),
    content: z.string(),
    summary: z.string(),
  }).merge(BaseResponseSchema),
  
  'company-research': z.object({
    companyName: z.string(),
    industry: z.string(),
    location: z.string(),
    description: z.string(),
    website: z.string(),
    foundedYear: z.number().optional(),
    employeeCount: z.any().optional(),
    revenue: z.any().optional(),
    keyExecutives: z.array(z.object({
      name: z.string(),
      title: z.string(),
      confidence_score: z.number().optional(),
    })).optional(),
    competitors: z.array(z.string()).optional(),
    recentNews: z.array(z.object({
      title: z.string(),
      summary: z.string(),
      date: z.string(),
      confidence_score: z.number().optional(),
    })).optional(),
    dataConfidence: z.number().min(0).max(1).optional(),
    unverifiedFields: z.array(z.string()).optional(),
    confidenceScore: z.number().min(0).max(1).optional(),
    needsReview: z.boolean().optional(),
    lastUpdated: z.string(),
    timestamp: z.string().optional(),
  }).merge(BaseResponseSchema),
  
  'compose-email': z.object({
    subject: z.string(),
    body: z.string(),
    tone: z.string(),
    wordCount: z.number(),
    suggestedImprovements: z.array(z.string()),
  }).merge(BaseResponseSchema),
  
  'excel-helper': z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    question: z.string().optional(),
    answer: z.string().optional(),
    formula: z.string().optional(),
    steps: z.array(z.string()).optional(),
    alternatives: z.array(z.string()).optional(),
    tips: z.array(z.string()).optional(),
    excelVersion: z.string().optional(),
  }).merge(BaseResponseSchema),
  
  'feasibility-check': z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    projectName: z.string().optional(),
    overallScore: z.number().min(0).max(100).optional(),
    technicalFeasibility: z.object({
      score: z.number().min(0).max(100),
      factors: z.array(z.string()),
      risks: z.array(z.string()),
    }).optional(),
    financialFeasibility: z.object({
      score: z.number().min(0).max(100),
      estimatedCost: z.string().optional(),
      roi: z.string().optional(),
      risks: z.array(z.string()),
    }).optional(),
    resourceFeasibility: z.object({
      score: z.number().min(0).max(100),
      requiredResources: z.array(z.string()),
      availability: z.string(),
      risks: z.array(z.string()),
    }).optional(),
    recommendation: z.string().optional(),
    nextSteps: z.array(z.string()).optional(),
    confidenceLevel: z.number().min(0).max(1).optional(),
  }).merge(BaseResponseSchema),
  
  'deployment-plan': z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    projectName: z.string().optional(),
    strategy: z.string().optional(),
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
    })).optional(),
    prerequisites: z.array(z.string()).optional(),
    successCriteria: z.array(z.string()).optional(),
    monitoring: z.array(z.string()).optional(),
    communication: z.array(z.string()).optional(),
    rollback: z.array(z.string()).optional(),
    implementationConfidence: z.number().min(0).max(1).optional(),
  }).merge(BaseResponseSchema),
  
  'usps-battlecard': z.object({
    companyName: z.string(),
    competitor: z.string(),
    productCategory: z.string(),
    overview: z.object({
      ourPositioning: z.string(),
      competitorPositioning: z.string(),
    }),
    strengths: z.object({
      ours: z.array(z.string()),
      competitor: z.array(z.string()),
    }),
    weaknesses: z.object({
      ours: z.array(z.string()),
      competitor: z.array(z.string()),
    }),
    keyDifferentiators: z.array(z.string),
    talkingPoints: z.array(z.string),
    competitiveAdvantages: z.array(z.string),
    recommendedActions: z.array(z.string),
  }).merge(BaseResponseSchema),
  
  'disbandment-plan': z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    projectName: z.string().optional(),
    reason: z.string().optional(),
    timeline: z.string().optional(),
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
    })).optional(),
    assetDistribution: z.array(z.object({
      asset: z.string(),
      currentValue: z.string(),
      distributionPlan: z.string(),
      responsible: z.string(),
    })).optional(),
    knowledgeTransfer: z.array(z.object({
      knowledgeArea: z.string(),
      recipient: z.string(),
      method: z.string(),
      deadline: z.string(),
    })).optional(),
    legalConsiderations: z.array(z.string()).optional(),
    communication: z.array(z.string()).optional(),
    checklist: z.array(z.object({
      item: z.string(),
      completed: z.boolean(),
      responsible: z.string(),
    })).optional(),
    implementationConfidence: z.number().min(0).max(1).optional(),
  }).merge(BaseResponseSchema),
  
  'slide-template': z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    topic: z.string().optional(),
    audience: z.string().optional(),
    purpose: z.string().optional(),
    totalSlides: z.number().optional(),
    estimatedDuration: z.string().optional(),
    slides: z.array(z.object({
      slideNumber: z.number(),
      title: z.string(),
      content: z.array(z.string),
      speakerNotes: z.string().optional(),
      visualSuggestions: z.string().optional(),
      estimatedTime: z.string().optional(),
    })).optional(),
    tips: z.array(z.string).optional(),
    visualTheme: z.string().optional(),
    technicalRequirements: z.array(z.string).optional(),
    contentAccuracy: z.number().min(0).max(1).optional(),
  }).merge(BaseResponseSchema),
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AgentType = keyof typeof AgentInputSchemas;

export type AgentInput = {
  [K in AgentType]: z.infer<typeof AgentInputSchemas[K]>;
}[AgentType];

export type AgentOutput = {
  [K in AgentType]: z.infer<typeof AgentOutputSchemas[K]>;
}[AgentType];

export const AgentMetadata = {
  'generate-sop': {
    name: 'Generate SOP',
    description: 'Create detailed Standard Operating Procedures',
    category: 'process',
    complexity: 'medium',
  },
  'company-research': {
    name: 'Company Research',
    description: 'Research companies and provide comprehensive information',
    category: 'research',
    complexity: 'complex',
  },
  'compose-email': {
    name: 'Compose Email',
    description: 'Draft professional emails with various tones',
    category: 'communication',
    complexity: 'simple',
  },
  'excel-helper': {
    name: 'Excel Helper',
    description: 'Get Excel formulas, tips, and solutions',
    category: 'tools',
    complexity: 'simple',
  },
  'feasibility-check': {
    name: 'Feasibility Check',
    description: 'Assess project feasibility across multiple dimensions',
    category: 'analysis',
    complexity: 'complex',
  },
  'deployment-plan': {
    name: 'Deployment Plan',
    description: 'Create comprehensive deployment strategies',
    category: 'planning',
    complexity: 'complex',
  },
  'usps-battlecard': {
    name: 'USPS Battlecard',
    description: 'Generate competitive analysis tools',
    category: 'sales',
    complexity: 'medium',
  },
  'disbandment-plan': {
    name: 'Disbandment Plan',
    description: 'Create project wind-down procedures',
    category: 'planning',
    complexity: 'complex',
  },
  'slide-template': {
    name: 'Slide Template',
    description: 'Generate presentation content and structure',
    category: 'presentation',
    complexity: 'medium',
  },
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateAgentInput<T>(agentType: AgentType, data: unknown): T {
  const schema = AgentInputSchemas[agentType];
  return schema.parse(data) as T;
}

export function validateAgentOutput<T>(agentType: AgentType, data: unknown): T {
  const schema = AgentOutputSchemas[agentType];
  return schema.parse(data) as T;
}

export function getAgentSchema(agentType: AgentType) {
  return {
    input: AgentInputSchemas[agentType],
    output: AgentOutputSchemas[agentType],
    metadata: AgentMetadata[agentType],
  };
}