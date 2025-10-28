import { supabase, supabaseAdmin } from '@/lib/supabase';
import ZAI from 'z-ai-web-dev-sdk';

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
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not configured');
      }

      // 1. Create document record
      const { data: document, error: docError } = await supabaseAdmin
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

      if (docError) {
        console.error('Error creating document:', docError);
        throw docError;
      }

      // 2. Add to processing queue
      const { error: queueError } = await supabaseAdmin
        .from('document_processing_queue')
        .insert({
          document_id: document.id,
          status: 'processing',
          processing_started_at: new Date().toISOString()
        });

      if (queueError) {
        console.error('Error creating queue entry:', queueError);
        throw queueError;
      }

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
          documentTitle: metadata.title,
          documentTags: metadata.tags,
          sourceUrl: metadata.source_url
        }
      }));

      const { error: chunkError } = await supabaseAdmin
        .from('knowledge_chunks')
        .insert(chunkData);

      if (chunkError) {
        console.error('Error inserting chunks:', chunkError);
        throw chunkError;
      }

      // 4. Update processing queue
      const { error: updateError } = await supabaseAdmin
        .from('document_processing_queue')
        .update({
          status: 'completed',
          processing_completed_at: new Date().toISOString()
        })
        .eq('document_id', documentId);

      if (updateError) {
        console.error('Error updating processing queue:', updateError);
        throw updateError;
      }

      console.log(`Successfully processed document: ${documentId}`);
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update processing queue with error
      const { error: errorUpdate } = await supabaseAdmin
        .from('document_processing_queue')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('document_id', documentId);

      if (errorUpdate) {
        console.error('Error updating processing queue with error:', errorUpdate);
      }
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
            const zai = await ZAI.create();
            const response = await zai.embeddings.create({
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
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not configured');
      }

      // Generate embedding for company search
      const searchText = `${companyData.company_name} ${companyData.description || ''} ${companyData.industry || ''}`;
      const zai = await ZAI.create();
      const embeddingResponse = await zai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: searchText
      });

      const { data: company, error: companyError } = await supabaseAdmin
        .from('company_research_cache')
        .insert({
          company_name: companyData.company_name,
          industry: companyData.industry,
          location: companyData.location,
          description: companyData.description,
          website: companyData.website,
          founded_year: companyData.founded_year,
          employee_count: companyData.employee_count,
          revenue: companyData.revenue,
          key_executives: companyData.key_executives,
          competitors: companyData.competitors,
          recent_news: companyData.recent_news,
          research_data: companyData.research_data,
          company_embedding: embeddingResponse.data[0].embedding
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company research:', companyError);
        throw companyError;
      }

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
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Document not found in processing queue');
      }
      throw error;
    }

    return {
      status: data.status as any,
      error_message: data.error_message || undefined,
      processing_started_at: data.processing_started_at || undefined,
      processing_completed_at: data.processing_completed_at || undefined
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
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      let query = supabase
        .from('knowledge_documents')
        .select('*', { count: 'exact' })
        .eq('created_by', userId);

      // Apply filters
      if (options.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(
          options.offset || 0,
          (options.offset || 0) + (options.limit || 10) - 1
        );

      const { data: documents, error, count } = await query;

      if (error) {
        console.error('Error listing documents:', error);
        throw error;
      }

      return {
        documents: documents || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error in listDocuments:', error);
      throw error;
    }
  }

  /**
   * Delete a document and all its chunks
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not configured');
      }

      // Verify ownership
      const { data: document, error: fetchError } = await supabaseAdmin
        .from('knowledge_documents')
        .select('created_by')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error('Document not found or access denied');
      }

      if (document.created_by !== userId) {
        throw new Error('Document not found or access denied');
      }

      // Delete document (chunks will be deleted via CASCADE)
      const { error: deleteError } = await supabaseAdmin
        .from('knowledge_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error('Error deleting document:', deleteError);
        throw deleteError;
      }

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
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not configured');
      }

      // Verify ownership
      const { data: document, error: fetchError } = await supabaseAdmin
        .from('knowledge_documents')
        .select('created_by')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error('Document not found or access denied');
      }

      if (document.created_by !== userId) {
        throw new Error('Document not found or access denied');
      }

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.tags) updateData.tags = updates.tags;

      const { error: updateError } = await supabaseAdmin
        .from('knowledge_documents')
        .update(updateData)
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document:', updateError);
        throw updateError;
      }

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
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      // Use the RPC function for efficient stats calculation
      const { data, error } = await supabase
        .rpc('get_knowledge_base_stats', {
          user_id_param: userId || null
        });

      if (error) {
        console.error('Error getting knowledge base stats:', error);
        throw error;
      }

      return data || {
        total_documents: 0,
        total_chunks: 0,
        total_size_bytes: 0,
        avg_chunks_per_document: 0,
        most_common_tags: [],
        recent_uploads: []
      };
    } catch (error) {
      console.error('Error in getKnowledgeBaseStats:', error);
      return {
        total_documents: 0,
        total_chunks: 0,
        total_size_bytes: 0,
        avg_chunks_per_document: 0,
        most_common_tags: [],
        recent_uploads: []
      };
    }
  }

  /**
   * Clean up old usage logs
   */
  async cleanupOldUsageLogs(daysToKeep: number = 90): Promise<number> {
    if (!supabaseAdmin) {
      console.warn('Supabase admin client not configured');
      return 0;
    }

    try {
      const { data, error } = await supabaseAdmin
        .rpc('cleanup_old_usage_logs', {
          days_to_keep: daysToKeep
        });

      if (error) {
        console.error('Error cleaning up old usage logs:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in cleanupOldUsageLogs:', error);
      return 0;
    }
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