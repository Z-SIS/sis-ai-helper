import { AgentOutput } from '@/shared/schemas';
import { createAgentOutput } from './helpers/agent-output';

interface AgentSystemOptions {
  executeAgentRequest?: (agentType: string, input: any) => Promise<AgentOutput>;
}

export class AgentSystem {
  private options: AgentSystemOptions;

  constructor(options: AgentSystemOptions = {}) {
    this.options = options;
  }

  public async executeAgentRequest(agentType: string, input: any): Promise<AgentOutput> {
    if (this.options.executeAgentRequest) {
      return this.options.executeAgentRequest(agentType, input);
    }
    return createAgentOutput({
      title: 'Response',
      content: 'Executed agent request',
      confidence: 0.8,
      confidence_score: 0.8,
      success: true,
      needsReview: false,
      timestamp: new Date().toISOString(),
      data: {},
    });
  }

  public parseDisbandmentPlanResponse(response: string): AgentOutput {
    const lines = response.split('\n').map((l) => l.trim()).filter(Boolean);
    const projectName = lines.find((l) => /project(?: name)?:/i.test(l))?.replace(/^(project(?: name)?:\s*)/i, '') || 'Project Disbandment';
    const timeline = lines.find((l) => /timeline:|duration:/i.test(l))?.replace(/^(timeline:|duration:)\s*/i, '') || '4-6 weeks';

    const phases = [
      { phase: 1, name: 'Planning', duration: '1 week', tasks: [{ task: 'Create disbandment plan', owner: 'Project Manager' }] },
      { phase: 2, name: 'Execution', duration: '2-3 weeks', tasks: [{ task: 'Asset distribution', owner: 'Operations Team' }] },
    ];

    return createAgentOutput({
      title: 'Project Disbandment Plan',
      content: response,
      summary: `Disbandment plan created for ${projectName} - ${timeline}`,
      confidence: 0.8,
      confidence_score: 0.8,
      success: true,
      needsReview: false,
      timestamp: new Date().toISOString(),
      data: { projectName, timeline, phases },
    });
  }

  public getTokenUsage() {
    return {
      byAgent: {} as Record<string, number>,
      total: 0,
      cacheStats: { size: 0 },
    } as const;
  }
}

export const googleAIAgentSystem = new AgentSystem();

export const handleAgentRequest = async (agentType: string, input: any): Promise<AgentOutput> => {
  return await googleAIAgentSystem.executeAgentRequest(agentType, input);
};
