import { NextRequest, NextResponse } from 'next/server';
import { knowledgeIngestion } from '@/lib/rag/ingestion';
import { vectorSearch } from '@/lib/rag/retrieval';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    // List documents
    const result = await knowledgeIngestion.listDocuments(userId, {
      limit,
      offset,
      tags,
      search
    });

    return NextResponse.json({
      success: true,
      documents: result.documents,
      total: result.total
    });

  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      title,
      source_url,
      file_type = 'text',
      tags,
      user_id
    } = body;

    // Validate required fields
    if (!content || !title || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: content, title, user_id' },
        { status: 400 }
      );
    }

    // Ingest document
    const documentId = await knowledgeIngestion.ingestDocument(content, {
      title,
      source_url,
      file_type,
      tags: tags || [],
      created_by: user_id
    });

    return NextResponse.json({
      success: true,
      document_id: documentId,
      message: 'Document created and processing started'
    });

  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}