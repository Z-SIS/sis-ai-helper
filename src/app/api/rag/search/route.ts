import { NextRequest, NextResponse } from 'next/server';
import { vectorSearch } from '@/lib/rag/retrieval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      user_id,
      match_count = 5,
      similarity_threshold = 0.7,
      filter_tags,
      include_company_research = true,
      company_match_count = 3,
      company_similarity_threshold = 0.6
    } = body;

    // Validate required fields
    if (!query || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: query, user_id' },
        { status: 400 }
      );
    }

    // Perform RAG search
    const result = await vectorSearch.generateRAGResponse(query, user_id, {
      match_count,
      similarity_threshold,
      filter_tags,
      include_company_research,
      company_match_count,
      company_similarity_threshold
    });

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in RAG search:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const userId = searchParams.get('user_id');

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: query, user_id' },
        { status: 400 }
      );
    }

    // Perform simple retrieval (without LLM generation)
    const retrievalResult = await vectorSearch.retrieve(query, userId, {
      match_count: parseInt(searchParams.get('match_count') || '5'),
      similarity_threshold: parseFloat(searchParams.get('similarity_threshold') || '0.7'),
      filter_tags: searchParams.get('filter_tags')?.split(','),
      include_company_research: searchParams.get('include_company_research') !== 'false'
    });

    return NextResponse.json({
      success: true,
      retrieval_result: retrievalResult
    });

  } catch (error) {
    console.error('Error in retrieval:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}