import { db } from '@/lib/db';
import { getZAI, getZAISync } from '@/lib/ai/zai-compat';

// Initialize ZAI client (will be created on first use)
let zai = getZAISync();

async function ensureZAI() {
  if (!zai) {
    zai = await getZAI();
  }
  return zai;
}

export interface RetrievalOptions {
  match_count?: number;
  similarity_threshold?: number;
  filter_tags?: string[];
  filter_created_by?: string;
  include_company_research?: boolean;
  company_match_count?: number;
  company_similarity_threshold?: number;
}

export interface RetrievalResult {
  knowledge_chunks: Array<{
    id: string;
    document_id: string;
    chunk_text: string;
    similarity: number;
    metadata: any;
    document_title: string;
    document_tags: string[];
  }>;
  company_research: Array<{
    id: string;
    company_name: string;
    description: string;
    industry: string;
    similarity: number;
    research_data: any;
  }>;
  query_embedding: number[];
  total_retrieved: number;
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    type: 'knowledge' | 'company';
    id: string;
    title: string;
    content: string;
    similarity: number;
    metadata: any;
  }>;
  context: string;
  query: string;
  response_time_ms: number;
  usage_id: string;
}

export class VectorSearchRetrieval {
  private zai: any;

  constructor() {
    this.zai = getZAISync();
  }

  /**
   * Generate embedding for a query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const zai = await getZAI();
      const client = await ensureZAI();
      const response = await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw error;
    }
  }

  /**
   * Search knowledge base and company research
   */
  async retrieve(
    query: string,
    userId: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievalResult> {
    const startTime = Date.now();

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // 2. Search knowledge chunks
      const knowledgeChunks = await this.searchKnowledgeChunks(
        queryEmbedding,
        {
          match_count: options.match_count || 5,
          similarity_threshold: options.similarity_threshold || 0.7,
          filter_tags: options.filter_tags,
          filter_created_by: options.filter_created_by || userId
        }
      );

      // 3. Search company research (if enabled)
      let companyResearch: any[] = [];
      if (options.include_company_research !== false) {
        companyResearch = await this.searchCompanyResearch(
          queryEmbedding,
          {
            match_count: options.company_match_count || 3,
            similarity_threshold: options.company_similarity_threshold || 0.6
          }
        );
      }

      const responseTime = Date.now() - startTime;

      return {
        knowledge_chunks: knowledgeChunks,
        company_research: companyResearch,
        query_embedding: queryEmbedding,
        total_retrieved: knowledgeChunks.length + companyResearch.length
      };

    } catch (error) {
      console.error('Error in retrieval:', error);
      throw error;
    }
  }

  /**
   * Search knowledge chunks using vector similarity
   */
  private async searchKnowledgeChunks(
    queryEmbedding: number[],
    options: {
      match_count: number;
      similarity_threshold: number;
      filter_tags?: string[];
      filter_created_by?: string;
    }
  ): Promise<any[]> {
    try {
      // Get all chunks for the user with their documents
      const chunks = await db.knowledgeChunk.findMany({
        where: {
          document: {
            createdBy: options.filter_created_by || undefined
          }
        },
        include: {
          document: {
            select: {
              title: true,
              tags: true
            }
          }
        },
        take: options.match_count * 2 // Get more to filter by similarity
      });

      // Calculate similarity and filter
      const results = chunks
        .map(chunk => {
          const embedding = JSON.parse(chunk.embedding);
          const similarity = this.calculateCosineSimilarity(queryEmbedding, embedding);
          
          return {
            id: chunk.id,
            document_id: chunk.documentId,
            chunk_text: chunk.chunkText,
            similarity,
            metadata: chunk.metadata ? JSON.parse(chunk.metadata) : {},
            document_title: chunk.document.title,
            document_tags: chunk.document.tags ? JSON.parse(chunk.document.tags) : []
          };
        })
        .filter(chunk => chunk.similarity >= options.similarity_threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.match_count);

      return results;
    } catch (error) {
      console.error('Error searching knowledge chunks:', error);
      return [];
    }
  }

