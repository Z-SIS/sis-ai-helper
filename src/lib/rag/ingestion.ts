import { createClient } from '@supabase/supabase-js';
import ZAI from 'z-ai-web-dev-sdk';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ZAI client
const zai = new ZAI();

// Chunking configuration
const CHUNK_SIZE = 500; // tokens per chunk
const CHUNK_OVERLAP = 50; // tokens overlap between chunks

export interface DocumentMetadata {
  title: string;
  source_url?: string;
  file_type: string;
  file_size?: number;
  tags?: string[];
  created_by: string;
}

export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  chunks: Array<{
    text: string;
    embedding: number[];
    metadata: any;
  }>;
  metadata: DocumentMetadata;
}

export class KnowledgeBaseIngestion {
  private zai: ZAI;

  constructor() {
    this.zai = new ZAI();
  }

  /**
   * Process and ingest a document into the knowledge base
   */
  async ingestDocument(
    content: string,
    metadata: DocumentMetadata
  ): Promise<string> {
    try {
      // 1. Create document record
      const { data: document, error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
          title: metadata.title,
          source_url: metadata.source_url,
          content,
          file_type: metadata.file_type,
          file_size: metadata.file_size,
          tags: metadata.tags || [],
          created_by: metadata.created_by
        })
        .select()
        .single();

      if (docError) throw docError;

      // 2. Add to processing queue
      const { error: queueError } = await supabase
        .from('document_processing_queue')
        .insert({
          document_id: document.id,
          status: 'processing',
          processing_started_at: new Date().toISOString()
        });

      if (queueError) throw queueError;

      // 3. Process document in background
      this.processDocumentAsync(document.id, content, metadata);

      return document.id;
    } catch (error) {
      console.error('Error ingesting document:', error);
      throw error;
    }
  }

  /**
   * Process document asynchronously (chunking and embedding)
   */
  private async processDocumentAsync(
    documentId: string,
    content: string,
    metadata: DocumentMetadata
  ): Promise<void> {
    try {
      // 1. Chunk the content
      const chunks = await this.chunkContent(content);

      // 2. Generate embeddings for chunks
      const chunkTexts = chunks.map(chunk => chunk.text);
      const embeddings = await this.generateEmbeddings(chunkTexts);

      // 3. Store chunks with embeddings
      const chunkData = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: index,
        chunk_text: chunk.text,
        embedding: embeddings[index],
        metadata: {
          ...chunk.metadata,
          document_title: metadata.title,
          document_tags: metadata.tags,
          source_url: metadata.source_url
        }
      }));

      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert(chunkData);

      if (chunkError) throw chunkError;

      // 4. Update processing queue
      await supabase
        .from('document_processing_queue')
        .update({
          status: 'completed',
          processing_completed_at: new Date().toISOString()
        })
        .eq('document_id', documentId);

      console.log(`Successfully processed document: ${documentId}`);
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update processing queue with error
      await supabase
        .from('document_processing_queue')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('document_id', documentId);
    }
  }

  /**
   * Split content into chunks using semantic chunking
   */
  private async chunkContent(content: string): Promise<Array<{
    text: string;
    metadata: any;
  }>> {
    // Simple text-based chunking (can be enhanced with semantic chunking)
    const words = content.split(/\s+/);
    const chunks: Array<{ text: string; metadata: any }> = [];
    
    for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      const chunkWords = words.slice(i, i + CHUNK_SIZE);
      const chunkText = chunkWords.join(' ');
      
      if (chunkText.trim()) {
        chunks.push({
          text: chunkText.trim(),
          metadata: {
            chunk_index: Math.floor(i / (CHUNK_SIZE - CHUNK_OVERLAP)),
            word_count: chunkWords.length,
            char_count: chunkText.length
          }
        });
      }
    }

    return chunks;
  }

  /**
   * Generate embeddings for text chunks
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];
      
      // Process in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        for (const text of batch) {
          try {
            const response = await this.zai.embeddings.create({
              model: 'text-embedding-ada-002',
              input: text
            });
            
            embeddings.push(response.data[0].embedding);
          } catch (error) {
            console.error('Error generating embedding for chunk:', error);
            // Use zero vector as fallback
            embeddings.push(new Array(1536).fill(0));
          }
        }
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Ingest company research with embedding
   */
  async ingestCompanyResearch(companyData: {
    company_name: string;
    industry?: string;
    location?: string;
    description?: string;
    website?: string;
    founded_year?: number;
    employee_count?: string;
    revenue?: string;
    key_executives?: any[];
    competitors?: any[];
    recent_news?: any[];
    research_data: any;
  }): Promise<string> {
    try {
      // Generate embedding for company search
      const searchText = `${companyData.company_name} ${companyData.description || ''} ${companyData.industry || ''}`;
      const embeddingResponse = await this.zai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: searchText
      });

      const { data: company, error } = await supabase
        .from('company_research_cache')
        .insert({
          ...companyData,
          company_embedding: embeddingResponse.data[0].embedding
        })
        .select()
        .single();

      if (error) throw error;

      return company.id;
    } catch (error) {
      console.error('Error ingesting company research:', error);
      throw error;
    }
  }

  /**
   * Get processing status for a document
   */
  async getProcessingStatus(documentId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message?: string;
    processing_started_at?: string;
    processing_completed_at?: string;
  }> {
    const { data, error } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) throw error;

    return {
      status: data.status,
      error_message: data.error_message,
      processing_started_at: data.processing_started_at,
      processing_completed_at: data.processing_completed_at
    };
  }

  /**
   * List documents for a user
   */
  async listDocuments(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      tags?: string[];
      search?: string;
    } = {}
  ): Promise<{
    documents: any[];
    total: number;
  }> {
    let query = supabase
      .from('knowledge_documents')
      .select('*', { count: 'exact' })
      .eq('created_by', userId);

    // Apply filters
    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    if (options.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      documents: data || [],
      total: count || 0
    };
  }

  /**
   * Delete a document and all its chunks
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      // Verify ownership
      const { data: document } = await supabase
        .from('knowledge_documents')
        .select('created_by')
        .eq('id', documentId)
        .single();

      if (!document || document.created_by !== userId) {
        throw new Error('Document not found or access denied');
      }

      // Delete document (chunks will be deleted via CASCADE)
      const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updates: {
      title?: string;
      tags?: string[];
    }
  ): Promise<boolean> {
    try {
      // Verify ownership
      const { data: document } = await supabase
        .from('knowledge_documents')
        .select('created_by')
        .eq('id', documentId)
        .single();

      if (!document || document.created_by !== userId) {
        throw new Error('Document not found or access denied');
      }

      const { error } = await supabase
        .from('knowledge_documents')
        .update(updates)
        .eq('id', documentId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }

  /**
   * Get knowledge base statistics
   */
  async getKnowledgeBaseStats(userId?: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_knowledge_base_stats', {
        user_id_param: userId || null
      });

    if (error) throw error;

    return data;
  }

  /**
   * Clean up old usage logs
   */
  async cleanupOldUsageLogs(daysToKeep: number = 90): Promise<number> {
    const { data, error } = await supabase
      .rpc('cleanup_old_usage_logs', {
        days_to_keep: daysToKeep
      });

    if (error) throw error;

    return data || 0;
  }
}

