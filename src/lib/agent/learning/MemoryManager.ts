import { z } from 'zod';
import { AIAgent } from '../core/AIAgent';
import { TaskHistoryManager, TaskHistory } from '../storage/TaskHistory';

// Memory Schema
export const MemorySchema = z.object({
  id: z.string(),
  type: z.enum(['short_term', 'long_term', 'episodic', 'semantic', 'procedural']),
  content: z.record(z.any()),
  importance: z.number().min(0).max(1),
  accessCount: z.number().default(0),
  lastAccessed: z.date(),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
  tags: z.array(z.string()).optional(),
  associations: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export type Memory = z.infer<typeof MemorySchema>;

// Learning Pattern Schema
export const LearningPatternSchema = z.object({
  id: z.string(),
  pattern: z.string(),
  frequency: z.number(),
  successRate: z.number(),
  contexts: z.array(z.string()),
  lastObserved: z.date(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.any()).optional()
});

export type LearningPattern = z.infer<typeof LearningPatternSchema>;

// Learning Insight Schema
export const LearningInsightSchema = z.object({
  id: z.string(),
  type: z.enum(['behavioral', 'performance', 'preference', 'knowledge']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
  recommendations: z.array(z.string()),
  createdAt: z.date(),
  appliesTo: z.array(z.string()).optional() // Agent IDs this applies to
});

export type LearningInsight = z.infer<typeof LearningInsightSchema>;

// Memory Query Schema
export const MemoryQuerySchema = z.object({
  type: z.enum(['short_term', 'long_term', 'episodic', 'semantic', 'procedural']).optional(),
  tags: z.array(z.string()).optional(),
  importance: z.number().min(0).max(1).optional(),
  keywords: z.array(z.string()).optional(),
  limit: z.number().optional(),
  includeExpired: z.boolean().default(false)
});

export type MemoryQuery = z.infer<typeof MemoryQuerySchema>;

export class MemoryManager {
  private memories: Map<string, Memory> = new Map();
  private patterns: Map<string, LearningPattern> = new Map();
  private insights: Map<string, LearningInsight> = new Map();
  private taskHistory: TaskHistoryManager;
  private storageKey = 'agent_memory_system';

  constructor(taskHistory: TaskHistoryManager) {
    this.taskHistory = taskHistory;
    this.loadFromStorage();
  }

  // Memory Management
  async addMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'lastAccessed'>): Promise<string> {
    const newMemory: Memory = {
      ...memory,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastAccessed: new Date()
    };

    this.memories.set(newMemory.id, newMemory);
    await this.saveToStorage();
    
    console.log(`Added ${memory.type} memory: ${newMemory.id}`);
    return newMemory.id;
  }

  async getMemory(id: string): Promise<Memory | null> {
    const memory = this.memories.get(id);
    if (memory) {
      // Update access count and last accessed
      memory.accessCount++;
      memory.lastAccessed = new Date();
      await this.saveToStorage();
    }
    return memory || null;
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<boolean> {
    const memory = this.memories.get(id);
    if (!memory) {
      return false;
    }

    const updatedMemory: Memory = {
      ...memory,
      ...updates,
      lastAccessed: new Date()
    };

    this.memories.set(id, updatedMemory);
    await this.saveToStorage();
    
    return true;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const deleted = this.memories.delete(id);
    if (deleted) {
      await this.saveToStorage();
    }
    return deleted;
  }

  async queryMemories(query: MemoryQuery): Promise<Memory[]> {
    let memories = Array.from(this.memories.values());

    // Filter by type
    if (query.type) {
      memories = memories.filter(memory => memory.type === query.type);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      memories = memories.filter(memory => 
        query.tags!.some(tag => memory.tags?.includes(tag))
      );
    }

    // Filter by importance
    if (query.importance !== undefined) {
      memories = memories.filter(memory => memory.importance >= query.importance!);
    }

    // Filter by keywords
    if (query.keywords && query.keywords.length > 0) {
      memories = memories.filter(memory => {
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        return query.keywords!.some(keyword => 
          contentStr.includes(keyword.toLowerCase())
        );
      });
    }

    // Filter expired memories
    if (!query.includeExpired) {
      const now = new Date();
      memories = memories.filter(memory => 
        !memory.expiresAt || memory.expiresAt > now
      );
    }

    // Sort by importance and last accessed
    memories.sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }
      return b.lastAccessed.getTime() - a.lastAccessed.getTime();
    });

    // Apply limit
    if (query.limit) {
      memories = memories.slice(0, query.limit);
    }

    return memories;
  }

  // Learning and Pattern Recognition
  async learnFromTaskHistory(agentId: string): Promise<void> {
    const tasks = await this.taskHistory.getTasksByAgentType(agentId);
    
    // Analyze successful tasks
    const successfulTasks = tasks.filter(task => task.status === 'completed');
    const failedTasks = tasks.filter(task => task.status === 'failed');

    // Extract patterns from successful tasks
    await this.extractSuccessPatterns(successfulTasks, agentId);
    
    // Extract patterns from failed tasks
    await this.extractFailurePatterns(failedTasks, agentId);
    
    // Generate insights
    await this.generateLearningInsights(successfulTasks, failedTasks, agentId);
    
    // Update procedural memories
    await this.updateProceduralMemories(successfulTasks, agentId);
    
    console.log(`Learning completed for agent: ${agentId}`);
  }

  private async extractSuccessPatterns(tasks: TaskHistory[], agentId: string): Promise<void> {
    const patterns: Record<string, number> = {};
    
    tasks.forEach(task => {
      // Extract task patterns
      const taskPattern = this.extractTaskPattern(task);
      if (taskPattern) {
        patterns[taskPattern] = (patterns[taskPattern] || 0) + 1;
      }
    });

    // Create or update learning patterns
    for (const [pattern, frequency] of Object.entries(patterns)) {
      if (frequency >= 3) { // Only consider patterns that appear at least 3 times
        const existingPattern = Array.from(this.patterns.values())
          .find(p => p.pattern === pattern && p.appliesTo?.includes(agentId));

        const successRate = this.calculatePatternSuccessRate(pattern, tasks);
        
        if (existingPattern) {
          existingPattern.frequency = frequency;
          existingPattern.successRate = successRate;
          existingPattern.lastObserved = new Date();
          existingPattern.confidence = Math.min(0.95, existingPattern.confidence + 0.05);
        } else {
          const newPattern: LearningPattern = {
            id: crypto.randomUUID(),
            pattern,
            frequency,
            successRate,
            contexts: tasks.map(t => t.id),
            lastObserved: new Date(),
            confidence: 0.5,
            metadata: { agentId }
          };
          
          this.patterns.set(newPattern.id, newPattern);
        }
      }
    }
  }

  private async extractFailurePatterns(tasks: TaskHistory[], agentId: string): Promise<void> {
    const errorPatterns: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.outputData.error) {
        const errorPattern = this.extractErrorPattern(task);
        if (errorPattern) {
          errorPatterns[errorPattern] = (errorPatterns[errorPattern] || 0) + 1;
        }
      }
    });

    // Create memories for common failure patterns
    for (const [pattern, frequency] of Object.entries(errorPatterns)) {
      if (frequency >= 2) { // Consider patterns that appear at least 2 times
        await this.addMemory({
          type: 'semantic',
          content: {
            pattern,
            frequency,
            type: 'failure_pattern',
            agentId
          },
          importance: Math.min(0.8, frequency * 0.2),
          tags: ['failure', 'pattern', 'learning'],
          metadata: {
            createdAt: new Date(),
            source: 'task_analysis'
          }
        });
      }
    }
  }

  private async generateLearningInsights(
    successfulTasks: TaskHistory[],
    failedTasks: TaskHistory[],
    agentId: string
  ): Promise<void> {
    const insights: LearningInsight[] = [];

    // Performance insights
    if (successfulTasks.length > 0 || failedTasks.length > 0) {
      const totalTasks = successfulTasks.length + failedTasks.length;
      const successRate = (successfulTasks.length / totalTasks) * 100;
      
      insights.push({
        id: crypto.randomUUID(),
        type: 'performance',
        title: 'Task Success Rate',
        description: `Agent has a ${successRate.toFixed(1)}% success rate across ${totalTasks} tasks.`,
        confidence: 0.9,
        evidence: [
          `${successfulTasks.length} successful tasks`,
          `${failedTasks.length} failed tasks`
        ],
        recommendations: this.generatePerformanceRecommendations(successRate),
        createdAt: new Date(),
        appliesTo: [agentId]
      });
    }

    // Behavioral insights
    const commonTasks = this.extractMostCommonTasks(successfulTasks);
    if (commonTasks.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'behavioral',
        title: 'Task Preferences',
        description: `Agent most frequently handles: ${commonTasks.slice(0, 3).join(', ')}`,
        confidence: 0.8,
        evidence: commonTasks.map(task => `High frequency of ${task}`),
        recommendations: [
          'Optimize workflows for common task types',
          'Develop specialized tools for frequent tasks'
        ],
        createdAt: new Date(),
        appliesTo: [agentId]
      });
    }

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });
  }

  private async updateProceduralMemories(tasks: TaskHistory[], agentId: string): Promise<void> {
    // Extract successful procedures
    const procedures = this.extractProcedures(tasks);
    
    for (const procedure of procedures) {
      await this.addMemory({
        type: 'procedural',
        content: {
          procedure: procedure.steps,
          context: procedure.context,
          agentId
        },
        importance: procedure.successRate,
        tags: ['procedure', 'successful', agentId],
        metadata: {
          successRate: procedure.successRate,
          usageCount: procedure.frequency
        }
      });
    }
  }

  // Memory Consolidation
  async consolidateMemories(): Promise<void> {
    const now = new Date();
    const consolidationThreshold = 24 * 60 * 60 * 1000; // 24 hours

    // Move important short-term memories to long-term
    const shortTermMemories = await this.queryMemories({
      type: 'short_term',
      importance: 0.7
    });

    for (const memory of shortTermMemories) {
      const age = now.getTime() - memory.createdAt.getTime();
      if (age > consolidationThreshold) {
        await this.updateMemory(memory.id, {
          type: 'long_term',
          importance: memory.importance * 0.9 // Slightly reduce importance during consolidation
        });
      }
    }

    // Remove expired memories
    const expiredMemories = Array.from(this.memories.values())
      .filter(memory => memory.expiresAt && memory.expiresAt <= now);

    for (const memory of expiredMemories) {
      await this.deleteMemory(memory.id);
    }

    console.log(`Memory consolidation completed. Removed ${expiredMemories.length} expired memories.`);
  }

  // Memory Retrieval and Association
  async retrieveAssociatedMemories(memoryId: string): Promise<Memory[]> {
    const memory = this.memories.get(memoryId);
    if (!memory || !memory.associations) {
      return [];
    }

    const associatedMemories: Memory[] = [];
    for (const associatedId of memory.associations) {
      const associatedMemory = this.memories.get(associatedId);
      if (associatedMemory) {
        associatedMemories.push(associatedMemory);
      }
    }

    return associatedMemories;
  }

  async findSimilarMemories(content: Record<string, any>, limit: number = 5): Promise<Memory[]> {
    const contentStr = JSON.stringify(content).toLowerCase();
    const similarities: Array<{ memory: Memory; score: number }> = [];

    for (const memory of this.memories.values()) {
      const memoryContentStr = JSON.stringify(memory.content).toLowerCase();
      const similarity = this.calculateSimilarity(contentStr, memoryContentStr);
      
      if (similarity > 0.3) { // Threshold for similarity
        similarities.push({ memory, score: similarity });
      }
    }

    // Sort by similarity score and return top results
    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, limit).map(item => item.memory);
  }

  // Helper Methods
  private extractTaskPattern(task: TaskHistory): string | null {
    const taskType = task.inputData.task?.substring(0, 50) || 'unknown';
    const hasContext = Object.keys(task.inputData.context || {}).length > 0;
    
    return hasContext ? `${taskType}_with_context` : taskType;
  }

  private extractErrorPattern(task: TaskHistory): string | null {
    const error = task.outputData.error;
    if (!error) return null;
    
    // Extract common error patterns
    if (error.includes('timeout')) return 'timeout_error';
    if (error.includes('network')) return 'network_error';
    if (error.includes('authentication')) return 'auth_error';
    if (error.includes('validation')) return 'validation_error';
    
    return 'unknown_error';
  }

  private calculatePatternSuccessRate(pattern: string, tasks: TaskHistory[]): number {
    const patternTasks = tasks.filter(task => 
      this.extractTaskPattern(task) === pattern
    );
    
    if (patternTasks.length === 0) return 0;
    
    const successfulTasks = patternTasks.filter(task => task.status === 'completed');
    return (successfulTasks.length / patternTasks.length) * 100;
  }

  private generatePerformanceRecommendations(successRate: number): string[] {
    if (successRate >= 90) {
      return ['Maintain current performance levels', 'Consider handling more complex tasks'];
    } else if (successRate >= 70) {
      return ['Focus on improving error handling', 'Review failed tasks for patterns'];
    } else {
      return ['Significant improvement needed', 'Analyze failure patterns thoroughly', 'Consider additional training or tools'];
    }
  }

  private extractMostCommonTasks(tasks: TaskHistory[]): string[] {
    const taskCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const taskType = this.extractTaskPattern(task);
      if (taskType) {
        taskCounts[taskType] = (taskCounts[taskType] || 0) + 1;
      }
    });

    return Object.entries(taskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([task]) => task);
  }

  private extractProcedures(tasks: TaskHistory[]): Array<{
    steps: string[];
    context: Record<string, any>;
    successRate: number;
    frequency: number;
  }> {
    // This is a simplified implementation
    // In a real system, this would use more sophisticated procedure extraction
    return [];
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation based on common words
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    const totalWords = new Set([...words1, ...words2]).size;
    return commonWords.length / totalWords;
  }

  // Analytics and Reporting
  async getMemoryStats(): Promise<{
    totalMemories: number;
    memoriesByType: Record<string, number>;
    averageImportance: number;
    expiredMemories: number;
    totalPatterns: number;
    totalInsights: number;
  }> {
    const memories = Array.from(this.memories.values());
    const memoriesByType: Record<string, number> = {};
    
    memories.forEach(memory => {
      memoriesByType[memory.type] = (memoriesByType[memory.type] || 0) + 1;
    });

    const now = new Date();
    const expiredMemories = memories.filter(memory => 
      memory.expiresAt && memory.expiresAt <= now
    ).length;

    const averageImportance = memories.length > 0 
      ? memories.reduce((sum, memory) => sum + memory.importance, 0) / memories.length
      : 0;

    return {
      totalMemories: memories.length,
      memoriesByType,
      averageImportance,
      expiredMemories,
      totalPatterns: this.patterns.size,
      totalInsights: this.insights.size
    };
  }

  async getLearningInsights(agentId?: string): Promise<LearningInsight[]> {
    const insights = Array.from(this.insights.values());
    
    if (agentId) {
      return insights.filter(insight => 
        !insight.appliesTo || insight.appliesTo.includes(agentId)
      );
    }
    
    return insights;
  }

  async getLearningPatterns(agentId?: string): Promise<LearningPattern[]> {
    const patterns = Array.from(this.patterns.values());
    
    if (agentId) {
      return patterns.filter(pattern => 
        pattern.metadata?.agentId === agentId
      );
    }
    
    return patterns;
  }

  // Storage Management
  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        memories: Array.from(this.memories.entries()),
        patterns: Array.from(this.patterns.entries()),
        insights: Array.from(this.insights.entries())
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save memory system to storage:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.memories) {
          this.memories = new Map(data.memories.map(([id, memory]: [string, any]) => [
            id,
            {
              ...memory,
              createdAt: new Date(memory.createdAt),
              lastAccessed: new Date(memory.lastAccessed),
              expiresAt: memory.expiresAt ? new Date(memory.expiresAt) : undefined
            }
          ]));
        }
        
        if (data.patterns) {
          this.patterns = new Map(data.patterns.map(([id, pattern]: [string, any]) => [
            id,
            {
              ...pattern,
              lastObserved: new Date(pattern.lastObserved)
            }
          ]));
        }
        
        if (data.insights) {
          this.insights = new Map(data.insights.map(([id, insight]: [string, any]) => [
            id,
            {
              ...insight,
              createdAt: new Date(insight.createdAt)
            }
          ]));
        }
        
        console.log(`Loaded memory system: ${this.memories.size} memories, ${this.patterns.size} patterns, ${this.insights.size} insights`);
      }
    } catch (error) {
      console.error('Failed to load memory system from storage:', error);
    }
  }

  async clearAllMemories(): Promise<void> {
    this.memories.clear();
    this.patterns.clear();
    this.insights.clear();
    await this.saveToStorage();
    console.log('Cleared all memories and learning data');
  }
}