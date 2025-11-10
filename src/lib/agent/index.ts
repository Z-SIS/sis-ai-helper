// Core AI Agent System
export { AIAgent, AgentStateSchema, AgentMessageSchema, AgentToolSchema, AgentCapabilitySchema } from './core/AIAgent';
export type { AgentState, AgentMessage, AgentTool, AgentCapability } from './core/AIAgent';

// Local imports for assembling the agentSystem default export
import { AIAgent as _AIAgent } from './core/AIAgent';
import { AgentOrchestrator as _AgentOrchestrator } from './orchestration/AgentOrchestrator';
import { RAGSystem as _RAGSystem } from './rag/RAGSystem';
import { TaskHistoryManager as _TaskHistoryManager } from './storage/TaskHistory';
import { ContextManager as _ContextManager } from './context/ContextManager';
import { MemoryManager as _MemoryManager } from './learning/MemoryManager';

// RAG System
export { RAGSystem, ResearchCacheSchema, RAGQuerySchema, RAGResultSchema } from './rag/RAGSystem';
export type { ResearchCache, RAGQuery, RAGResult } from './rag/RAGSystem';

// Task History Management
export { TaskHistoryManager, TaskHistorySchema, TaskFilterSchema, TaskStatsSchema } from './storage/TaskHistory';
export type { TaskHistory, TaskFilter, TaskStats } from './storage/TaskHistory';

// Agent Orchestration
export { AgentOrchestrator } from './orchestration/AgentOrchestrator';
export type { 
  AgentConfig, 
  TaskRequest, 
  TaskResponse, 
  AgentStatus 
} from './orchestration/AgentOrchestrator';

// Context Management
export { ContextManager, ContextSchema, ResponseRequestSchema, ResponseSchema } from './context/ContextManager';
export type { 
  Context, 
  ContextUpdate, 
  ResponseRequest, 
  Response 
} from './context/ContextManager';

// Memory and Learning
export { MemoryManager, MemorySchema, LearningPatternSchema, LearningInsightSchema, MemoryQuerySchema } from './learning/MemoryManager';
export type { 
  Memory, 
  LearningPattern, 
  LearningInsight, 
  MemoryQuery 
} from './learning/MemoryManager';

// Pre-built Agent Configurations
export const PRESET_AGENT_CONFIGS = {
  // General Purpose Assistant
  generalAssistant: {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'A versatile AI assistant for various tasks',
    capabilities: [
      {
        name: 'conversation',
        description: 'Engage in natural conversations',
        tools: ['conversation'],
        enabled: true
      },
      {
        name: 'research',
        description: 'Research companies and topics',
        tools: ['companyResearch', 'webSearch'],
        enabled: true
      },
      {
        name: 'content_generation',
        description: 'Generate various types of content',
        tools: ['emailGenerator', 'documentGenerator'],
        enabled: true
      }
    ],
    settings: {
      maxMemorySize: 1000,
      contextWindowSize: 10,
      enableLearning: true,
      enableRAG: true,
      responseStyle: 'conversational' as const
    }
  },

  // Business Research Specialist
  businessResearcher: {
    id: 'business-researcher',
    name: 'Business Research Specialist',
    description: 'Specialized in company research and business analysis',
    capabilities: [
      {
        name: 'company_research',
        description: 'Deep company research and analysis',
        tools: ['companyResearch', 'dataAnalyzer'],
        enabled: true
      },
      {
        name: 'market_analysis',
        description: 'Market trend analysis',
        tools: ['marketAnalyzer', 'dataAnalyzer'],
        enabled: true
      },
      {
        name: 'rag',
        description: 'Knowledge-based responses',
        tools: ['knowledgeBase'],
        enabled: true
      }
    ],
    settings: {
      maxMemorySize: 2000,
      contextWindowSize: 15,
      enableLearning: true,
      enableRAG: true,
      responseStyle: 'professional' as const
    }
  },

  // Content Creator
  contentCreator: {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Specialized in generating professional content',
    capabilities: [
      {
        name: 'email_generation',
        description: 'Generate professional emails',
        tools: ['emailGenerator'],
        enabled: true
      },
      {
        name: 'document_generation',
        description: 'Create various documents',
        tools: ['documentGenerator'],
        enabled: true
      },
      {
        name: 'content_optimization',
        description: 'Optimize content for specific purposes',
        tools: ['contentOptimizer'],
        enabled: true
      }
    ],
    settings: {
      maxMemorySize: 500,
      contextWindowSize: 8,
      enableLearning: true,
      enableRAG: false,
      responseStyle: 'professional' as const
    }
  }
};

// Utility Functions
export class AgentFactory {
  static createAgent(config: any, userId: string) {
    // This would create an agent with the specified configuration
    // Implementation would depend on the specific requirements
    return {
      config: { ...config, userId },
      initialize: async () => {
        console.log(`Initializing agent: ${config.name}`);
      }
    };
  }

  static async createOrchestrator() {
    const { AgentOrchestrator } = await import('./orchestration/AgentOrchestrator');
    return new AgentOrchestrator();
  }

  static async createMemoryManager() {
    const { TaskHistoryManager } = await import('./storage/TaskHistory');
    const { MemoryManager } = await import('./learning/MemoryManager');
    const taskHistory = new TaskHistoryManager();
    return new MemoryManager(taskHistory);
  }

  static async createRAGSystem() {
    const { RAGSystem } = await import('./rag/RAGSystem');
    return new RAGSystem();
  }

  static async createContextManager() {
    const { ContextManager } = await import('./context/ContextManager');
    return new ContextManager();
  }
}

// System Health and Monitoring
export class AgentSystemMonitor {
  static async getSystemHealth() {
    // Implementation would check system health
    return {
      status: 'healthy',
      timestamp: new Date(),
      components: {
        orchestration: 'healthy',
        rag: 'healthy',
        memory: 'healthy',
        context: 'healthy'
      }
    };
  }

  static async getSystemMetrics() {
    // Implementation would return system metrics
    return {
      totalAgents: 0,
      activeTasks: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      averageResponseTime: 0
    };
  }
}

// Default Exports
const agentSystem = {
  // Core Classes
  AIAgent: _AIAgent,
  AgentOrchestrator: _AgentOrchestrator,
  RAGSystem: _RAGSystem,
  TaskHistoryManager: _TaskHistoryManager,
  ContextManager: _ContextManager,
  MemoryManager: _MemoryManager,
  
  // Utilities
  AgentFactory,
  AgentSystemMonitor,
  
  // Presets
  PRESET_AGENT_CONFIGS
};

export default agentSystem;