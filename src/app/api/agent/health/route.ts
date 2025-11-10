import { NextResponse } from 'next/server';
import { googleAIAgentSystem } from '@/lib/ai/agent-system-fixed';

export async function GET() {
  try {
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
    
    return NextResponse.json({
      status: 'healthy',
      system: 'SIS AI Helper - Optimized Agent System',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      agents: {
        available: ['company-research', 'generate-sop', 'compose-email', 'excel-helper', 'feasibility-check', 'deployment-plan', 'usps-battlecard', 'disbandment-plan', 'slide-template'],
        count: 9,
      },
      performance: {
        tokenUsage,
        cache: {
          size: tokenUsage.cacheStats?.size ?? 0,
          status: 'active',
        },
      },
      features: {
        optimizedPrompts: true,
        tokenOptimization: true,
        caching: true,
        errorHandling: true,
        validation: true,
      },
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