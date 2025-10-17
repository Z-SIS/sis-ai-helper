import { z } from 'zod';

// Agent State Schema
export const AgentStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  currentTask: z.string().optional(),
  context: z.record(z.any()),
  memory: z.object({
    shortTerm: z.array(z.any()),
    longTerm: z.array(z.any()),
    workingMemory: z.record(z.any())
  }),
  status: z.enum(['idle', 'processing', 'waiting', 'completed', 'error']),
  capabilities: z.array(z.string()),
  metadata: z.record(z.any())
});

export type AgentState = z.infer<typeof AgentStateSchema>;

// Agent Message Schema
export const AgentMessageSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  type: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
});

export type AgentMessage = z.infer<typeof AgentMessageSchema>;

// Agent Tool Schema
export const AgentToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
  execute: z.function()
});

export type AgentTool = z.infer<typeof AgentToolSchema>;

// Agent Capability Schema
export const AgentCapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
  enabled: z.boolean().default(true)
});

export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;

export class AIAgent {
  private state: AgentState;
  private tools: Map<string, AgentTool> = new Map();
  private capabilities: Map<string, AgentCapability> = new Map();
  private messageHistory: AgentMessage[] = [];
  private onStateChange?: (state: AgentState) => void;

  constructor(config: {
    id: string;
    userId: string;
    capabilities: AgentCapability[];
    tools: AgentTool[];
  }) {
    this.state = AgentStateSchema.parse({
      id: config.id,
      userId: config.userId,
      context: {},
      memory: {
        shortTerm: [],
        longTerm: [],
        workingMemory: {}
      },
      status: 'idle',
      capabilities: config.capabilities.map(cap => cap.name),
      metadata: {}
    });

    // Register tools
    config.tools.forEach(tool => this.registerTool(tool));
    
    // Register capabilities
    config.capabilities.forEach(cap => this.registerCapability(cap));
  }

  // State Management
  getState(): AgentState {
    return { ...this.state };
  }

  private updateState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  onStateChange(callback: (state: AgentState) => void): void {
    this.onStateChange = callback;
  }

  // Tool Management
  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  listTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  // Capability Management
  registerCapability(capability: AgentCapability): void {
    this.capabilities.set(capability.name, capability);
  }

  getCapability(name: string): AgentCapability | undefined {
    return this.capabilities.get(name);
  }

  listCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  // Memory Management
  addToMemory(type: 'shortTerm' | 'longTerm', data: any): void {
    this.state.memory[type].push({
      content: data,
      timestamp: new Date(),
      id: crypto.randomUUID()
    });

    // Limit short-term memory size
    if (type === 'shortTerm' && this.state.memory.shortTerm.length > 50) {
      this.state.memory.shortTerm.shift();
    }
  }

  getMemory(type: 'shortTerm' | 'longTerm'): any[] {
    return [...this.state.memory[type]];
  }

  updateWorkingMemory(key: string, value: any): void {
    this.state.memory.workingMemory[key] = value;
  }

  getWorkingMemory(key?: string): any {
    if (key) {
      return this.state.memory.workingMemory[key];
    }
    return { ...this.state.memory.workingMemory };
  }

  // Message Management
  addMessage(message: Omit<AgentMessage, 'id' | 'timestamp' | 'agentId'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agentId: this.state.id
    };

