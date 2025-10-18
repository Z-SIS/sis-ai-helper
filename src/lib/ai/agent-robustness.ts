import { 
  AgentType,
  AgentInput,
  AgentOutput,
  AgentMetadata
} from '@/shared/schemas';
<<<<<<< HEAD
import { googleAIAgentSystem } from './agent-system';
=======
import { optimizedAgentSystem } from './agent-system';
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2

// ============================================================================
// AGENT ROBUSTNESS TYPES
// ============================================================================

export interface RobustnessConfig {
  maxRetries: number;
  timeoutMs: number;
  fallbackEnabled: boolean;
  circuitBreakerThreshold: number;
  healthCheckInterval: number;
}

export interface AgentHealthStatus {
  agentType: AgentType;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  recentErrors: string[];
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: Date;
  nextAttemptTime: Date;
}

export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  tokenUsage: {
    total: number;
    average: number;
  };
  lastRequestTime: Date;
}

// ============================================================================
// AGENT ROBUSTNESS MANAGER
// ============================================================================

export class AgentRobustnessManager {
  private static instance: AgentRobustnessManager;
  private config: RobustnessConfig;
  private healthStatus: Map<AgentType, AgentHealthStatus>;
  private circuitBreakers: Map<AgentType, CircuitBreakerState>;
  private metrics: Map<AgentType, AgentMetrics>;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      maxRetries: 3,
      timeoutMs: 30000,
      fallbackEnabled: true,
      circuitBreakerThreshold: 5,
      healthCheckInterval: 60000, // 1 minute
    };
    
    this.healthStatus = new Map();
    this.circuitBreakers = new Map();
    this.metrics = new Map();
    
    this.initializeHealthStatus();
    this.startHealthChecks();
  }

  public static getInstance(): AgentRobustnessManager {
    if (!AgentRobustnessManager.instance) {
      AgentRobustnessManager.instance = new AgentRobustnessManager();
    }
    return AgentRobustnessManager.instance;
  }

  // Execute agent with robustness features
  public async executeAgent<T extends AgentOutput>(
    agentType: AgentType,
    input: AgentInput
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(agentType)) {
        throw new Error(`Circuit breaker is open for agent: ${agentType}`);
      }

      // Execute with retry logic
      const result = await this.executeWithRetry(agentType, input);
      
      // Update metrics
      this.updateMetrics(agentType, true, Date.now() - startTime);
      
      // Update health status
      this.updateHealthStatus(agentType, true);
      
      return result as T;
      
    } catch (error) {
      // Update metrics
      this.updateMetrics(agentType, false, Date.now() - startTime);
      
      // Update health status
      this.updateHealthStatus(agentType, false, error);
      
      // Update circuit breaker
      this.updateCircuitBreaker(agentType);
      
      // Try fallback if enabled
      if (this.config.fallbackEnabled) {
        return await this.executeFallback(agentType, input) as T;
      }
      
      throw error;
    }
  }

  // Get agent health status
  public getHealthStatus(agentType: AgentType): AgentHealthStatus {
    return this.healthStatus.get(agentType) || {
      agentType,
      status: 'unhealthy',
      lastCheck: new Date(),
      successRate: 0,
      averageResponseTime: 0,
      errorCount: 0,
      recentErrors: [],
    };
  }

  // Get all agent health statuses
  public getAllHealthStatus(): AgentHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  // Get agent metrics
  public getMetrics(agentType: AgentType): AgentMetrics {
    return this.metrics.get(agentType) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      tokenUsage: {
        total: 0,
        average: 0,
      },
      lastRequestTime: new Date(),
    };
  }

  // Reset circuit breaker
  public resetCircuitBreaker(agentType: AgentType): void {
    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (circuitBreaker) {
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
      console.log(`Circuit breaker reset for agent: ${agentType}`);
    }
  }

  // Update configuration
  public updateConfig(newConfig: Partial<RobustnessConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private methods
  private initializeHealthStatus(): void {
    const agentTypes = Object.keys(AgentMetadata) as AgentType[];
    
    for (const agentType of agentTypes) {
      this.healthStatus.set(agentType, {
        agentType,
        status: 'healthy',
        lastCheck: new Date(),
        successRate: 100,
        averageResponseTime: 0,
        errorCount: 0,
        recentErrors: [],
      });
      
      this.circuitBreakers.set(agentType, {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: new Date(),
        nextAttemptTime: new Date(),
      });
      
      this.metrics.set(agentType, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        tokenUsage: {
          total: 0,
          average: 0,
        },
        lastRequestTime: new Date(),
      });
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    const agentTypes = Object.keys(AgentMetadata) as AgentType[];
    
    for (const agentType of agentTypes) {
      try {
        await this.performHealthCheck(agentType);
      } catch (error) {
        console.error(`Health check failed for ${agentType}:`, error);
      }
    }
  }

  private async performHealthCheck(agentType: AgentType): Promise<void> {
    const healthStatus = this.healthStatus.get(agentType);
    if (!healthStatus) return;

    // Simple health check - try to validate input schema
    const testInput = this.getTestInput(agentType);
    const startTime = Date.now();
    
    try {
      // Simulate a quick validation
      JSON.stringify(testInput);
      const responseTime = Date.now() - startTime;
      
      // Update health status
      healthStatus.status = 'healthy';
      healthStatus.lastCheck = new Date();
      healthStatus.averageResponseTime = responseTime;
      
    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.lastCheck = new Date();
      healthStatus.errorCount++;
      healthStatus.recentErrors.unshift(error instanceof Error ? error.message : 'Unknown error');
      
      // Keep only last 5 errors
      if (healthStatus.recentErrors.length > 5) {
        healthStatus.recentErrors = healthStatus.recentErrors.slice(0, 5);
      }
    }
  }

  private getTestInput(agentType: AgentType): AgentInput {
    // Return minimal valid input for health check
    switch (agentType) {
      case 'company-research':
        return { companyName: 'Test Company' } as any;
      case 'generate-sop':
        return { processName: 'Test Process' } as any;
      case 'compose-email':
        return { recipient: 'test@example.com', subject: 'Test', tone: 'professional', purpose: 'test' } as any;
      case 'excel-helper':
        return { question: 'Test question' } as any;
      case 'feasibility-check':
        return { projectName: 'Test Project', description: 'Test description' } as any;
      case 'deployment-plan':
        return { projectName: 'Test Project', environment: 'development' } as any;
      case 'usps-battlecard':
        return { companyName: 'Test Co', competitor: 'Test Competitor' } as any;
      case 'disbandment-plan':
        return { projectName: 'Test Project', reason: 'Test reason' } as any;
      case 'slide-template':
        return { topic: 'Test Topic', purpose: 'informative' } as any;
      default:
        return {} as any;
    }
  }

  private async executeWithRetry<T extends AgentOutput>(
    agentType: AgentType,
    input: AgentInput
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Set timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeoutMs);
        });
        
        // Execute agent
