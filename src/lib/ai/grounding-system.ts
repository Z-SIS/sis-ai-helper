/**
 * Grounding and RAG (Retrieval-Augmented Generation) System
 * 
 * Provides factual grounding for AI outputs by retrieving and incorporating
 * authoritative data sources into the prompt context.
 */

import { z } from 'zod';

// Grounding source interface
export interface GroundingSource {
  id: string;
  title: string;
  content: string;
  url?: string;
  relevanceScore: number;
  lastUpdated: string;
  category: 'company' | 'industry' | 'financial' | 'news' | 'general';
  reliability: number; // 0-1 score
}

// Grounding query result
export interface GroundingResult {
  query: string;
  sources: GroundingSource[];
  totalRelevanceScore: number;
  hasHighQualitySources: boolean;
  processedAt: string;
}

// Knowledge base entry
export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  metadata: {
    source: string;
    lastVerified: string;
    reliability: number;
    category: string;
    tags: string[];
  };
}

// RAG configuration
export interface RAGConfig {
  enabled: boolean;
  maxSources: number;
  minRelevanceScore: number;
  includeSourceCitations: boolean;
  requireHighQualitySources: boolean;
  maxContextLength: number;
}

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  enabled: true,
  maxSources: 5,
  minRelevanceScore: 0.7,
  includeSourceCitations: true,
  requireHighQualitySources: true,
  maxContextLength: 4000,
};

// Grounding system class
export class GroundingSystem {
  private config: RAGConfig;
  private knowledgeBase: Map<string, KnowledgeEntry[]>;

