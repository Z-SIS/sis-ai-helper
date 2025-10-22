import { NextRequest, NextResponse } from 'next/server';
import { knowledgeIngestion, FileProcessor } from '@/lib/rag/ingestion';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const tags = formData.get('tags') as string;
    const sourceUrl = formData.get('source_url') as string;
    const userId = formData.get('user_id') as string;

    // Validate required fields
    if (!file || !title || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, user_id' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = FileProcessor.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process file
    const { content, metadata } = await FileProcessor.processFile(file);

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Ingest document
    const documentId = await knowledgeIngestion.ingestDocument(content, {
      title: title || metadata.title,
      source_url: sourceUrl,
      file_type: metadata.file_type,
      file_size: metadata.file_size,
      tags: parsedTags,
      created_by: userId
    });

    return NextResponse.json({
      success: true,
      document_id: documentId,
      message: 'Document uploaded and processing started'
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}