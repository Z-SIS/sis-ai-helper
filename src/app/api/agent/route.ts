import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator, AgentFactory, PRESET_AGENT_CONFIGS } from '@/lib/agent';

// Global orchestrator instance
let orchestrator: AgentOrchestrator | null = null;

async function getOrchestrator(): Promise<AgentOrchestrator> {
  if (!orchestrator) {
    orchestrator = await AgentFactory.createOrchestrator();
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const orch = await getOrchestrator();

    switch (action) {
      case 'create_agent': {
        const { userId, configType, customConfig } = data;
        
        let config;
        if (customConfig) {
          config = customConfig;
        } else if (configType && PRESET_AGENT_CONFIGS[configType as keyof typeof PRESET_AGENT_CONFIGS]) {
          config = PRESET_AGENT_CONFIGS[configType as keyof typeof PRESET_AGENT_CONFIGS];
        } else {
          return NextResponse.json(
            { error: 'Invalid configuration. Provide either configType or customConfig' },
            { status: 400 }
          );
        }

        const agent = await orch.createAgent({
          ...config,
          userId,
          id: `${config.id}-${userId}-${Date.now()}`
        });

        return NextResponse.json({
          success: true,
          agentId: agent.getState().id,
          agent: agent.getState()
        });
      }

      case 'submit_task': {
        const { userId, agentId, task, context, priority = 'medium' } = data;
        
        const taskRequest = {
          id: crypto.randomUUID(),
          userId,
          agentId,
          task,
          context,
          priority,
          metadata: {
            submittedAt: new Date().toISOString()
          }
        };

        const taskId = await orch.submitTask(taskRequest);
        
        return NextResponse.json({
          success: true,
          taskId,
          status: 'submitted'
        });
      }

      case 'get_task_status': {
        const { taskId } = data;
        const status = await orch.getTaskStatus(taskId);
        
        return NextResponse.json({
          success: true,
          status
        });
      }

      case 'get_agent_status': {
        const { agentId } = data;
        const status = await orch.getAgentStatus(agentId);
        
        return NextResponse.json({
          success: true,
          status
        });
      }

      case 'list_agents': {
        const { userId } = data;
        const agents = await orch.listAgents(userId);
        
        return NextResponse.json({
          success: true,
          agents: agents.map(agent => agent.getState())
        });
      }

      case 'delete_agent': {
        const { agentId } = data;
        const deleted = await orch.deleteAgent(agentId);
        
        return NextResponse.json({
          success: deleted,
          deleted
        });
      }

      case 'enable_learning': {
        const { agentId } = data;
        await orch.enableAgentLearning(agentId);
        
        return NextResponse.json({
          success: true,
          message: 'Learning enabled for agent'
        });
      }

      case 'get_system_stats': {
        const stats = await orch.getSystemStats();
        
        return NextResponse.json({
          success: true,
          stats
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Agent API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const orch = await getOrchestrator();

    switch (action) {
      case 'health': {
        const { AgentSystemMonitor } = await import('@/lib/agent');
        const health = await AgentSystemMonitor.getSystemHealth();
        const stats = await orch.getSystemStats();
        
        return NextResponse.json({
          success: true,
          health,
          stats
        });
      }

      case 'presets': {
        return NextResponse.json({
          success: true,
          presets: Object.keys(PRESET_AGENT_CONFIGS).map(key => ({
            key,
            ...PRESET_AGENT_CONFIGS[key as keyof typeof PRESET_AGENT_CONFIGS]
          }))
        });
      }

      case 'agents': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required' },
            { status: 400 }
          );
        }

        const agents = await orch.listAgents(userId);
        const agentStatuses = await Promise.all(
          agents.map(async (agent) => {
            const status = await orch.getAgentStatus(agent.getState().id);
            return {
              ...agent.getState(),
              status
            };
          })
        );
        
        return NextResponse.json({
          success: true,
          agents: agentStatuses
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Agent API GET Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}