import { z } from 'zod';

// Task History Schema
export const TaskHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  agentType: z.string(),
  inputData: z.record(z.any()),
  outputData: z.record(z.any()),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional()
});

export type TaskHistory = z.infer<typeof TaskHistorySchema>;

// Task Filter Schema
export const TaskFilterSchema = z.object({
  userId: z.string().optional(),
  agentType: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  limit: z.number().optional(),
  offset: z.number().optional()
});

export type TaskFilter = z.infer<typeof TaskFilterSchema>;

// Task Statistics Schema
export const TaskStatsSchema = z.object({
  totalTasks: z.number(),
  completedTasks: z.number(),
  failedTasks: z.number(),
  pendingTasks: z.number(),
  processingTasks: z.number(),
  averageProcessingTime: z.number(),
  successRate: z.number(),
  tasksByAgentType: z.record(z.number()),
  tasksByStatus: z.record(z.number()),
  dailyTaskCounts: z.array(z.object({
    date: z.string(),
    count: z.number()
  }))
});

export type TaskStats = z.infer<typeof TaskStatsSchema>;

export class TaskHistoryManager {
  private tasks: Map<string, TaskHistory> = new Map();
  private storageKey = 'agent_task_history';

  constructor() {
    this.loadTasksFromStorage();
  }

