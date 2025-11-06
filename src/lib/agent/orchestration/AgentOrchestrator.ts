import { AIAgent, AgentTool, AgentCapability } from '../core/AIAgent';
import { RAGSystem, RAGQuery, RAGResult } from '../rag/RAGSystem';
import { TaskHistoryManager, TaskHistory } from '../storage/TaskHistory';
import { getZAI, getZAISync } from '@/lib/ai/zai-compat';

// Orchestration Configuration
export interface AgentConfig {
  id: string;
  userId: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  tools: AgentTool[];
  settings: {
    maxMemorySize: number;
    contextWindowSize: number;
    enableLearning: boolean;
    enableRAG: boolean;
    responseStyle: 'concise' | 'detailed' | 'conversational';
  };
}

// Task Request Schema
export interface TaskRequest {
  id: string;
  userId: string;
  agentId: string;
  task: string;
  context?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

// Task Response Schema
export interface TaskResponse {
  id: string;
  taskId: string;
  agentId: string;
  response: string;
  confidence: number;
  processingTime: number;
  sources: string[];
  metadata: Record<string, any>;
  createdAt: Date;
}

// Agent Status Schema
export interface AgentStatus {
  agentId: string;
  status: 'idle' | 'processing' | 'error' | 'maintenance';
  currentTask?: string;
  uptime: number;
  tasksProcessed: number;
  successRate: number;
  lastActivity: Date;
  memoryUsage: {
    shortTerm: number;
    longTerm: number;
    working: number;
  };
}

export class AgentOrchestrator {
  private agents: Map<string, AIAgent> = new Map();
  private ragSystem: RAGSystem;
  private taskHistory: TaskHistoryManager;
  private zai: any;
  private taskQueue: TaskRequest[] = [];
  private processingTasks: Map<string, Promise<TaskResponse>> = new Map();

  constructor() {
    this.ragSystem = new RAGSystem();
    this.taskHistory = new TaskHistoryManager();
    this.zai = getZAISync();
  }

  // Agent Lifecycle Management
  async createAgent(config: AgentConfig): Promise<AIAgent> {
    const agent = new AIAgent({
      id: config.id,
      userId: config.userId,
      capabilities: config.capabilities,
      tools: config.tools
    });

    // Register orchestration tools
    this.registerOrchestrationTools(agent);

    // Initialize agent
    await agent.initialize();
    
    // Store agent
    this.agents.set(config.id, agent);
    
    console.log(`Created agent: ${config.name} (${config.id})`);
    return agent;
  }

  async getAgent(agentId: string): Promise<AIAgent | null> {
    return this.agents.get(agentId) || null;
  }

  async listAgents(userId?: string): Promise<AIAgent[]> {
    const agents = Array.from(this.agents.values());
    if (userId) {
      return agents.filter(agent => agent.getState().userId === userId);
    }
    return agents;
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (agent) {
      await agent.shutdown();
      this.agents.delete(agentId);
      console.log(`Deleted agent: ${agentId}`);
      return true;
    }
    return false;
  }

  // Task Processing
  async submitTask(request: TaskRequest): Promise<string> {
    // Add to task queue
    this.taskQueue.push(request);
    
    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Process queue
    this.processTaskQueue();
    
    return request.id;
  }

  async getTaskStatus(taskId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed';
    result?: TaskResponse;
    error?: string;
  }> {
    // Check if currently processing
    if (this.processingTasks.has(taskId)) {
      return { status: 'processing' };
    }

    // Check if in queue
    const queuedTask = this.taskQueue.find(task => task.id === taskId);
    if (queuedTask) {
      return { status: 'queued' };
    }

    // Check task history
    const history = await this.taskHistory.getTask(taskId);
    if (history) {
      if (history.status === 'completed') {
        return { 
          status: 'completed', 
          result: {
            id: crypto.randomUUID(),
            taskId: history.id,
            agentId: history.agentType,
            response: JSON.stringify(history.outputData),
            confidence: 0.8,
            processingTime: 0,
            sources: [],
            metadata: history.metadata || {},
            createdAt: history.updatedAt
          }
        };
      } else if (history.status === 'failed') {
        return { status: 'failed', error: 'Task failed during processing' };
      }
    }

    return { status: 'failed', error: 'Task not found' };
  }