    this.messageHistory.push(fullMessage);
    this.addToMemory('shortTerm', fullMessage);
  }

  getMessageHistory(limit?: number): AgentMessage[] {
    if (limit) {
      return this.messageHistory.slice(-limit);
    }
    return [...this.messageHistory];
  }

  // Task Processing
  async processTask(task: string, context?: Record<string, any>): Promise<string> {
    this.updateState({
      currentTask: task,
      status: 'processing',
      context: { ...this.state.context, ...context }
    });

    try {
      // Add user message to history
      this.addMessage({
        type: 'user',
        content: task,
        metadata: context
      });

      // Analyze task and determine required tools
      const analysis = await this.analyzeTask(task);
      
      // Execute task using available tools
      const result = await this.executeTask(analysis);

      // Add assistant response to history
      this.addMessage({
        type: 'assistant',
        content: result
      });

      this.updateState({
        status: 'completed',
        currentTask: undefined
      });

      return result;
    } catch (error) {
      this.updateState({
        status: 'error',
        currentTask: undefined
      });

      const errorMessage = `Error processing task: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      this.addMessage({
        type: 'system',
        content: errorMessage
      });

      throw error;
    }
  }

  private async analyzeTask(task: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    requiredTools: string[];
    confidence: number;
  }> {
    // This would typically use an LLM to analyze the task
    // For now, we'll do basic pattern matching
    const lowerTask = task.toLowerCase();
    
    let intent = 'general';
    const entities: Record<string, any> = {};
    const requiredTools: string[] = [];

    // Check for different task types
    if (lowerTask.includes('research') || lowerTask.includes('company')) {
      intent = 'company_research';
      requiredTools.push('companyResearch');
    }
    
    if (lowerTask.includes('email') || lowerTask.includes('mail')) {
      intent = 'email_generation';
      requiredTools.push('emailGenerator');
    }
    
    if (lowerTask.includes('document') || lowerTask.includes('doc')) {
      intent = 'document_generation';
      requiredTools.push('documentGenerator');
    }

    if (lowerTask.includes('analyze') || lowerTask.includes('analysis')) {
      intent = 'data_analysis';
      requiredTools.push('dataAnalyzer');
    }

    // Extract entities (basic implementation)
    const companyMatch = task.match(/(?:company|organization)\s+([A-Za-z\s&]+)/i);
    if (companyMatch) {
      entities.company = companyMatch[1].trim();
    }

    return {
      intent,
      entities,
      requiredTools,
      confidence: 0.8
    };
  }

  private async executeTask(analysis: {
    intent: string;
    entities: Record<string, any>;
    requiredTools: string[];
    confidence: number;
  }): Promise<string> {
    const results: string[] = [];

    for (const toolName of analysis.requiredTools) {
      const tool = this.getTool(toolName);
      if (tool) {
        try {
          const result = await tool.execute(analysis.entities);
          results.push(result);
        } catch (error) {
          console.error(`Tool ${toolName} failed:`, error);
          results.push(`Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    if (results.length === 0) {
      return "I don't have the right tools to handle this request. Please try rephrasing your task.";
    }

    return results.join('\n\n');
  }

  // Context Management
  updateContext(context: Record<string, any>): void {
    this.state.context = { ...this.state.context, ...context };
  }

  getContext(): Record<string, any> {
    return { ...this.state.context };
  }

  // Agent Lifecycle
  async initialize(): Promise<void> {
    this.updateState({ status: 'idle' });
    console.log(`Agent ${this.state.id} initialized`);
  }

  async shutdown(): Promise<void> {
    this.updateState({ status: 'idle' });
    console.log(`Agent ${this.state.id} shutdown`);
  }

  // Export/Import State
  exportState(): string {
    return JSON.stringify({
      state: this.state,
      messageHistory: this.messageHistory,
      tools: Array.from(this.tools.entries()),
      capabilities: Array.from(this.capabilities.entries())
    });
  }

  importState(serializedState: string): void {
    try {
      const data = JSON.parse(serializedState);
      this.state = AgentStateSchema.parse(data.state);
      this.messageHistory = data.messageHistory || [];
      
      // Restore tools and capabilities
      if (data.tools) {
        this.tools = new Map(data.tools);
      }
      if (data.capabilities) {
        this.capabilities = new Map(data.capabilities);
      }
    } catch (error) {
      console.error('Failed to import agent state:', error);
      throw new Error('Invalid agent state data');
    }
  }
}