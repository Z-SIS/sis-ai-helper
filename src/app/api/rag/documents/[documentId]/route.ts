import { NextRequest, NextResponse } from 'next/server';
import { knowledgeIngestion } from '@/lib/rag/ingestion';
import { vectorSearch } from '@/lib/rag/retrieval';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    // Get processing status
    const status = await knowledgeIngestion.getProcessingStatus(params.documentId);

    return NextResponse.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error getting document status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get document status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const body = await request.json();
    const { user_id, title, tags } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }

    // Update document
    const success = await knowledgeIngestion.updateDocument(
      params.documentId,
      user_id,
      { title, tags }
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    // Delete document
    const success = await knowledgeIngestion.deleteDocument(
      params.documentId,
      userId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}