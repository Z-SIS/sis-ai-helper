import { db } from '@/lib/db';
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
      // 1. Create document record
      const document = await db.knowledgeDocument.create({
        data: {
          title: metadata.title,
          sourceUrl: metadata.source_url,
          content,
          fileType: metadata.file_type,
          fileSize: metadata.file_size,
          tags: metadata.tags ? JSON.stringify(metadata.tags) : null,
          createdBy: metadata.created_by
        }
      });

      // 2. Add to processing queue
      await db.documentProcessingQueue.create({
        data: {
          documentId: document.id,
          status: 'processing',
          processingStartedAt: new Date()
        }
      });

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
        documentId: documentId,
        chunkIndex: index,
        chunkText: chunk.text,
        embedding: JSON.stringify(embeddings[index]),
        metadata: JSON.stringify({
          ...chunk.metadata,
          documentTitle: metadata.title,
          documentTags: metadata.tags,
          sourceUrl: metadata.source_url
        })
      }));

      await db.knowledgeChunk.createMany({
        data: chunkData
      });

      // 4. Update processing queue
      await db.documentProcessingQueue.update({
        where: { documentId: documentId },
        data: {
          status: 'completed',
          processingCompletedAt: new Date()
        }
      });

      console.log(`Successfully processed document: ${documentId}`);
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update processing queue with error
      await db.documentProcessingQueue.update({
        where: { documentId: documentId },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
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
      // Generate embedding for company search
      const searchText = `${companyData.company_name} ${companyData.description || ''} ${companyData.industry || ''}`;
      const zai = await ZAI.create();
      const embeddingResponse = await zai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: searchText
      });

      const company = await db.companyResearchCache.create({
        data: {
          companyName: companyData.company_name,
          industry: companyData.industry,
          location: companyData.location,
          description: companyData.description,
          website: companyData.website,
          foundedYear: companyData.founded_year,
          employeeCount: companyData.employee_count,
          revenue: companyData.revenue,
          keyExecutives: companyData.key_executives ? JSON.stringify(companyData.key_executives) : null,
          competitors: companyData.competitors ? JSON.stringify(companyData.competitors) : null,
          recentNews: companyData.recent_news ? JSON.stringify(companyData.recent_news) : null,
          researchData: JSON.stringify(companyData.research_data),
          companyEmbedding: JSON.stringify(embeddingResponse.data[0].embedding)
        }
      });

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
    processing_started_at?: Date;
    processing_completed_at?: Date;
  }> {
    const data = await db.documentProcessingQueue.findUnique({
      where: { documentId: documentId }
    });

    if (!data) {
      throw new Error('Document not found in processing queue');
    }

    return {
      status: data.status as any,
      error_message: data.errorMessage || undefined,
      processing_started_at: data.processingStartedAt || undefined,
      processing_completed_at: data.processingCompletedAt || undefined
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
    const where: any = {
      createdBy: userId
    };

    // Apply filters
    if (options.tags && options.tags.length > 0) {
      where.tags = {
        contains: JSON.stringify(options.tags)
      };
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search } },
        { content: { contains: options.search } }
      ];
    }

    // Get total count
    const total = await db.knowledgeDocument.count({ where });

    // Get documents with pagination
    const documents = await db.knowledgeDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 10,
      skip: options.offset || 0
    });

    return {
      documents: documents.map(doc => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : []
      })),
      total
    };
  }

  /**
   * Delete a document and all its chunks
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      // Verify ownership
      const document = await db.knowledgeDocument.findUnique({
        where: { id: documentId },
        select: { createdBy: true }
      });

      if (!document || document.createdBy !== userId) {
        throw new Error('Document not found or access denied');
      }

      // Delete document (chunks will be deleted via CASCADE)
      await db.knowledgeDocument.delete({
        where: { id: documentId }
      });

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
      const document = await db.knowledgeDocument.findUnique({
        where: { id: documentId },
        select: { createdBy: true }
      });

      if (!document || document.createdBy !== userId) {
        throw new Error('Document not found or access denied');
      }

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.tags) updateData.tags = JSON.stringify(updates.tags);

      await db.knowledgeDocument.update({
        where: { id: documentId },
        data: updateData
      });

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
    const where = userId ? { createdBy: userId } : {};

    const [documentCount, chunkCount, processingCount] = await Promise.all([
      db.knowledgeDocument.count({ where }),
      db.knowledgeChunk.count({
        where: {
          document: { createdBy: userId }
        }
      }),
      db.documentProcessingQueue.count({
        where: {
          document: { createdBy: userId },
          status: 'processing'
        }
      })
    ]);

    return {
      total_documents: documentCount,
      total_chunks: chunkCount,
      processing_documents: processingCount
    };
  }

  /**
   * Clean up old usage logs
   */
  async cleanupOldUsageLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db.knowledgeUsage.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
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