// Export singleton instance
export const knowledgeIngestion = new KnowledgeBaseIngestion();

// Utility functions for file processing
export class FileProcessor {
  /**
   * Process uploaded file and extract text
   */
  static async processFile(file: File): Promise<{
    content: string;
    metadata: {
      title: string;
      file_type: string;
      file_size: number;
    };
  }> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'txt':
        return {
          content: await file.text(),
          metadata: {
            title: file.name.replace('.txt', ''),
            file_type: 'txt',
            file_size: file.size
          }
        };
      
      case 'md':
        return {
          content: await file.text(),
          metadata: {
            title: file.name.replace('.md', ''),
            file_type: 'md',
            file_size: file.size
          }
        };
      
      case 'pdf':
        // For PDF processing, you'd need a PDF parsing library
        // For now, return a placeholder
        return {
          content: `PDF content extraction not implemented yet. File: ${file.name}`,
          metadata: {
            title: file.name.replace('.pdf', ''),
            file_type: 'pdf',
            file_size: file.size
          }
        };
      
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  /**
   * Validate file before processing
   */
  static validateFile(file: File): {
    isValid: boolean;
    error?: string;
  } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = ['txt', 'md', 'pdf'];
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Supported file types: ${supportedTypes.join(', ')}`
      };
    }
    
    return { isValid: true };
  }
}