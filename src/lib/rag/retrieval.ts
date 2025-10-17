import { createClient } from '@supabase/supabase-js';
import ZAI from 'z-ai-web-dev-sdk';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ZAI client
const zai = new ZAI();

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
  private zai: ZAI;

  constructor() {
    this.zai = new ZAI();
  }

  /**
   * Generate embedding for a query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await this.zai.embeddings.create({
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
      const { data, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_count: options.match_count,
        similarity_threshold: options.similarity_threshold,
        filter_tags: options.filter_tags || null,
        filter_created_by: options.filter_created_by || null
      });

      if (error) throw error;

      return data || [];
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
      const { data, error } = await supabase.rpc('match_company_research', {
        query_embedding: queryEmbedding,
        match_count: options.match_count,
        similarity_threshold: options.similarity_threshold
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching company research:', error);
      return [];
    }
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

      const response = await this.zai.chat.completions.create({
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

      const { data, error } = await supabase
        .from('knowledge_usage')
        .insert({
          id: usageId,
          user_id: userId,
          query,
          retrieved_chunks: [
            ...retrievalResult.knowledge_chunks.map(c => c.id),
            ...retrievalResult.company_research.map(c => c.id)
          ],
          response: answer,
          sources: this.formatSources(retrievalResult),
          relevance_score: this.calculateRelevanceScore(retrievalResult),
          response_time_ms: responseTime
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
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
      const { data: chunks, error: chunkError } = await supabase
        .from('knowledge_chunks')
        .select('embedding, chunk_text')
        .eq('document_id', documentId)
        .limit(1);

      if (chunkError || !chunks || chunks.length === 0) {
        return [];
      }

      // Use the first chunk's embedding to find similar documents
      const embedding = chunks[0].embedding;

      const { data: similarChunks, error: similarError } = await supabase
        .rpc('match_knowledge_chunks', {
          query_embedding: embedding,
          match_count: limit * 2, // Get more chunks to find unique documents
          similarity_threshold: 0.5,
          filter_created_by: userId
        });

      if (similarError) return [];

      // Group by document and get unique documents
      const uniqueDocuments = new Map();
      similarChunks?.forEach((chunk: any) => {
        if (chunk.document_id !== documentId && !uniqueDocuments.has(chunk.document_id)) {
          uniqueDocuments.set(chunk.document_id, {
            id: chunk.document_id,
            title: chunk.document_title,
            similarity: chunk.similarity,
            tags: chunk.document_tags
          });
        }
      });

      return Array.from(uniqueDocuments.values()).slice(0, limit);
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
      let dbQuery = supabase
        .from('knowledge_documents')
        .select('*')
        .eq('created_by', userId);

      // Apply text search
      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      // Apply tag filter
      if (options.tags && options.tags.length > 0) {
        dbQuery = dbQuery.contains('tags', options.tags);
      }

      // Apply limit
      if (options.limit) {
        dbQuery = dbQuery.limit(options.limit);
      }

      // Order by relevance (simple heuristic)
      dbQuery = dbQuery.order('created_at', { ascending: false });

      const { data, error } = await dbQuery;

      if (error) throw error;

      return data || [];
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

      const { data, error } = await supabase
        .from('knowledge_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Calculate analytics
      const analytics = {
        total_queries: data?.length || 0,
        avg_response_time: data?.reduce((sum, usage) => sum + usage.response_time_ms, 0) / (data?.length || 1) || 0,
        avg_relevance_score: data?.reduce((sum, usage) => sum + (usage.relevance_score || 0), 0) / (data?.length || 1) || 0,
        recent_queries: data?.slice(0, 10) || [],
        daily_usage: this.groupUsageByDay(data || [])
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
      const date = usage.created_at.split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

// Export singleton instance
export const vectorSearch = new VectorSearchRetrieval();