<<<<<<< HEAD
        const agentPromise = googleAIAgentSystem.handleAgentRequest(agentType, input);
=======
        const agentPromise = optimizedAgentSystem.executeAgentRequest(agentType, input);
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
        
        // Race between agent execution and timeout
        const result = await Promise.race([agentPromise, timeoutPromise]);
        
        return result as T;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private async executeFallback<T extends AgentOutput>(
    agentType: AgentType,
    input: AgentInput
  ): Promise<T> {
    console.log(`Executing fallback for agent: ${agentType}`);
    
    // Return a basic fallback response
    switch (agentType) {
      case 'company-research':
        return {
          companyName: (input as any).companyName || 'Unknown',
          industry: 'Information not available',
          location: 'Information not available',
          description: 'Unable to fetch company information at this time. Please try again later.',
          website: '',
          lastUpdated: new Date().toISOString(),
        } as T;
        
      case 'compose-email':
        return {
          subject: (input as any).subject || 'No Subject',
          body: 'Unable to generate email content at this time. Please try again later.',
          tone: (input as any).tone || 'professional',
          wordCount: 15,
        } as T;
        
      default:
        return {
          error: 'Service temporarily unavailable. Please try again later.',
        } as any;
    }
  }

  private isCircuitBreakerOpen(agentType: AgentType): boolean {
    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (!circuitBreaker) return false;
    
    if (circuitBreaker.isOpen) {
      // Check if we can try again
      if (Date.now() >= circuitBreaker.nextAttemptTime.getTime()) {
        circuitBreaker.isOpen = false;
        circuitBreaker.failureCount = 0;
        return false;
      }
      return true;
    }
    
    return false;
  }

  private updateCircuitBreaker(agentType: AgentType): void {
    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (!circuitBreaker) return;
    
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = new Date();
    
    if (circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
      circuitBreaker.isOpen = true;
      // Wait 5 minutes before next attempt
      circuitBreaker.nextAttemptTime = new Date(Date.now() + 5 * 60 * 1000);
      
      console.log(`Circuit breaker opened for agent: ${agentType}`);
    }
  }

  private updateMetrics(agentType: AgentType, success: boolean, responseTime: number): void {
    const metrics = this.metrics.get(agentType);
    if (!metrics) return;
    
    metrics.totalRequests++;
    metrics.lastRequestTime = new Date();
    
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
    
    // Update average response time
    const totalResponseTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime;
    metrics.averageResponseTime = totalResponseTime / metrics.totalRequests;
    
    // Update token usage from agent system
<<<<<<< HEAD
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
=======
    const tokenUsage = optimizedAgentSystem.getTokenUsage();
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
    if (tokenUsage.byAgent[agentType]) {
      metrics.tokenUsage.total = tokenUsage.byAgent[agentType];
      metrics.tokenUsage.average = metrics.tokenUsage.total / metrics.totalRequests;
    }
  }

  private updateHealthStatus(agentType: AgentType, success: boolean, error?: any): void {
    const healthStatus = this.healthStatus.get(agentType);
    if (!healthStatus) return;
    
    healthStatus.lastCheck = new Date();
    
    if (success) {
      healthStatus.status = 'healthy';
      healthStatus.errorCount = 0;
      healthStatus.recentErrors = [];
    } else {
      healthStatus.status = 'degraded';
      healthStatus.errorCount++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      healthStatus.recentErrors.unshift(errorMessage);
      
      // Keep only last 5 errors
      if (healthStatus.recentErrors.length > 5) {
        healthStatus.recentErrors = healthStatus.recentErrors.slice(0, 5);
      }
    }
    
    // Calculate success rate
    const metrics = this.metrics.get(agentType);
    if (metrics && metrics.totalRequests > 0) {
      healthStatus.successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    }
    
    // Update status based on success rate
    if (healthStatus.successRate < 50) {
      healthStatus.status = 'unhealthy';
    } else if (healthStatus.successRate < 80) {
      healthStatus.status = 'degraded';
    } else {
      healthStatus.status = 'healthy';
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const agentRobustnessManager = AgentRobustnessManager.getInstance();

// Convenience function
export const executeAgentWithRobustness = <T extends AgentOutput>(
  agentType: AgentType,
  input: AgentInput
): Promise<T> => {
  return agentRobustnessManager.executeAgent<T>(agentType, input);
};