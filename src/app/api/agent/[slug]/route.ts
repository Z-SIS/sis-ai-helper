import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  AgentInputSchemas, 
  AgentInput,
  AgentOutput
} from '@/shared/schemas';
import { 
  googleAIAgentSystem,
  handleAgentRequest
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
    const { slug } = await params;
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
    
    // Execute agent request with timeout to prevent connection resets
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - agent took too long to respond')), 30000);
    });
    
    const agentPromise = handleAgentRequest(agentType, validatedInput);
    
    const result = await Promise.race([agentPromise, timeoutPromise]) as AgentOutput;
    
    // Validate the result before proceeding
    if (!result || typeof result !== 'object') {
      throw new Error(`Invalid result from agent ${agentType}: result must be an object`);
    }
    
    // Extract the actual data from the agent result
    // AgentOutput structure: { title, content, summary, data }
    const actualData = (result as any).data || result;
    
    // Save to task history (optional for open platform)
    try {
      await db.createTaskHistory({
        user_id: 'open-user',
        agent_type: agentType,
        input_data: validatedInput,
        output_data: result,
        status: 'completed',
      });
    } catch (error) {
      // Log error but don't fail the request
      console.warn('Failed to save task history:', error);
      // Continue with the request - don't throw the error
    }
    
    // Return success response with token usage info
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
    
    return NextResponse.json({ 
      success: true, 
      data: actualData, // Return the actual data, not the wrapper
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
    
    // Handle timeout specifically
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Request timeout', 
          message: 'The agent took too long to respond. Please try again.',
          timestamp: new Date().toISOString(),
        },
        { status: 408 }
      );
    }
    
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
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
    
    return NextResponse.json({
      status: 'healthy',
      system: 'SIS AI Helper - Google AI Agent System',
      version: '2.1.0-google-only',
      agents: Object.keys(AgentInputSchemas),
      tokenUsage,
      cache: {
        size: tokenUsage.cacheStats?.size || 0,
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