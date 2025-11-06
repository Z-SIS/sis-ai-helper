import { z } from 'zod';
import { getZAI, getZAISync } from '@/lib/ai/zai-compat';

// Research Cache Schema
export const ResearchCacheSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  industry: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  foundedYear: z.number().optional(),
  employeeCount: z.string().optional(),
  revenue: z.string().optional(),
  keyExecutives: z.array(z.any()).optional(),
  competitors: z.array(z.any()).optional(),
  recentNews: z.array(z.any()).optional(),
  researchData: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ResearchCache = z.infer<typeof ResearchCacheSchema>;

// RAG Query Schema
export const RAGQuerySchema = z.object({
  query: z.string(),
  context: z.record(z.any()).optional(),
  maxResults: z.number().default(5),
  minRelevanceScore: z.number().default(0.7)
});

export type RAGQuery = z.infer<typeof RAGQuerySchema>;

// RAG Result Schema
export const RAGResultSchema = z.object({
  query: z.string(),
  results: z.array(z.object({
    content: z.string(),
    source: z.string(),
    relevanceScore: z.number(),
    metadata: z.record(z.any())
  })),
  augmentedQuery: z.string(),
  response: z.string(),
  sources: z.array(z.string())
});

export type RAGResult = z.infer<typeof RAGResultSchema>;

export class RAGSystem {
  private cache: Map<string, ResearchCache> = new Map();
  private zai: any;
  private cacheExpiryDays = 30;

  constructor() {
    this.zai = getZAISync();
    this.loadCacheFromStorage();
  }

