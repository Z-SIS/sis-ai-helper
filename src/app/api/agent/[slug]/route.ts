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
    console.log('Agent API called:', { params });
    
    // Open platform - no authentication required
    const userId = 'open-user';
    
    const { slug } = await params;
    const body = await request.json();
    
    console.log('Request details:', { slug, bodyKeys: Object.keys(body) });
    
    // Validate agent type
    const agentType = slug as AgentType;
    if (!AgentInputSchemas[agentType]) {
      console.error('Invalid agent type:', { agentType, available: Object.keys(AgentInputSchemas) });
      return NextResponse.json(
        { error: 'Invalid agent type', availableAgents: Object.keys(AgentInputSchemas) },
        { status: 400 }
      );
    }
    
    console.log('Agent type validated:', { agentType });
    
    // Validate input schema
    const inputSchema = AgentInputSchemas[agentType];
    const validatedInput = inputSchema.parse(body);
    
    console.log('Input validated:', { agentType, inputKeys: Object.keys(validatedInput) });
    
    // Execute agent request with optimized system
    console.log('Executing agent request...');
    const result = await optimizedAgentSystem.executeAgentRequest(agentType, validatedInput);
    
    console.log('Agent execution completed:', { agentType, hasResult: !!result });
    
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