  constructor(config: RAGConfig = DEFAULT_RAG_CONFIG) {
    this.config = config;
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase(): void {
    // Initialize with some basic knowledge entries
    this.addKnowledgeEntry({
      id: 'sis-group-info',
      topic: 'SIS Group Enterprises',
      content: `SIS Group Enterprises is India's leading security solutions company. 
      Founded in 1985 by Ravindra Kishore Sinha. 
      Headquarters: Kolkata, West Bengal, India.
      Business: Security services, facility management, cash logistics.
      Employees: Over 200,000 employees.
      Revenue: Approximately ₹12,000 crore.
      Stock: Listed on NSE and BSE (ticker: SIS).
      Key services: Guarding services, cash management, facility services.`,
      metadata: {
        source: 'company_records',
        lastVerified: '2024-01-01',
        reliability: 0.95,
        category: 'company',
        tags: ['security', 'india', 'public_company']
      }
    });

    this.addKnowledgeEntry({
      id: 'security-industry-standards',
      topic: 'Security Industry Standards',
      content: `The security industry in India follows PSARA (Private Security Agencies Regulation Act) guidelines.
      Key requirements: 
      - All security personnel must be trained and certified
      - Companies must have proper licensing
      - Background checks are mandatory for all personnel
      - Insurance coverage is required for all operations
      Standard operating procedures must include emergency response protocols.`,
      metadata: {
        source: 'industry_regulations',
        lastVerified: '2024-01-01',
        reliability: 0.9,
        category: 'industry',
        tags: ['regulations', 'standards', 'compliance']
      }
    });
  }

  private addKnowledgeEntry(entry: KnowledgeEntry): void {
    const topic = entry.topic.toLowerCase();
    if (!this.knowledgeBase.has(topic)) {
      this.knowledgeBase.set(topic, []);
    }
    this.knowledgeBase.get(topic)!.push(entry);
  }

  async retrieveGroundingData(query: string, context?: string): Promise<GroundingResult> {
    if (!this.config.enabled) {
      return {
        query,
        sources: [],
        totalRelevanceScore: 0,
        hasHighQualitySources: false,
        processedAt: new Date().toISOString()
      };
    }

    const sources: GroundingSource[] = [];
    
    // Search knowledge base
    const kbResults = this.searchKnowledgeBase(query);
    sources.push(...kbResults);

    // Perform web search for current information
    const webResults = await this.performWebSearch(query);
    sources.push(...webResults);

    // Sort by relevance and limit
    sources.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limitedSources = sources.slice(0, this.config.maxSources);

    // Calculate total relevance
    const totalRelevanceScore = limitedSources.reduce((sum, source) => sum + source.relevanceScore, 0) / Math.max(limitedSources.length, 1);
    
    const hasHighQualitySources = limitedSources.some(source => 
      source.reliability >= 0.8 && source.relevanceScore >= this.config.minRelevanceScore
    );

    return {
      query,
      sources: limitedSources,
      totalRelevanceScore,
      hasHighQualitySources,
      processedAt: new Date().toISOString()
    };
  }

  private searchKnowledgeBase(query: string): GroundingSource[] {
    const results: GroundingSource[] = [];
    const queryTerms = query.toLowerCase().split(' ');

    for (const [topic, entries] of this.knowledgeBase.entries()) {
      for (const entry of entries) {
        const relevanceScore = this.calculateRelevance(query, entry.content, entry.metadata.tags);
        
        if (relevanceScore >= this.config.minRelevanceScore) {
          results.push({
            id: entry.id,
            title: entry.topic,
            content: entry.content,
            relevanceScore,
            lastUpdated: entry.metadata.lastVerified,
            category: entry.metadata.category as any,
            reliability: entry.metadata.reliability
          });
        }
      }
    }

    return results;
  }

  private async performWebSearch(query: string): Promise<GroundingSource[]> {
    try {
      // Check if Tavily API key is available
      const tavilyKey = process.env.TAVILY_API_KEY;
      if (!tavilyKey) {
        console.warn('TAVILY_API_KEY not found for grounding search');
        return [];
      }

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${query} company information official data`,
          max_results: 3,
          search_depth: 'basic',
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results?.map((result: any) => ({
        id: `web_${Date.now()}_${Math.random()}`,
        title: result.title,
        content: result.content?.slice(0, 1000) || '',
        url: result.url,
        relevanceScore: result.score || 0.7,
        lastUpdated: new Date().toISOString().split('T')[0],
        category: 'general' as const,
        reliability: 0.7 // Web sources get moderate reliability
      })) || [];

    } catch (error) {
      console.error('Grounding web search error:', error);
      return [];
    }
  }

  private calculateRelevance(query: string, content: string, tags: string[]): number {
    const queryTerms = query.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    const tagsLower = tags.map(tag => tag.toLowerCase());

    let relevanceScore = 0;
    let matchedTerms = 0;

    // Calculate term matching
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        matchedTerms++;
        relevanceScore += 0.3;
      }
      if (tagsLower.some(tag => tag.includes(term))) {
        matchedTerms++;
        relevanceScore += 0.2;
      }
    }

    // Boost score based on match ratio
    const matchRatio = matchedTerms / queryTerms.length;
    relevanceScore *= (1 + matchRatio);

    // Normalize to 0-1 range
    return Math.min(relevanceScore, 1);
  }

  formatGroundingContext(groundingResult: GroundingResult): string {
    if (!this.config.enabled || groundingResult.sources.length === 0) {
      return '';
    }

    let context = '\n=== GROUNDING DATA ===\n';
    context += 'Use the following verified information to ensure factual accuracy:\n\n';

    for (let i = 0; i < groundingResult.sources.length; i++) {
      const source = groundingResult.sources[i];
      context += `Source ${i + 1} (${source.category}, reliability: ${(source.reliability * 100).toFixed(0)}%):\n`;
      context += `${source.content}\n`;
      
      if (source.url && this.config.includeSourceCitations) {
        context += `Source: ${source.url}\n`;
      }
      context += '\n';
    }

    context += '=== END GROUNDING DATA ===\n\n';
    context += 'IMPORTANT: Base your response primarily on the provided grounding data. ';
    context += 'If information is not available in the grounding data, respond with "UNKNOWN" or indicate uncertainty.\n';

    // Truncate if too long
    if (context.length > this.config.maxContextLength) {
      context = context.substring(0, this.config.maxContextLength) + '...\n';
    }

    return context;
  }

  updateConfig(newConfig: Partial<RAGConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): RAGConfig {
    return { ...this.config };
  }
}

// Context builder for prompts
export class GroundedPromptBuilder {
  private groundingSystem: GroundingSystem;

  constructor(groundingSystem: GroundingSystem) {
    this.groundingSystem = groundingSystem;
  }

  async buildGroundedPrompt(
    basePrompt: string,
    query: string,
    context?: string
  ): Promise<{
    prompt: string;
    groundingResult: GroundingResult;
    hasGrounding: boolean;
  }> {
    // Retrieve grounding data
    const groundingResult = await this.groundingSystem.retrieveGroundingData(query, context);
    
    // Build grounded prompt
    let groundedPrompt = basePrompt;
    
    if (groundingResult.sources.length > 0) {
      const groundingContext = this.groundingSystem.formatGroundingContext(groundingResult);
      groundedPrompt = groundingContext + groundedPrompt;
    }

    // Add grounding instructions
    groundedPrompt += '\n\nRESPONSE REQUIREMENTS:\n';
    groundedPrompt += '1. Use ONLY information from the grounding data above\n';
    groundedPrompt += '2. If information is not available, respond with "UNKNOWN"\n';
    groundedPrompt += '3. Include confidence scores for each piece of information\n';
    groundedPrompt += '4. Cite sources when possible\n';

    return {
      prompt: groundedPrompt,
      groundingResult,
      hasGrounding: groundingResult.sources.length > 0
    };
  }
}

// Factory function
export function createGroundingSystem(config?: Partial<RAGConfig>): GroundingSystem {
  return new GroundingSystem({ ...DEFAULT_RAG_CONFIG, ...config });
}

export function createGroundedPromptBuilder(groundingSystem: GroundingSystem): GroundedPromptBuilder {
  return new GroundedPromptBuilder(groundingSystem);
}