  /**
   * Search company research using vector similarity
   */
  private async searchCompanyResearch(
    queryEmbedding: number[],
    options: {
      match_count: number;
      similarity_threshold: number;
    }
  ): Promise<any[]> {
    try {
      const companies = await db.companyResearchCache.findMany({
        take: options.match_count * 2
      });

      // Calculate similarity and filter
      const results = companies
        .map(company => {
          if (!company.companyEmbedding) return null;
          
          const embedding = JSON.parse(company.companyEmbedding);
          const similarity = this.calculateCosineSimilarity(queryEmbedding, embedding);
          
          return {
            id: company.id,
            company_name: company.companyName,
            description: company.description || '',
            industry: company.industry || '',
            similarity,
            research_data: company.researchData ? JSON.parse(company.researchData) : {}
          };
        })
        .filter((company): company is NonNullable<typeof company> => 
          company !== null && company.similarity >= options.similarity_threshold
        )
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.match_count);

      return results;
    } catch (error) {
      console.error('Error searching company research:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generate RAG response using retrieved context
   */
  async generateRAGResponse(
    query: string,
    userId: string,
    options: RetrievalOptions = {}
  ): Promise<RAGResponse> {
    const startTime = Date.now();

    try {
      // 1. Retrieve relevant documents
      const retrievalResult = await this.retrieve(query, userId, options);

      // 2. Build context from retrieved documents
      const context = this.buildContext(retrievalResult);

      // 3. Generate response using LLM
      const answer = await this.generateResponse(query, context);

      // 4. Format sources
      const sources = this.formatSources(retrievalResult);

      const responseTime = Date.now() - startTime;

      // 5. Log usage
      const usageId = await this.logUsage(userId, query, retrievalResult, answer, responseTime);

      return {
        answer,
        sources,
        context,
        query,
        response_time_ms: responseTime,
        usage_id: usageId
      };

    } catch (error) {
      console.error('Error generating RAG response:', error);
      throw error;
    }
  }

  /**
   * Build context string from retrieved documents
   */
  private buildContext(retrievalResult: RetrievalResult): string {
    const contextParts: string[] = [];

    // Add knowledge chunks
    if (retrievalResult.knowledge_chunks.length > 0) {
      contextParts.push('Knowledge Base:');
      retrievalResult.knowledge_chunks.forEach((chunk, index) => {
        contextParts.push(`[${index + 1}] ${chunk.chunk_text} (Source: ${chunk.document_title})`);
      });
    }

    // Add company research
    if (retrievalResult.company_research.length > 0) {
      contextParts.push('\nCompany Research:');
      retrievalResult.company_research.forEach((company, index) => {
        contextParts.push(`[${index + 1}] ${company.company_name}: ${company.description}`);
      });
    }

    return contextParts.join('\n\n');
  }

  /**
   * Generate response using LLM with context
   */
  private async generateResponse(query: string, context: string): Promise<string> {
    try {
      const zai = await getZAI();
      const prompt = `
You are an AI assistant with access to a knowledge base. Please answer the user's question based on the provided context.

Context:
${context}

User Question: ${query}

Instructions:
1. Use the provided context to answer the question
2. If the context doesn't contain enough information, clearly state that
3. Provide a comprehensive and helpful response
4. Cite the sources when using specific information
5. Maintain a professional and helpful tone

Response:`;

      const client = await ensureZAI();
      const response = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant with access to a knowledge base. Provide accurate, well-sourced responses based on the given context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error while processing your request.';
    }
  }

  /**
   * Format sources for response
   */
  private formatSources(retrievalResult: RetrievalResult): Array<{
    type: 'knowledge' | 'company';
    id: string;
    title: string;
    content: string;
    similarity: number;
    metadata: any;
  }> {
    const sources: any[] = [];

    // Add knowledge sources
    retrievalResult.knowledge_chunks.forEach(chunk => {
      sources.push({
        type: 'knowledge' as const,
        id: chunk.id,
        title: chunk.document_title,
        content: chunk.chunk_text,
        similarity: chunk.similarity,
        metadata: {
          document_id: chunk.document_id,
          tags: chunk.document_tags,
          ...chunk.metadata
        }
      });
    });

    // Add company research sources
    retrievalResult.company_research.forEach(company => {
      sources.push({
        type: 'company' as const,
        id: company.id,
        title: company.company_name,
        content: company.description || '',
        similarity: company.similarity,
        metadata: {
          industry: company.industry,
          research_data: company.research_data
        }
      });
    });

    // Sort by similarity
    return sources.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Log usage for analytics
   */
  private async logUsage(
    userId: string,
    query: string,
    retrievalResult: RetrievalResult,
    answer: string,
    responseTime: number
  ): Promise<string> {
    try {
      const usageId = crypto.randomUUID();

      await db.knowledgeUsage.create({
        data: {
          id: usageId,
          userId,
          query,
          retrievedChunks: JSON.stringify([
            ...retrievalResult.knowledge_chunks.map(c => c.id),
            ...retrievalResult.company_research.map(c => c.id)
          ]),
          response: answer,
          sources: JSON.stringify(this.formatSources(retrievalResult)),
          relevanceScore: this.calculateRelevanceScore(retrievalResult),
          responseTimeMs: responseTime
        }
      });

      return usageId;
    } catch (error) {
      console.error('Error logging usage:', error);
      return crypto.randomUUID(); // Return fallback ID
    }
  }

  /**
   * Calculate relevance score for analytics
   */
  private calculateRelevanceScore(retrievalResult: RetrievalResult): number {
    const allSimilarities = [
      ...retrievalResult.knowledge_chunks.map(c => c.similarity),
      ...retrievalResult.company_research.map(c => c.similarity)
    ];

    if (allSimilarities.length === 0) return 0;

    // Return average similarity
    return allSimilarities.reduce((sum, sim) => sum + sim, 0) / allSimilarities.length;
  }

  /**
   * Get similar documents
   */
  async getSimilarDocuments(
    documentId: string,
    userId: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      // Get the document chunks
      const chunks = await db.knowledgeChunk.findMany({
        where: { documentId: documentId },
        select: { embedding: true, chunkText: true },
        take: 1
      });

      if (!chunks || chunks.length === 0) {
        return [];
      }

      // Use the first chunk's embedding to find similar documents
      const embedding = JSON.parse(chunks[0].embedding);

      // Find similar chunks
      const allChunks = await db.knowledgeChunk.findMany({
        where: {
          document: {
            createdBy: userId
          },
          documentId: {
            not: documentId
          }
        },
        include: {
          document: {
            select: {
              title: true,
              tags: true
            }
          }
        },
        take: limit * 2
      });

      // Calculate similarities and group by document
      const documentSimilarities = new Map<string, { similarity: number; title: string; tags: string[] }>();

      allChunks.forEach(chunk => {
        const chunkEmbedding = JSON.parse(chunk.embedding);
        const similarity = this.calculateCosineSimilarity(embedding, chunkEmbedding);
        
        if (!documentSimilarities.has(chunk.documentId) || 
            documentSimilarities.get(chunk.documentId)!.similarity < similarity) {
          documentSimilarities.set(chunk.documentId, {
            similarity,
            title: chunk.document.title,
            tags: chunk.document.tags ? JSON.parse(chunk.document.tags) : []
          });
        }
      });

      // Sort by similarity and limit
      return Array.from(documentSimilarities.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting similar documents:', error);
      return [];
    }
  }

  /**
   * Search documents by text (fallback search)
   */
  async searchDocumentsByText(
    query: string,
    userId: string,
    options: {
      limit?: number;
      tags?: string[];
    } = {}
  ): Promise<any[]> {
    try {
      const where: any = {
        createdBy: userId
      };

      // Apply text search
      if (query) {
        where.OR = [
          { title: { contains: query } },
          { content: { contains: query } }
        ];
      }

      // Apply tag filter
      if (options.tags && options.tags.length > 0) {
        where.tags = {
          contains: JSON.stringify(options.tags)
        };
      }

      const documents = await db.knowledgeDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 10
      });

      return documents.map(doc => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : []
      }));
    } catch (error) {
      console.error('Error searching documents by text:', error);
      return [];
    }
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(
    userId: string,
    options: {
      days?: number;
      limit?: number;
    } = {}
  ): Promise<any> {
    try {
      const days = options.days || 30;
      const limit = options.limit || 100;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const usageData = await db.knowledgeUsage.findMany({
        where: {
          userId,
          createdAt: {
            gte: cutoffDate
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      // Calculate analytics
      const analytics = {
        total_queries: usageData.length,
        avg_response_time: usageData.reduce((sum, usage) => sum + usage.responseTimeMs, 0) / (usageData.length || 1) || 0,
        avg_relevance_score: usageData.reduce((sum, usage) => sum + (usage.relevanceScore || 0), 0) / (usageData.length || 1) || 0,
        recent_queries: usageData.slice(0, 10),
        daily_usage: this.groupUsageByDay(usageData)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      return {
        total_queries: 0,
        avg_response_time: 0,
        avg_relevance_score: 0,
        recent_queries: [],
        daily_usage: []
      };
    }
  }

  /**
   * Group usage data by day
   */
  private groupUsageByDay(usageData: any[]): Array<{ date: string; count: number }> {
    const grouped: Record<string, number> = {};

    usageData.forEach(usage => {
      const date = usage.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

// Export singleton instance
export const vectorSearch = new VectorSearchRetrieval();