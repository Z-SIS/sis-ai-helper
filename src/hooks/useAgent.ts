import { useState, useEffect, useCallback } from 'react';

interface Agent {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'idle' | 'processing' | 'error' | 'maintenance';
  capabilities: string[];
  currentTask?: string;
  tasksProcessed: number;
  successRate: number;
  lastActivity: string;
  memoryUsage: {
    shortTerm: number;
    longTerm: number;
    working: number;
  };
}

interface TaskRequest {
  id: string;
  userId: string;
  agentId: string;
  task: string;
  context?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

interface TaskStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: {
    id: string;
    taskId: string;
    agentId: string;
    response: string;
    confidence: number;
    processingTime: number;
    sources: string[];
    metadata: Record<string, any>;
    createdAt: string;
  };
  error?: string;
}

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: Array<{
    name: string;
    description: string;
    tools: string[];
    enabled: boolean;
  }>;
  settings: {
    maxMemorySize: number;
    contextWindowSize: number;
    enableLearning: boolean;
    enableRAG: boolean;
    responseStyle: 'concise' | 'detailed' | 'conversational';
  };
}

interface UseAgentReturn {
  // Agent Management
  agents: Agent[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createAgent: (userId: string, configType: string, customConfig?: AgentConfig) => Promise<{ success: boolean; agentId?: string; error?: string }>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  submitTask: (taskRequest: Omit<TaskRequest, 'id'>) => Promise<{ success: boolean; taskId?: string; error?: string }>;
  getTaskStatus: (taskId: string) => Promise<TaskStatus | null>;
  getAgentStatus: (agentId: string) => Promise<Agent | null>;
  enableLearning: (agentId: string) => Promise<boolean>;
  
  // System
  refreshAgents: (userId: string) => Promise<void>;
  systemStats: any;
  health: any;
}

export function useAgent(userId?: string): UseAgentReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  // API helper function
  const apiCall = useCallback(async (action: string, data: any = {}) => {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }

    return response.json();
  }, []);

  // GET API helper
  const apiGet = useCallback(async (action: string, params: Record<string, string> = {}) => {
    const url = new URL('/api/agent', window.location.origin);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }

    return response.json();
  }, []);

  // Create Agent
  const createAgent = useCallback(async (
    userId: string, 
    configType: string, 
    customConfig?: AgentConfig
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall('create_agent', {
        userId,
        configType,
        customConfig
      });

      if (result.success) {
        await refreshAgents(userId);
        return { success: true, agentId: result.agentId };
      } else {
        return { success: false, error: 'Failed to create agent' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall, refreshAgents]);

  // Delete Agent
  const deleteAgent = useCallback(async (agentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall('delete_agent', { agentId });
      
      if (result.success && result.deleted) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        return true;
      } else {
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Submit Task
  const submitTask = useCallback(async (taskRequest: Omit<TaskRequest, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall('submit_task', taskRequest);
      
      if (result.success) {
        return { success: true, taskId: result.taskId };
      } else {
        return { success: false, error: 'Failed to submit task' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Get Task Status
  const getTaskStatus = useCallback(async (taskId: string): Promise<TaskStatus | null> => {
    try {
      const result = await apiCall('get_task_status', { taskId });
      return result.status || null;
    } catch (err) {
      console.error('Failed to get task status:', err);
      return null;
    }
  }, [apiCall]);

  // Get Agent Status
  const getAgentStatus = useCallback(async (agentId: string): Promise<Agent | null> => {
    try {
      const result = await apiCall('get_agent_status', { agentId });
      return result.status || null;
    } catch (err) {
      console.error('Failed to get agent status:', err);
      return null;
    }
  }, [apiCall]);

  // Enable Learning
  const enableLearning = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const result = await apiCall('enable_learning', { agentId });
      return result.success;
    } catch (err) {
      console.error('Failed to enable learning:', err);
      return false;
    }
  }, [apiCall]);

  // Refresh Agents
  const refreshAgents = useCallback(async (userId: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiGet('agents', { userId });
      
      if (result.success) {
        setAgents(result.agents);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiGet]);

  // Load System Stats
  const loadSystemStats = useCallback(async () => {
    try {
      const result = await apiCall('get_system_stats');
      if (result.success) {
        setSystemStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load system stats:', err);
    }
  }, [apiCall]);

  // Load Health
  const loadHealth = useCallback(async () => {
    try {
      const result = await apiGet('health');
      if (result.success) {
        setHealth(result.health);
        setSystemStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load health:', err);
    }
  }, [apiGet]);

  // Auto-refresh agents when userId changes
  useEffect(() => {
    if (userId) {
      refreshAgents(userId);
    }
  }, [userId, refreshAgents]);

  // Load system stats on mount
  useEffect(() => {
    loadHealth();
    loadSystemStats();
  }, [loadHealth, loadSystemStats]);

  return {
    // Agent Management
    agents,
    loading,
    error,
    
    // Actions
    createAgent,
    deleteAgent,
    submitTask,
    getTaskStatus,
    getAgentStatus,
    enableLearning,
    
    // System
    refreshAgents,
    systemStats,
    health
  };
}

// Hook for managing a single agent
export function useSingleAgent(agentId: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAgentStatus } = useAgent();

  const refreshAgent = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    setError(null);

    try {
      const status = await getAgentStatus(agentId);
      setAgent(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [agentId, getAgentStatus]);

  useEffect(() => {
    refreshAgent();
  }, [refreshAgent]);

  return {
    agent,
    loading,
    error,
    refreshAgent
  };
}

// Hook for managing tasks
export function useAgentTask() {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { submitTask, getTaskStatus } = useAgent();

  const submitAndTrackTask = useCallback(async (
    taskRequest: Omit<TaskRequest, 'id'>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await submitTask(taskRequest);
      
      if (result.success && result.taskId) {
        // Poll for task completion
        const pollInterval = setInterval(async () => {
          const status = await getTaskStatus(result.taskId!);
          setTaskStatus(status);
          
          if (status && (status.status === 'completed' || status.status === 'failed')) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 1000);

        // Set a timeout to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval);
          setLoading(false);
          setError('Task timed out');
        }, 300000); // 5 minutes

        return { success: true, taskId: result.taskId };
      } else {
        setLoading(false);
        return { success: false, error: 'Failed to submit task' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [submitTask, getTaskStatus]);

  return {
    taskStatus,
    loading,
    error,
    submitAndTrackTask,
    clearTaskStatus: () => setTaskStatus(null)
  };
}