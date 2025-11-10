import { AgentType } from '@/shared/schemas';

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
    complexity: 'high',
  },
  'compose-email': {
    name: 'Compose Email',
    description: 'Generate professional email content',
    category: 'communication',
    complexity: 'low',
  },
  'excel-helper': {
    name: 'Excel Helper',
    description: 'Assist with Excel formulas and functions',
    category: 'tools',
    complexity: 'medium',
  },
  'feasibility-check': {
    name: 'Feasibility Check',
    description: 'Evaluate project feasibility',
    category: 'analysis',
    complexity: 'high',
  },
  'deployment-plan': {
    name: 'Deployment Plan',
    description: 'Create deployment strategies',
    category: 'planning',
    complexity: 'high',
  },
  'usps-battlecard': {
    name: 'USPS Battlecard',
    description: 'Create competitive analysis cards',
    category: 'sales',
    complexity: 'medium',
  },
  'disbandment-plan': {
    name: 'Disbandment Plan',
    description: 'Plan project closures',
    category: 'planning',
    complexity: 'medium',
  },
  'slide-template': {
    name: 'Slide Template',
    description: 'Generate presentation templates',
    category: 'presentation',
    complexity: 'medium',
  }
} as const;