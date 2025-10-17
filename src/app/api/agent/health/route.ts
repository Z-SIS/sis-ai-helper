import { NextResponse } from 'next/server';
import { googleAIAgentSystem } from '@/lib/ai/agent-system';
import { AgentInputSchemas } from '@/shared/schemas';

export async function GET() {
  try {
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
    
    return NextResponse.json({
      status: 'healthy',
<<<<<<< HEAD
      system: 'SSS AI Helper - Google AI Agent System',
=======
      system: 'SIS AI Helper - Google AI Agent System',
>>>>>>> a2e2a6c76f13a7d105f2a332da938e23d0affaaf
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