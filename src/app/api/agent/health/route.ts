import { NextResponse } from 'next/server';
import { optimizedAgentSystem } from '@/lib/ai/agent-system';

export async function GET() {
  try {
    const tokenUsage = optimizedAgentSystem.getTokenUsage();
    
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
          size: tokenUsage.cacheSize,
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