  private async processTaskQueue(): Promise<void> {
    if (this.taskQueue.length === 0) {
      return;
    }

    const task = this.taskQueue.shift()!;
    const agent = this.agents.get(task.agentId);

    if (!agent) {
      console.error(`Agent not found: ${task.agentId}`);
      return;
    }

    // Create processing promise
    const processingPromise = this.processTask(task, agent);
    this.processingTasks.set(task.id, processingPromise);

    try {
      const result = await processingPromise;
      console.log(`Task completed: ${task.id}`);
    } catch (error) {
      console.error(`Task failed: ${task.id}`, error);
    } finally {
      this.processingTasks.delete(task.id);
      // Process next task
      setTimeout(() => this.processTaskQueue(), 100);
    }
  }

  private async processTask(task: TaskRequest, agent: AIAgent): Promise<TaskResponse> {
    const startTime = Date.now();
    
    try {
      // Create task history entry
      const historyEntry = await this.taskHistory.createTask({
        userId: task.userId,
        agentType: task.agentId,
        inputData: {
          task: task.task,
          context: task.context,
          priority: task.priority,
          startTime: new Date().toISOString()
        },
        outputData: {},
        status: 'processing',
        metadata: task.metadata
      });

      // Process task with RAG if enabled
      let response: string;
      let sources: string[] = [];
      
      if (agent.getState().capabilities.includes('rag')) {
        const ragResult = await this.processWithRAG(task.task, task.context);
        response = ragResult.response;
        sources = ragResult.sources;
      } else {
        response = await agent.processTask(task.task, task.context);
      }

      const processingTime = Date.now() - startTime;

      // Create response
      const taskResponse: TaskResponse = {
        id: crypto.randomUUID(),
        taskId: task.id,
        agentId: task.agentId,
        response,
        confidence: 0.8,
        processingTime,
        sources,
        metadata: {
          ...task.metadata,
          agentState: agent.getState()
        },
        createdAt: new Date()
      };

      // Update task history
      await this.taskHistory.updateTask(historyEntry.id, {
        status: 'completed',
        outputData: {
          response,
          sources,
          processingTime,
          endTime: new Date().toISOString()
        }
      });

      return taskResponse;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update task history with error
      const historyEntries = await this.taskHistory.getTasks({
        userId: task.userId,
        agentType: task.agentId,
        limit: 1
      });
      
      if (historyEntries.length > 0) {
        await this.taskHistory.updateTask(historyEntries[0].id, {
          status: 'failed',
          outputData: {
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime,
            endTime: new Date().toISOString()
          }
        });
      }

      throw error;
    }
  }

  private async processWithRAG(task: string, context?: Record<string, any>): Promise<RAGResult> {
    const ragQuery: RAGQuery = {
      query: task,
      context,
      maxResults: 5,
      minRelevanceScore: 0.7
    };

    return await this.ragSystem.processQuery(ragQuery);
  }

  // Agent Tools Registration
  private registerOrchestrationTools(agent: AIAgent): void {
    // Research Tool
    agent.registerTool({
      name: 'companyResearch',
      description: 'Research a company and gather comprehensive information',
      parameters: { companyName: 'string' },
      execute: async (params: { companyName: string }) => {
        const research = await this.ragSystem.researchCompany(params.companyName);
        return JSON.stringify(research, null, 2);
      }
    });

    // Task History Tool
    agent.registerTool({
      name: 'getTaskHistory',
      description: 'Retrieve task history for the current user',
      parameters: { limit: 'number' },
      execute: async (params: { limit?: number }) => {
        const agentState = agent.getState();
        const history = await this.taskHistory.getRecentTasks(agentState.userId, params.limit || 10);
        return JSON.stringify(history, null, 2);
      }
    });

    // Memory Search Tool
    agent.registerTool({
      name: 'searchMemory',
      description: 'Search through agent memory for relevant information',
      parameters: { query: 'string' },
      execute: async (params: { query: string }) => {
        const memories = agent.getMemory('shortTerm');
        const relevantMemories = memories.filter(memory => 
          JSON.stringify(memory).toLowerCase().includes(params.query.toLowerCase())
        );
        return JSON.stringify(relevantMemories, null, 2);
      }
    });

    // Context Update Tool
    agent.registerTool({
      name: 'updateContext',
      description: 'Update the current conversation context',
      parameters: { context: 'object' },
      execute: async (params: { context: Record<string, any> }) => {
        agent.updateContext(params.context);
        return 'Context updated successfully';
      }
    });
  }

  // Agent Status and Monitoring
  async getAgentStatus(agentId: string): Promise<AgentStatus | null> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return null;
    }

    const state = agent.getState();
    const memories = agent.getMemory('shortTerm');
    const longTermMemories = agent.getMemory('longTerm');
    const workingMemory = agent.getWorkingMemory();

