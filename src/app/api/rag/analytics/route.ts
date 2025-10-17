import { NextRequest, NextResponse } from 'next/server';
import { knowledgeIngestion } from '@/lib/rag/ingestion';
import { vectorSearch } from '@/lib/rag/retrieval';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'stats' or 'usage'

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'stats':
        // Get knowledge base statistics
        result = await knowledgeIngestion.getKnowledgeBaseStats(userId);
        break;

      case 'usage':
        // Get usage analytics
        const days = parseInt(searchParams.get('days') || '30');
        const limit = parseInt(searchParams.get('limit') || '100');
        result = await vectorSearch.getUsageAnalytics(userId, { days, limit });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use "stats" or "usage"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'cleanup':
        // Clean up old usage logs
        const daysToKeep = body.days_to_keep || 90;
        result = await knowledgeIngestion.cleanupOldUsageLogs(daysToKeep);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in analytics action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform analytics action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}