  // Cache Management
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cached = localStorage.getItem('company_research_cache');
      if (cached) {
        const data = JSON.parse(cached);
        data.forEach((item: any) => {
          const cache = ResearchCacheSchema.parse({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          });
          this.cache.set(cache.companyName.toLowerCase(), cache);
        });
      }
    } catch (error) {
      console.error('Failed to load research cache:', error);
    }
  }

  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheArray = Array.from(this.cache.values());
      localStorage.setItem('company_research_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Failed to save research cache:', error);
    }
  }

  private isCacheValid(cache: ResearchCache): boolean {
    const now = new Date();
    const daysDiff = (now.getTime() - cache.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < this.cacheExpiryDays;
  }

  // Company Research
  async researchCompany(companyName: string): Promise<ResearchCache> {
    const cacheKey = companyName.toLowerCase();
    const cached = this.cache.get(cacheKey);

    // Check if we have valid cached data
    if (cached && this.isCacheValid(cached)) {
      console.log(`Using cached research for ${companyName}`);
      return cached;
    }

    console.log(`Researching company: ${companyName}`);
    
    try {
      // Perform web search for company information
      const searchResults = await this.zai.functions.invoke("web_search", {
        query: `${companyName} company profile business information`,
        num: 10
      });

      // Use AI to analyze and structure the research data
      const researchPrompt = `
        Analyze the following search results about "${companyName}" and extract comprehensive company information:

        Search Results:
        ${JSON.stringify(searchResults, null, 2)}

        Please provide a structured analysis including:
        1. Company description and business model
        2. Industry classification
        3. Location(s)
        4. Website information
        5. Founded year (if available)
        6. Estimated employee count
        7. Revenue information (if available)
        8. Key executives/leadership
        9. Main competitors
        10. Recent news or developments
        11. Key business insights and analysis

        Format the response as a detailed JSON object with these fields.
      `;

      const analysis = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a business research analyst. Provide detailed, accurate company information in JSON format.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        temperature: 0.3
      });

      const researchData = JSON.parse(analysis.choices[0].message.content || '{}');

      // Create cache entry
      const cacheEntry: ResearchCache = {
        id: crypto.randomUUID(),
        companyName,
        industry: researchData.industry || 'Unknown',
        location: researchData.location || 'Unknown',
        description: researchData.description || '',
        website: researchData.website || '',
        foundedYear: researchData.foundedYear,
        employeeCount: researchData.employeeCount || 'Unknown',
        revenue: researchData.revenue || 'Unknown',
        keyExecutives: researchData.keyExecutives || [],
        competitors: researchData.competitors || [],
        recentNews: researchData.recentNews || [],
        researchData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to cache
      this.cache.set(cacheKey, cacheEntry);
      await this.saveCacheToStorage();

      return cacheEntry;

    } catch (error) {
      console.error(`Failed to research company ${companyName}:`, error);
      
      // Return basic cache entry even if research fails
      const fallbackCache: ResearchCache = {
        id: crypto.randomUUID(),
        companyName,
        industry: 'Unknown',
        location: 'Unknown',
        description: `Research failed for ${companyName}`,
        website: '',
        researchData: { error: error instanceof Error ? error.message : 'Unknown error' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.cache.set(cacheKey, fallbackCache);
      await this.saveCacheToStorage();

      return fallbackCache;
    }
  }

  // RAG Query Processing
  async processQuery(query: RAGQuery): Promise<RAGResult> {
    // Extract relevant context from cache
    const relevantContext = await this.retrieveRelevantContext(query.query, query.maxResults, query.minRelevanceScore);
    
    // Augment the query with context
    const augmentedQuery = this.augmentQuery(query.query, relevantContext);
    
    // Generate response using AI
    const response = await this.generateResponse(augmentedQuery, relevantContext);
    
    // Extract sources
    const sources = relevantContext.map(ctx => ctx.source);

    return {
      query: query.query,
      results: relevantContext,
      augmentedQuery,
      response,
      sources
    };
  }

  private async retrieveRelevantContext(query: string, maxResults: number, minRelevanceScore: number): Promise<Array<{
    content: string;
    source: string;
    relevanceScore: number;
    metadata: Record<string, any>;
  }>> {
    const context: Array<{
      content: string;
      source: string;
      relevanceScore: number;
      metadata: Record<string, any>;
    }> = [];

    // Search through cached company research
    const queryLower = query.toLowerCase();
    
    for (const [companyKey, cache] of this.cache.entries()) {
      if (this.isCacheValid(cache)) {
        // Calculate relevance score based on query matching
        const relevanceScore = this.calculateRelevanceScore(queryLower, cache);
        
        if (relevanceScore >= minRelevanceScore) {
          context.push({
            content: JSON.stringify(cache.researchData, null, 2),
            source: `Company Research: ${cache.companyName}`,
            relevanceScore,
            metadata: {
              companyName: cache.companyName,
              industry: cache.industry,
              updatedAt: cache.updatedAt
            }
          });
        }
      }
    }

    // Sort by relevance score and limit results
    return context
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  private calculateRelevanceScore(query: string, cache: ResearchCache): number {
    let score = 0;
    const queryWords = query.split(/\s+/);
    
    // Check company name match
    if (query.includes(cache.companyName.toLowerCase())) {
      score += 1.0;
    }
    
    // Check industry match
    if (cache.industry && query.includes(cache.industry.toLowerCase())) {
      score += 0.8;
    }
    
    // Check description keywords
    if (cache.description) {
      const descriptionWords = cache.description.toLowerCase().split(/\s+/);
      const matchingWords = queryWords.filter(word => 
        descriptionWords.some(descWord => descWord.includes(word) || word.includes(descWord))
      );
      score += (matchingWords.length / queryWords.length) * 0.5;
    }
    
    return Math.min(score, 1.0);
  }

  private augmentQuery(originalQuery: string, context: Array<{
    content: string;
    source: string;
    relevanceScore: number;
    metadata: Record<string, any>;
  }>): string {
    if (context.length === 0) {
      return originalQuery;
    }

    const contextSummary = context
      .map(ctx => `- ${ctx.source}: ${ctx.metadata.companyName || 'Unknown'}`)
      .join('\n');

    return `${originalQuery}

Context Information:
${contextSummary}

Please use the above context to provide a more informed and detailed response.`;
  }

  private async generateResponse(augmentedQuery: string, context: Array<{
    content: string;
    source: string;
    relevanceScore: number;
    metadata: Record<string, any>;
  }>): Promise<string> {
    const contextText = context
      .map(ctx => `Source: ${ctx.source}\n${ctx.content}`)
      .join('\n\n---\n\n');

    const prompt = `
You are an AI assistant with access to relevant company research context. Please provide a comprehensive response to the following query:

Query: ${augmentedQuery}

Relevant Context:
${contextText}

Instructions:
1. Use the provided context to inform your response
2. Cite the sources when using specific information
3. If the context doesn't contain enough information, clearly state that
4. Provide actionable insights when possible
5. Maintain a professional and helpful tone

Response:`;

    try {
      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant with access to company research data. Provide accurate, well-sourced responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 1000
      });

      return response.choices[0].message.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('Failed to generate response:', error);
      return 'I apologize, but I encountered an error while processing your request.';
    }
  }

  // Cache Management Methods
  async clearCache(): Promise<void> {
    this.cache.clear();
    await this.saveCacheToStorage();
  }

  async getCacheStats(): Promise<{
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    totalSize: number;
  }> {
    const entries = Array.from(this.cache.values());
    const now = new Date();
    
    const validEntries = entries.filter(entry => this.isCacheValid(entry)).length;
    const expiredEntries = entries.length - validEntries;
    const totalSize = JSON.stringify(entries).length;

    return {
      totalEntries: entries.length,
      validEntries,
      expiredEntries,
      totalSize
    };
  }

  async exportCache(): Promise<string> {
    return JSON.stringify(Array.from(this.cache.values()), null, 2);
  }

  async importCache(cacheData: string): Promise<void> {
    try {
      const data = JSON.parse(cacheData);
      this.cache.clear();
      
      data.forEach((item: any) => {
        const cache = ResearchCacheSchema.parse({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        });
        this.cache.set(cache.companyName.toLowerCase(), cache);
      });
      
      await this.saveCacheToStorage();
    } catch (error) {
      console.error('Failed to import cache:', error);
      throw new Error('Invalid cache data format');
    }
  }
}