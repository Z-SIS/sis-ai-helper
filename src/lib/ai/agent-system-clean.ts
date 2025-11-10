import { AgentOutput } from '@/shared/schemas';
import { createAgentOutput } from './helpers/agent-output';

export class AgentSystemClean {
  async executeAgentRequest(agentType: string, input: any): Promise<AgentOutput> {
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

  parseDisbandmentPlanResponse(response: string): AgentOutput {
    return createAgentOutput({ title: 'Disbandment Plan', content: response, confidence: 0.8, confidence_score: 0.8, success: true, needsReview: false, data: {} });
  }
}

export const googleAIAgentSystem = new AgentSystemClean();

export const handleAgentRequest = async (agentType: string, input: any): Promise<AgentOutput> => {
  return await googleAIAgentSystem.executeAgentRequest(agentType, input);
};