  // Storage Management
  private async loadTasksFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((task: any) => {
          const parsedTask = TaskHistorySchema.parse({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          });
          this.tasks.set(parsedTask.id, parsedTask);
        });
        console.log(`Loaded ${this.tasks.size} tasks from storage`);
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
    }
  }

  private async saveTasksToStorage(): Promise<void> {
    try {
      const tasksArray = Array.from(this.tasks.values());
      localStorage.setItem(this.storageKey, JSON.stringify(tasksArray));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
    }
  }

  // Task CRUD Operations
  async createTask(task: Omit<TaskHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskHistory> {
    const newTask: TaskHistory = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(newTask.id, newTask);
    await this.saveTasksToStorage();
    
    console.log(`Created task: ${newTask.id} (${task.agentType})`);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<TaskHistory>): Promise<TaskHistory | null> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return null;
    }

    const updatedTask: TaskHistory = {
      ...existingTask,
      ...updates,
      updatedAt: new Date()
    };

    this.tasks.set(id, updatedTask);
    await this.saveTasksToStorage();
    
    console.log(`Updated task: ${id}`);
    return updatedTask;
  }

  async getTask(id: string): Promise<TaskHistory | null> {
    return this.tasks.get(id) || null;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      await this.saveTasksToStorage();
      console.log(`Deleted task: ${id}`);
    }
    return deleted;
  }

  // Query Operations
  async getTasks(filter?: TaskFilter): Promise<TaskHistory[]> {
    let tasks = Array.from(this.tasks.values());

    // Apply filters
    if (filter) {
      if (filter.userId) {
        tasks = tasks.filter(task => task.userId === filter.userId);
      }
      
      if (filter.agentType) {
        tasks = tasks.filter(task => task.agentType === filter.agentType);
      }
      
      if (filter.status) {
        tasks = tasks.filter(task => task.status === filter.status);
      }
      
      if (filter.dateFrom) {
        tasks = tasks.filter(task => task.createdAt >= filter.dateFrom!);
      }
      
      if (filter.dateTo) {
        tasks = tasks.filter(task => task.createdAt <= filter.dateTo!);
      }
    }

    // Sort by creation date (newest first)
    tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (filter?.offset) {
      tasks = tasks.slice(filter.offset);
    }
    
    if (filter?.limit) {
      tasks = tasks.slice(0, filter.limit);
    }

    return tasks;
  }

  async getTasksByUserId(userId: string, limit?: number): Promise<TaskHistory[]> {
    return this.getTasks({ userId, limit });
  }

  async getTasksByAgentType(agentType: string, limit?: number): Promise<TaskHistory[]> {
    return this.getTasks({ agentType, limit });
  }

  async getTasksByStatus(status: TaskHistory['status'], limit?: number): Promise<TaskHistory[]> {
    return this.getTasks({ status, limit });
  }

  async getRecentTasks(userId: string, limit: number = 10): Promise<TaskHistory[]> {
    return this.getTasks({ userId, limit });
  }

  // Search Operations
  async searchTasks(query: string, userId?: string): Promise<TaskHistory[]> {
    const allTasks = await this.getTasks(userId ? { userId } : undefined);
    const queryLower = query.toLowerCase();

    return allTasks.filter(task => {
      // Search in agent type
      if (task.agentType.toLowerCase().includes(queryLower)) {
        return true;
      }

      // Search in input data
      const inputStr = JSON.stringify(task.inputData).toLowerCase();
      if (inputStr.includes(queryLower)) {
        return true;
      }

      // Search in output data
      const outputStr = JSON.stringify(task.outputData).toLowerCase();
      if (outputStr.includes(queryLower)) {
        return true;
      }

      return false;
    });
  }

  // Statistics Operations
  async getTaskStats(userId?: string): Promise<TaskStats> {
    const tasks = await this.getTasks(userId ? { userId } : undefined);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const failedTasks = tasks.filter(task => task.status === 'failed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const processingTasks = tasks.filter(task => task.status === 'processing').length;

    // Calculate average processing time
    const completedTasksWithTime = tasks.filter(task => 
      task.status === 'completed' && task.inputData.startTime && task.outputData.endTime
    );
    
    const averageProcessingTime = completedTasksWithTime.length > 0 
      ? completedTasksWithTime.reduce((sum, task) => {
          const start = new Date(task.inputData.startTime).getTime();
          const end = new Date(task.outputData.endTime).getTime();
          return sum + (end - start);
        }, 0) / completedTasksWithTime.length
      : 0;

    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks by agent type
    const tasksByAgentType: Record<string, number> = {};
    tasks.forEach(task => {
      tasksByAgentType[task.agentType] = (tasksByAgentType[task.agentType] || 0) + 1;
    });

    // Tasks by status
    const tasksByStatus: Record<string, number> = {};
    tasks.forEach(task => {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
    });

    // Daily task counts (last 30 days)
    const dailyTaskCounts: Array<{ date: string; count: number }> = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = tasks.filter(task => 
        task.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      
      dailyTaskCounts.push({ date: dateStr, count });
    }

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      pendingTasks,
      processingTasks,
      averageProcessingTime,
      successRate,
      tasksByAgentType,
      tasksByStatus,
      dailyTaskCounts
    };
  }

  // Batch Operations
  async updateTaskStatus(ids: string[], status: TaskHistory['status']): Promise<number> {
    let updatedCount = 0;
    
    for (const id of ids) {
      const updated = await this.updateTask(id, { status });
      if (updated) {
        updatedCount++;
      }
    }
    
    return updatedCount;
  }

  async deleteTasks(ids: string[]): Promise<number> {
    let deletedCount = 0;
    
    for (const id of ids) {
      const deleted = await this.deleteTask(id);
      if (deleted) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  async deleteOldTasks(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldTasks = Array.from(this.tasks.values()).filter(task => 
      task.createdAt < cutoffDate
    );
    
    const idsToDelete = oldTasks.map(task => task.id);
    return this.deleteTasks(idsToDelete);
  }

  // Export/Import Operations
  async exportTasks(userId?: string): Promise<string> {
    const tasks = await this.getTasks(userId ? { userId } : undefined);
    return JSON.stringify(tasks, null, 2);
  }

  async importTasks(taskData: string): Promise<number> {
    try {
      const data = JSON.parse(taskData);
      let importedCount = 0;
      
      for (const taskData of data) {
        const task = TaskHistorySchema.parse({
          ...taskData,
          createdAt: new Date(taskData.createdAt),
          updatedAt: new Date(taskData.updatedAt)
        });
        
        this.tasks.set(task.id, task);
        importedCount++;
      }
      
      await this.saveTasksToStorage();
      console.log(`Imported ${importedCount} tasks`);
      return importedCount;
    } catch (error) {
      console.error('Failed to import tasks:', error);
      throw new Error('Invalid task data format');
    }
  }

  // Storage Management
  async clearAllTasks(): Promise<void> {
    this.tasks.clear();
    await this.saveTasksToStorage();
    console.log('Cleared all tasks from storage');
  }

  async getStorageSize(): Promise<number> {
    const tasks = Array.from(this.tasks.values());
    return JSON.stringify(tasks).length;
  }

  async compactStorage(): Promise<void> {
    // Remove old tasks (older than 90 days)
    const deletedCount = await this.deleteOldTasks(90);
    console.log(`Compacted storage: removed ${deletedCount} old tasks`);
  }
}