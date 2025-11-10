import { AgentOutput } from '@/shared/schemas';

export interface AgentSystemOptions {
  executeAgentRequest?: (agentType: string, input: any) => Promise<AgentOutput>;
  disbandmentPlanParser: (response: string) => AgentOutput;
  emailParser: (response: string) => AgentOutput;
  companyResearchParser: (response: string) => AgentOutput;
  feasibilityCheckParser: (response: string) => AgentOutput;
  slideTemplateParser: (response: string) => AgentOutput;
  uspsBattlecardParser: (response: string) => AgentOutput;
}

export class AgentSystemBase {
  protected options: AgentSystemOptions;

  constructor(options: AgentSystemOptions) {
    this.options = options;
  }

  public async executeAgentRequest(agentType: string, input: any): Promise<AgentOutput> {
    if (this.options.executeAgentRequest) {
      return this.options.executeAgentRequest(agentType, input);
    }
    return {
      title: 'Response',
      content: 'Executed agent request',
      confidence: 0.8,
      confidence_score: 0.8,
      success: true,
      needsReview: false,
      timestamp: new Date().toISOString(),
      data: {}
    };
  }
}