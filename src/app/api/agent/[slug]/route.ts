import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  AgentInputSchemas, 
  AgentInput,
  AgentOutput
} from '@/shared/schemas';
import { 
  optimizedAgentSystem,
  handleCompanyResearch,
  handleSopGeneration,
  handleEmailComposition,
  handleExcelHelper,
  handleFeasibilityCheck,
  handleDeploymentPlan,
  handleUspsBattlecard,
  handleDisbandmentPlan,
  handleSlideTemplate
} from '@/lib/ai/agent-system';
import { db } from '@/lib/supabase';

// Define AgentType locally to avoid circular dependencies
type AgentType = keyof typeof AgentInputSchemas;

// ============================================================================
// OPTIMIZED API HANDLER
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Open platform - no authentication required
    const userId = 'open-user';
    
    const { slug } = params;
    const body = await request.json();
    
    // Validate agent type
    const agentType = slug as AgentType;
    if (!AgentInputSchemas[agentType]) {
      return NextResponse.json(
        { error: 'Invalid agent type', availableAgents: Object.keys(AgentInputSchemas) },
        { status: 400 }
      );
    }
    
    // Validate input schema
    const inputSchema = AgentInputSchemas[agentType];
    const validatedInput = inputSchema.parse(body);
    
    // Execute agent request with optimized system
    const result = await optimizedAgentSystem.executeAgentRequest(agentType, validatedInput);
    
    // Save to task history (optional for open platform)
    try {
      await db.createTaskHistory({
        user_id: userId,
        agent_type: agentType,
        input_data: validatedInput,
        output_data: result,
        status: 'completed',
      });
    } catch (error) {
      // Log error but don't fail the request
      console.warn('Failed to save task history:', error);
    }
    
    // Return success response with token usage info
    const tokenUsage = optimizedAgentSystem.getTokenUsage();
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      meta: {
        agentType,
        tokenUsage: {
          total: tokenUsage.total,
          byAgent: tokenUsage.byAgent[agentType] || 0,
        },
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Agent API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

export async function GET() {
  try {
    const tokenUsage = optimizedAgentSystem.getTokenUsage();
    
    return NextResponse.json({
      status: 'healthy',
      system: 'SIS AI Helper - Optimized Agent System',
      version: '2.0.0',
      agents: Object.keys(AgentInputSchemas),
      tokenUsage,
      cache: {
        size: tokenUsage.cacheSize,
        status: 'active',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}