    // Get task statistics
    const stats = await this.taskHistory.getTaskStats(state.userId);
    const agentTasks = await this.taskHistory.getTasksByAgentType(agentId);

    return {
      agentId,
      status: state.status,
      currentTask: state.currentTask,
      uptime: Date.now() - (state.metadata.startTime || Date.now()),
      tasksProcessed: agentTasks.length,
      successRate: stats.successRate,
      lastActivity: new Date(),
      memoryUsage: {
        shortTerm: memories.length,
        longTerm: longTermMemories.length,
        working: Object.keys(workingMemory).length
      }
    };
  }

  async getAllAgentsStatus(userId?: string): Promise<AgentStatus[]> {
    const agents = await this.listAgents(userId);
    const statuses: AgentStatus[] = [];

    for (const agent of agents) {
      const status = await this.getAgentStatus(agent.getState().id);
      if (status) {
        statuses.push(status);
      }
    }

    return statuses;
  }

  // Agent Learning and Adaptation
  async enableAgentLearning(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Analyze task history to improve performance
    const state = agent.getState();
    const taskHistory = await this.taskHistory.getTasksByAgentType(agentId);
    
    // Extract patterns and insights
    const insights = await this.analyzeTaskPatterns(taskHistory);
    
    // Update agent context with insights
    agent.updateContext({
      learningInsights: insights,
      lastLearningUpdate: new Date().toISOString()
    });

    console.log(`Enabled learning for agent: ${agentId}`);
  }

  private async analyzeTaskPatterns(taskHistory: TaskHistory[]): Promise<Record<string, any>> {
    const insights: Record<string, any> = {};

    // Analyze success patterns
    const successfulTasks = taskHistory.filter(task => task.status === 'completed');
    const failedTasks = taskHistory.filter(task => task.status === 'failed');

    insights.successRate = (successfulTasks.length / taskHistory.length) * 100;
    insights.commonTasks = this.extractCommonTasks(successfulTasks);
    insights.failurePatterns = this.extractFailurePatterns(failedTasks);
    insights.optimizationSuggestions = this.generateOptimizationSuggestions(taskHistory);

    return insights;
  }

  private extractCommonTasks(tasks: TaskHistory[]): string[] {
    const taskCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const taskType = task.inputData.task?.substring(0, 50) || 'unknown';
      taskCounts[taskType] = (taskCounts[taskType] || 0) + 1;
    });

    return Object.entries(taskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([task]) => task);
  }

  private extractFailurePatterns(tasks: TaskHistory[]): string[] {
    const patterns: string[] = [];
    
    tasks.forEach(task => {
      if (task.outputData.error) {
        patterns.push(task.outputData.error);
      }
    });

    // Return unique patterns
    return [...new Set(patterns)];
  }

  private generateOptimizationSuggestions(taskHistory: TaskHistory[]): string[] {
    const suggestions: string[] = [];
    
    // Analyze processing times
    const avgProcessingTime = taskHistory.reduce((sum, task) => {
      if (task.outputData.processingTime) {
        return sum + task.outputData.processingTime;
      }
      return sum;
    }, 0) / taskHistory.length;

    if (avgProcessingTime > 10000) { // 10 seconds
      suggestions.push('Consider optimizing response generation for faster processing');
    }

    // Analyze success rates
    const successRate = (taskHistory.filter(task => task.status === 'completed').length / taskHistory.length) * 100;
    if (successRate < 80) {
      suggestions.push('Review error handling and improve task completion rate');
    }

    return suggestions;
  }

  // Cleanup and Maintenance
  async shutdown(): Promise<void> {
    // Shutdown all agents
    const shutdownPromises = Array.from(this.agents.values()).map(agent => agent.shutdown());
    await Promise.all(shutdownPromises);
    
    // Clear collections
    this.agents.clear();
    this.taskQueue.length = 0;
    this.processingTasks.clear();
    
    console.log('Agent orchestrator shutdown complete');
  }

  async getSystemStats(): Promise<{
    totalAgents: number;
    activeAgents: number;
    queuedTasks: number;
    processingTasks: number;
    totalTaskHistory: number;
    systemUptime: number;
  }> {
    const agents = Array.from(this.agents.values());
    const activeAgents = agents.filter(agent => agent.getState().status === 'processing').length;
    const stats = await this.taskHistory.getTaskStats();

    return {
      totalAgents: agents.length,
      activeAgents,
      queuedTasks: this.taskQueue.length,
      processingTasks: this.processingTasks.size,
      totalTaskHistory: stats.totalTasks,
      systemUptime: Date.now() - (this as any).startTime || 0
    };
  }
}