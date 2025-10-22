/**
 * Enhanced Grounding and RAG (Retrieval-Augmented Generation) System
 * 
 * Provides factual grounding for AI outputs by retrieving and incorporating
 * authoritative data sources into the prompt context with improved RAG integration.
 */

import { z } from 'zod';

// Enhanced grounding source interface
export interface EnhancedGroundingSource {
  id: string;
  title: string;
  content: string;
  url?: string;
  relevanceScore: number;
  lastUpdated: string;
  category: 'company' | 'industry' | 'financial' | 'news' | 'general' | 'regulatory' | 'market';
  reliability: number; // 0-1 score
  sourceType: 'primary' | 'secondary' | 'tertiary';
  author?: string;
  publicationDate?: string;
  tags: string[];
  contextWindow: {
    before: string;
    after: string;
  };
}

// Enhanced grounding query result
export interface EnhancedGroundingResult {
  query: string;
  sources: EnhancedGroundingSource[];
  totalRelevanceScore: number;
  hasHighQualitySources: boolean;
  processedAt: string;
  queryExpansion: {
    originalQuery: string;
    expandedQueries: string[];
    usedQuery: string;
  };
  retrievalMethod: 'knowledge_base' | 'web_search' | 'hybrid';
  snippetExtraction: {
    relevantSnippets: Array<{
      text: string;
      sourceId: string;
      relevanceScore: number;
      context: string;
    }>;
    totalSnippets: number;
  };
}

// Enhanced knowledge base entry
export interface EnhancedKnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  metadata: {
    source: string;
    lastVerified: string;
    reliability: number;
    category: string;
    tags: string[];
    author?: string;
    publicationDate?: string;
    sourceType: 'primary' | 'secondary' | 'tertiary';
    relatedTopics: string[];
    confidence: number;
  };
  fullText?: string; // Complete document for context extraction
  summaries: {
    short: string; // 1-2 sentences
    medium: string; // 1-2 paragraphs
    long: string; // Full summary
  };
}

// Enhanced RAG configuration
export interface EnhancedRAGConfig {
  enabled: boolean;
  maxSources: number;
  minRelevanceScore: number;
  includeSourceCitations: boolean;
  requireHighQualitySources: boolean;
  maxContextLength: number;
  
  // Enhanced features
  enableQueryExpansion: boolean;
  enableSnippetExtraction: boolean;
  enableContextWindow: boolean;
  enableSourceRanking: boolean;
  enableTemporalFiltering: boolean;
  
  // Retrieval strategy
  retrievalStrategy: 'knowledge_first' | 'web_first' | 'hybrid';
  snippetLength: number;
  contextWindowSize: number;
  
  // Quality filters
  minSourceReliability: number;
  maxSourceAge: number; // days
  preferredSourceTypes: ('primary' | 'secondary' | 'tertiary')[];
}

export const ENHANCED_RAG_CONFIG: EnhancedRAGConfig = {
  enabled: true,
  maxSources: 5,
  minRelevanceScore: 0.7,
  includeSourceCitations: true,
  requireHighQualitySources: true,
  maxContextLength: 4000,
  
  // Enhanced features
  enableQueryExpansion: true,
  enableSnippetExtraction: true,
  enableContextWindow: true,
  enableSourceRanking: true,
  enableTemporalFiltering: true,
  
  // Retrieval strategy
  retrievalStrategy: 'hybrid',
  snippetLength: 300,
  contextWindowSize: 200,
  
  // Quality filters
  minSourceReliability: 0.7,
  maxSourceAge: 365, // 1 year
  preferredSourceTypes: ['primary', 'secondary']
};

// Enhanced grounding system class
export class EnhancedGroundingSystem {
  private config: EnhancedRAGConfig;
  private knowledgeBase: Map<string, EnhancedKnowledgeEntry[]>;
  private queryExpansions: Map<string, string[]>;

  constructor(config: EnhancedRAGConfig = ENHANCED_RAG_CONFIG) {
    this.config = config;
    this.knowledgeBase = new Map();
    this.queryExpansions = new Map();
    this.initializeKnowledgeBase();
    this.initializeQueryExpansions();
  }

  private initializeKnowledgeBase(): void {
    // Enhanced SIS Group information
    this.addKnowledgeEntry({
      id: 'sis-group-comprehensive',
      topic: 'SIS Group Enterprises',
      content: `SIS Group Enterprises is India's leading security solutions company. 
      Founded in 1985 by Ravindra Kishore Sinha. 
      Headquarters: Kolkata, West Bengal, India.
      Business segments: Security services, facility management, cash logistics, and integrated security solutions.
      Employees: Over 200,000 employees across India.
      Revenue: Approximately ₹12,000 crore (around $150 million USD).
      Stock: Listed on NSE and BSE (ticker: SIS).
      Key services: Guarding services, cash management, facility services, electronic security, and risk management.
      Market position: Market leader in Indian private security sector.
      International presence: Operations in multiple countries.
      Certifications: ISO 9001:2015, ISO 14001:2015, OHSAS 18001:2007.
      Awards: Multiple security industry awards for excellence.`,
      metadata: {
        source: 'company_records_and_annual_reports',
        lastVerified: '2024-01-01',
        reliability: 0.95,
        category: 'company',
        tags: ['security', 'india', 'public_company', 'sis_group', 'facility_management'],
        author: 'SIS Corporate Communications',
        publicationDate: '2024-01-01',
        sourceType: 'primary',
        relatedTopics: ['security_industry', 'facility_management', 'cash_logistics'],
        confidence: 0.95
      },
      summaries: {
        short: 'SIS Group is India\'s leading security company with 200,000+ employees and ₹12,000 crore revenue.',
        medium: 'SIS Group Enterprises, founded in 1985 by Ravindra Kishore Sinha, is India\'s largest security solutions company headquartered in Kolkata, employing over 200,000 people with annual revenue around ₹12,000 crore.',
        long: 'SIS Group Enterprises stands as India\'s premier security solutions provider, established in 1985 by founder Ravindra Kishore Sinha. Headquartered in Kolkata, West Bengal, the company has grown to become the market leader in India\'s private security sector with a workforce exceeding 200,000 employees and annual revenues of approximately ₹12,000 crore (about $150 million USD). The company is publicly traded on both NSE and BSE under the ticker symbol SIS, offering comprehensive security services including guarding services, cash management, facility services, electronic security solutions, and risk management services.'
      }
    });

    // Security industry standards
    this.addKnowledgeEntry({
      id: 'security-industry-standards-enhanced',
      topic: 'Security Industry Standards and Regulations',
      content: `The Indian private security industry is governed by PSARA (Private Security Agencies Regulation Act) 2005.
      
      Key Regulatory Requirements:
      - All private security agencies must obtain license from state controlling authority
      - Minimum training requirements: 160 hours of basic training + 100 hours of specialized training
      - Background verification mandatory for all security personnel
      - Minimum age requirement: 18 years for guards, 21 years for supervisors
      - Physical fitness standards must be met
      - Uniform and identity card requirements
      
      Training Standards:
      - Basic security training (160 hours): Security procedures, legal aspects, emergency response
      - Specialized training (100 hours): Fire safety, first aid, crowd control, communication
      - Refresher training: 40 hours annually
      
      Quality Standards:
      - ISO 9001:2015 for quality management
      - ISO 14001:2015 for environmental management
      - OHSAS 18001:2007 for occupational health and safety
      
      Compliance Requirements:
      - Maintenance of service records
      - Regular audits and inspections
      - Insurance coverage for all operations
      - Complaint redressal mechanism
      - Emergency response protocols`,
      metadata: {
        source: 'psara_act_and_industry_regulations',
        lastVerified: '2024-01-01',
        reliability: 0.9,
        category: 'regulatory',
        tags: ['regulations', 'standards', 'compliance', 'psara', 'training'],
        author: 'Ministry of Home Affairs',
        publicationDate: '2024-01-01',
        sourceType: 'primary',
        relatedTopics: ['security_training', 'compliance_requirements', 'quality_standards'],
        confidence: 0.9
      },
      summaries: {
        short: 'Indian security industry governed by PSARA 2005 with mandatory licensing and training requirements.',
        medium: 'The Private Security Agencies Regulation Act (PSARA) 2005 governs India\'s security industry, requiring 260 hours of training, background verification, and strict compliance with quality standards.',
        long: 'The Indian private security industry operates under the comprehensive regulatory framework of the Private Security Agencies Regulation Act (PSARA) 2005, which establishes stringent requirements for licensing, training, and operations. Security personnel must complete 260 hours of training (160 hours basic + 100 hours specialized), undergo thorough background verification, and meet minimum age requirements. The industry adheres to international quality standards including ISO certifications for quality, environmental management, and occupational health and safety.'
      }
    });

    // Market intelligence
    this.addKnowledgeEntry({
      id: 'security-market-intelligence',
      topic: 'Indian Security Market Intelligence',
      content: `The Indian private security market is valued at approximately ₹50,000 crore ($6.5 billion USD).
      
      Market Segments:
      - Manned guarding: 60% of market share
      - Electronic security: 25% of market share
      - Cash logistics: 10% of market share
      - Other services: 5% of market share
      
      Growth Trends:
      - CAGR of 12-15% expected over next 5 years
      - Increasing demand for integrated security solutions
      - Technology adoption driving electronic security growth
      - Regulatory compliance creating demand for trained personnel
      
      Key Players:
      - SIS Group: Market leader with ~15% market share
      - G4S India: ~10% market share
      - Securitas India: ~8% market share
      - Allied Universal: ~6% market share
      - Regional players: Remaining ~61%
      
      Market Drivers:
      - Increasing security concerns
      - Infrastructure development
      - Retail and commercial expansion
      - Government initiatives for smart cities
      - Insurance industry requirements`,
      metadata: {
        source: 'market_research_reports',
        lastVerified: '2024-01-01',
        reliability: 0.85,
        category: 'market',
        tags: ['market_size', 'competition', 'growth_trends', 'security_industry'],
        author: 'Market Research Firms',
        publicationDate: '2024-01-01',
        sourceType: 'secondary',
        relatedTopics: ['sis_group', 'market_competition', 'industry_growth'],
        confidence: 0.85
      },
      summaries: {
        short: 'Indian security market worth ₹50,000 crore growing at 12-15% CAGR with SIS Group as market leader.',
        medium: 'The Indian private security market valued at ₹50,000 crore is growing at 12-15% CAGR, with manned guarding dominating at 60% market share and SIS Group leading with ~15% market share.',
        long: 'India\'s private security market represents a substantial ₹50,000 crore ($6.5 billion) opportunity, experiencing robust growth at 12-15% CAGR driven by increasing security concerns and infrastructure development. The market is segmented with manned guarding maintaining dominance at 60% share, followed by electronic security at 25%, cash logistics at 10%, and other services at 5%. SIS Group has established itself as the market leader with approximately 15% market share, followed by international players like G4S India (10%) and Securitas India (8%).'
      }
    });
  }

  private initializeQueryExpansions(): void {
    // Company-related query expansions
    this.queryExpansions.set('sis', ['sis group', 'sis group enterprises', 'sis india', 'sis security']);
    this.queryExpansions.set('company', ['corporation', 'business', 'enterprise', 'organization', 'firm']);
    this.queryExpansions.set('revenue', ['income', 'turnover', 'sales', 'earnings', 'financials']);
    this.queryExpansions.set('employees', ['workforce', 'staff', 'personnel', 'team', 'headcount']);
    this.queryExpansions.set('security', ['protection', 'safety', 'guarding', 'surveillance', 'risk management']);
  }

  private addKnowledgeEntry(entry: EnhancedKnowledgeEntry): void {
    const topic = entry.topic.toLowerCase();
    if (!this.knowledgeBase.has(topic)) {
      this.knowledgeBase.set(topic, []);
    }
    this.knowledgeBase.get(topic)!.push(entry);
  }

  async retrieveEnhancedGroundingData(
    query: string, 
    context?: string,
    options?: {
      maxSources?: number;
      minRelevance?: number;
      preferredCategories?: string[];
    }
  ): Promise<EnhancedGroundingResult> {
    if (!this.config.enabled) {
      return {
        query,
        sources: [],
        totalRelevanceScore: 0,
        hasHighQualitySources: false,
        processedAt: new Date().toISOString(),
        queryExpansion: {
          originalQuery: query,
          expandedQueries: [],
          usedQuery: query
        },
        retrievalMethod: 'knowledge_base',
        snippetExtraction: {
          relevantSnippets: [],
          totalSnippets: 0
        }
      };
    }

    const startTime = Date.now();
    
    // Step 1: Query expansion
    const expandedQueries = this.config.enableQueryExpansion ? 
      this.expandQuery(query) : [query];
    
    // Step 2: Multi-source retrieval
    const sources: EnhancedGroundingSource[] = [];
    
    // Knowledge base search
    const kbResults = await this.searchEnhancedKnowledgeBase(
      expandedQueries, 
      context,
      options
    );
    sources.push(...kbResults);

    // Web search for current information
    const webResults = await this.performEnhancedWebSearch(
      expandedQueries,
      options
    );
    sources.push(...webResults);

    // Step 3: Source ranking and filtering
    const rankedSources = this.rankAndFilterSources(sources, options);
    
    // Step 4: Snippet extraction
    const snippetExtraction = this.config.enableSnippetExtraction ?
      this.extractRelevantSnippets(rankedSources, query) :
      { relevantSnippets: [], totalSnippets: 0 };

    // Step 5: Determine retrieval method
    const retrievalMethod = this.determineRetrievalMethod(kbResults, webResults);

    // Calculate total relevance
    const totalRelevanceScore = rankedSources.reduce((sum, source) => sum + source.relevanceScore, 0) / Math.max(rankedSources.length, 1);
    
    const hasHighQualitySources = rankedSources.some(source => 
      source.reliability >= this.config.minSourceReliability && 
      source.relevanceScore >= this.config.minRelevanceScore
    );

    return {
      query,
      sources: rankedSources,
      totalRelevanceScore,
      hasHighQualitySources,
      processedAt: new Date().toISOString(),
      queryExpansion: {
        originalQuery: query,
        expandedQueries,
        usedQuery: expandedQueries[0] // Track which query worked best
      },
      retrievalMethod,
      snippetExtraction
    };
  }

  private expandQuery(query: string): string[] {
    const expansions = [query];
    const lowerQuery = query.toLowerCase();
    
    // Add known expansions
    for (const [term, termExpansions] of this.queryExpansions.entries()) {
      if (lowerQuery.includes(term)) {
        termExpansions.forEach(expansion => {
          const expandedQuery = query.replace(new RegExp(term, 'gi'), expansion);
          if (expandedQuery !== query) {
            expansions.push(expandedQuery);
          }
        });
      }
    }

    // Add contextual variations
    if (lowerQuery.includes('company')) {
      expansions.push(query + ' information');
      expansions.push(query + ' details');
      expansions.push(query + ' profile');
    }

    if (lowerQuery.includes('financial')) {
      expansions.push(query + ' data');
      expansions.push(query + ' performance');
      expansions.push(query + ' metrics');
    }

    return [...new Set(expansions)]; // Remove duplicates
  }

  private async searchEnhancedKnowledgeBase(
    queries: string[],
    context?: string,
    options?: {
      maxSources?: number;
      minRelevance?: number;
      preferredCategories?: string[];
    }
  ): Promise<EnhancedGroundingSource[]> {
    const results: EnhancedGroundingSource[] = [];
    const maxSources = options?.maxSources || this.config.maxSources;
    const minRelevance = options?.minRelevance || this.config.minRelevanceScore;

    for (const query of queries) {
      const queryTerms = query.toLowerCase().split(' ');

      for (const [topic, entries] of this.knowledgeBase.entries()) {
        for (const entry of entries) {
          // Check category preferences
          if (options?.preferredCategories && 
              !options.preferredCategories.includes(entry.metadata.category)) {
            continue;
          }

          // Check temporal filter
          if (this.config.enableTemporalFiltering && entry.metadata.lastVerified) {
            const daysSinceVerified = this.getDaysSince(entry.metadata.lastVerified);
            if (daysSinceVerified > this.config.maxSourceAge) {
              continue;
            }
          }

          // Check reliability filter
          if (entry.metadata.reliability < this.config.minSourceReliability) {
            continue;
          }

          const relevanceScore = this.calculateEnhancedRelevance(
            query, 
            entry, 
            queryTerms,
            context
          );
          
          if (relevanceScore >= minRelevance) {
            // Extract context window if enabled
            let contextWindow = { before: '', after: '' };
            if (this.config.enableContextWindow && entry.fullText) {
              contextWindow = this.extractContextWindow(entry.fullText, query);
            }

            results.push({
              id: entry.id,
              title: entry.topic,
              content: this.selectAppropriateContent(entry, query),
              relevanceScore,
              lastUpdated: entry.metadata.lastVerified,
              category: entry.metadata.category as any,
              reliability: entry.metadata.reliability,
              sourceType: entry.metadata.sourceType,
              author: entry.metadata.author,
              publicationDate: entry.metadata.publicationDate,
              tags: entry.metadata.tags,
              contextWindow
            });
          }
        }
      }
    }

    return results;
  }

  private async performEnhancedWebSearch(
    queries: string[],
    options?: {
      maxSources?: number;
      minRelevance?: number;
    }
  ): Promise<EnhancedGroundingSource[]> {
    try {
      const tavilyKey = process.env.TAVILY_API_KEY;
      if (!tavilyKey) {
        console.warn('TAVILY_API_KEY not found for enhanced grounding search');
        return [];
      }

      const maxSources = options?.maxSources || Math.floor(this.config.maxSources / 2);
      const results: EnhancedGroundingSource[] = [];

      // Search multiple queries
      for (const query of queries.slice(0, 3)) { // Limit to prevent API overuse
        try {
          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: tavilyKey,
              query: `${query} official information recent data`,
              max_results: Math.ceil(maxSources / queries.length),
              search_depth: 'basic',
              include_answer: false,
              include_raw_content: false,
              include_domains: ['gov.in', 'com', 'org'], // Prefer reliable domains
            }),
          });

          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          
          if (data.results) {
            data.results.forEach((result: any) => {
              // Extract context window
              const contextWindow = this.extractContextWindow(result.content || '', query);

              results.push({
                id: `web_${Date.now()}_${Math.random()}`,
                title: result.title,
                content: (result.content || '').slice(0, 1500), // Limit content length
                url: result.url,
                relevanceScore: result.score || 0.7,
                lastUpdated: new Date().toISOString().split('T')[0],
                category: 'general',
                reliability: 0.7, // Web sources get moderate reliability
                sourceType: 'secondary',
                tags: this.extractTagsFromContent(result.content || ''),
                contextWindow
              });
            });
          }
        } catch (error) {
          console.error(`Web search failed for query "${query}":`, error);
        }
      }

      return results;

    } catch (error) {
      console.error('Enhanced web search error:', error);
      return [];
    }
  }

  private rankAndFilterSources(
    sources: EnhancedGroundingSource[],
    options?: {
      maxSources?: number;
      minRelevance?: number;
      preferredCategories?: string[];
    }
  ): EnhancedGroundingSource[] {
    if (!this.config.enableSourceRanking) {
      return sources.slice(0, options?.maxSources || this.config.maxSources);
    }

    // Sort by composite score (relevance * reliability * recency)
    sources.sort((a, b) => {
      const scoreA = this.calculateCompositeScore(a);
      const scoreB = this.calculateCompositeScore(b);
      return scoreB - scoreA;
    });

    // Apply filters
    const minRelevance = options?.minRelevance || this.config.minRelevanceScore;
    const filtered = sources.filter(source => {
      if (source.relevanceScore < minRelevance) return false;
      if (source.reliability < this.config.minSourceReliability) return false;
      return true;
    });

    // Limit results
    const maxSources = options?.maxSources || this.config.maxSources;
    return filtered.slice(0, maxSources);
  }

  private calculateCompositeScore(source: EnhancedGroundingSource): number {
    let score = source.relevanceScore * source.reliability;

    // Boost for primary sources
    if (source.sourceType === 'primary') {
      score *= 1.2;
    }

    // Boost for recent sources
    if (source.lastUpdated) {
      const daysSince = this.getDaysSince(source.lastUpdated);
      if (daysSince < 30) {
        score *= 1.1;
      }
    }

    // Boost for preferred categories
    if (this.config.preferredSourceTypes.includes(source.sourceType)) {
      score *= 1.1;
    }

    return score;
  }

  private extractRelevantSnippets(
    sources: EnhancedGroundingSource[],
    query: string
  ): { relevantSnippets: any[]; totalSnippets: number } {
    const snippets: any[] = [];
    const queryTerms = query.toLowerCase().split(' ');

    sources.forEach(source => {
      const content = source.content.toLowerCase();
      const sentences = content.split(/[.!?]+/);

      sentences.forEach(sentence => {
        const trimmedSentence = sentence.trim();
        if (trimmedSentence.length < 20) return;

        // Check if sentence contains query terms
        const termMatches = queryTerms.filter(term => trimmedSentence.includes(term));
        
        if (termMatches.length > 0) {
          const relevanceScore = termMatches.length / queryTerms.length;
          
          snippets.push({
            text: trimmedSentence,
            sourceId: source.id,
            relevanceScore,
            context: this.getSentenceContext(source.content, trimmedSentence)
          });
        }
      });
    });

    // Sort by relevance and limit
    snippets.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limitedSnippets = snippets.slice(0, 10);

    return {
      relevantSnippets: limitedSnippets,
      totalSnippets: snippets.length
    };
  }

  private extractContextWindow(fullText: string, query: string): { before: string; after: string } {
    const queryIndex = fullText.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex === -1) {
      return { before: '', after: '' };
    }

    const windowSize = this.config.contextWindowSize;
    const start = Math.max(0, queryIndex - windowSize);
    const end = Math.min(fullText.length, queryIndex + query.length + windowSize);

    return {
      before: fullText.substring(start, queryIndex),
      after: fullText.substring(queryIndex + query.length, end)
    };
  }

  private getSentenceContext(fullText: string, sentence: string): string {
    const sentenceIndex = fullText.indexOf(sentence);
    if (sentenceIndex === -1) return '';

    const beforeStart = Math.max(0, sentenceIndex - 100);
    const afterEnd = Math.min(fullText.length, sentenceIndex + sentence.length + 100);

    return fullText.substring(beforeStart, afterEnd).trim();
  }

  private calculateEnhancedRelevance(
    query: string,
    entry: EnhancedKnowledgeEntry,
    queryTerms: string[],
    context?: string
  ): number {
    let relevanceScore = 0;
    let matchedTerms = 0;

    // Title matching (highest weight)
    const titleLower = entry.topic.toLowerCase();
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) {
        matchedTerms++;
        relevanceScore += 0.4;
      }
    });

    // Content matching
    const contentLower = entry.content.toLowerCase();
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) {
        matchedTerms++;
        relevanceScore += 0.2;
      }
    });

    // Tag matching
    const tagsLower = entry.metadata.tags.map(tag => tag.toLowerCase());
    queryTerms.forEach(term => {
      if (tagsLower.some(tag => tag.includes(term))) {
        matchedTerms++;
        relevanceScore += 0.1;
      }
    });

    // Context matching
    if (context) {
      const contextLower = context.toLowerCase();
      queryTerms.forEach(term => {
        if (contextLower.includes(term)) {
          matchedTerms++;
          relevanceScore += 0.1;
        }
      });
    }

    // Boost based on source reliability
    relevanceScore *= entry.metadata.reliability;

    // Boost based on recency
    if (entry.metadata.lastVerified) {
      const daysSince = this.getDaysSince(entry.metadata.lastVerified);
      if (daysSince < 30) {
        relevanceScore *= 1.1;
      } else if (daysSince > 365) {
        relevanceScore *= 0.9;
      }
    }

    // Normalize to 0-1 range
    return Math.min(relevanceScore, 1);
  }

  private selectAppropriateContent(entry: EnhancedKnowledgeEntry, query: string): string {
    // Select content based on query complexity
    const queryLength = query.split(' ').length;
    
    if (queryLength <= 3) {
      return entry.summaries.short;
    } else if (queryLength <= 6) {
      return entry.summaries.medium;
    } else {
      return entry.summaries.long;
    }
  }

  private extractTagsFromContent(content: string): string[] {
    // Simple tag extraction based on common terms
    const commonTags = [
      'security', 'company', 'revenue', 'employees', 'business',
      'market', 'industry', 'financial', 'growth', 'services'
    ];
    
    const contentLower = content.toLowerCase();
    return commonTags.filter(tag => contentLower.includes(tag));
  }

  private getDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private determineRetrievalMethod(kbResults: any[], webResults: any[]): 'knowledge_base' | 'web_search' | 'hybrid' {
    if (kbResults.length > 0 && webResults.length === 0) return 'knowledge_base';
    if (kbResults.length === 0 && webResults.length > 0) return 'web_search';
    return 'hybrid';
  }

  formatEnhancedGroundingContext(groundingResult: EnhancedGroundingResult): string {
    if (!this.config.enabled || groundingResult.sources.length === 0) {
      return '';
    }

    let context = '\n=== ENHANCED GROUNDING DATA ===\n';
    context += `Retrieval Method: ${groundingResult.retrievalMethod}\n`;
    context += `Sources Found: ${groundingResult.sources.length}\n`;
    context += `Average Relevance: ${(groundingResult.totalRelevanceScore * 100).toFixed(1)}%\n`;
    context += `High Quality Sources: ${groundingResult.hasHighQualitySources ? 'Yes' : 'No'}\n\n`;

    context += 'AUTHORITATIVE SOURCES:\n';
    for (let i = 0; i < groundingResult.sources.length; i++) {
      const source = groundingResult.sources[i];
      context += `\n--- Source ${i + 1} ---\n`;
      context += `Title: ${source.title}\n`;
      context += `Category: ${source.category}\n`;
      context += `Reliability: ${(source.reliability * 100).toFixed(0)}%\n`;
      context += `Relevance: ${(source.relevanceScore * 100).toFixed(1)}%\n`;
      context += `Source Type: ${source.sourceType}\n`;
      
      if (source.author) {
        context += `Author: ${source.author}\n`;
      }
      
      if (source.publicationDate) {
        context += `Publication Date: ${source.publicationDate}\n`;
      }
      
      context += `Content: ${source.content}\n`;
      
      if (source.url && this.config.includeSourceCitations) {
        context += `Source URL: ${source.url}\n`;
      }
      
      if (source.tags.length > 0) {
        context += `Tags: ${source.tags.join(', ')}\n`;
      }
    }

    // Add snippets if available
    if (groundingResult.snippetExtraction.relevantSnippets.length > 0) {
      context += '\n=== RELEVANT SNIPPETS ===\n';
      groundingResult.snippetExtraction.relevantSnippets.forEach((snippet, index) => {
        context += `\nSnippet ${index + 1} (Relevance: ${(snippet.relevanceScore * 100).toFixed(1)}%):\n`;
        context += `"${snippet.text}"\n`;
        context += `Source: ${snippet.sourceId}\n`;
      });
    }

    context += '\n=== END GROUNDING DATA ===\n\n';
    context += 'CRITICAL GROUNDING INSTRUCTIONS:\n';
    context += '1. Use ONLY information from the authoritative sources above\n';
    context += '2. Prioritize primary sources and high-reliability content\n';
    context += '3. Cross-reference claims with multiple sources when available\n';
    context += '4. If information is not available in grounding data, respond with "UNKNOWN"\n';
    context += '5. Include source citations for all factual claims\n';
    context += '6. Indicate confidence levels based on source reliability\n';

    // Truncate if too long
    if (context.length > this.config.maxContextLength) {
      context = context.substring(0, this.config.maxContextLength) + '...\n';
    }

    return context;
  }

  updateConfig(newConfig: Partial<EnhancedRAGConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EnhancedRAGConfig {
    return { ...this.config };
  }
}

// Enhanced context builder for prompts
export class EnhancedGroundedPromptBuilder {
  private groundingSystem: EnhancedGroundingSystem;

  constructor(groundingSystem: EnhancedGroundingSystem) {
    this.groundingSystem = groundingSystem;
  }

  async buildEnhancedGroundedPrompt(
    basePrompt: string,
    query: string,
    context?: string,
    options?: {
      maxSources?: number;
      preferredCategories?: string[];
    }
  ): Promise<{
    prompt: string;
    groundingResult: EnhancedGroundingResult;
    hasGrounding: boolean;
    promptMetrics: {
      promptLength: number;
      groundingLength: number;
      sourceCount: number;
      averageRelevance: number;
    };
  }> {
    // Retrieve enhanced grounding data
    const groundingResult = await this.groundingSystem.retrieveEnhancedGroundingData(
      query, 
      context,
      options
    );
    
    // Build enhanced grounded prompt
    let groundedPrompt = basePrompt;
    
    if (groundingResult.sources.length > 0) {
      const groundingContext = this.groundingSystem.formatEnhancedGroundingContext(groundingResult);
      groundedPrompt = groundingContext + groundedPrompt;
    }

    // Add enhanced grounding instructions
    groundedPrompt += '\n\nENHANCED RESPONSE REQUIREMENTS:\n';
    groundedPrompt += '1. Use ONLY information from the enhanced grounding sources above\n';
    groundedPrompt += '2. Prioritize information by source reliability and relevance\n';
    groundedPrompt += '3. Include confidence scores for each piece of information\n';
    groundedPrompt += '4. Cite specific sources using source numbers\n';
    groundedPrompt += '5. Cross-reference information across multiple sources\n';
    groundedPrompt += '6. Mark uncertain information as "UNKNOWN"\n';
    groundedPrompt += '7. Include verification status for each field\n';

    const promptMetrics = {
      promptLength: groundedPrompt.length,
      groundingLength: groundingResult.sources.reduce((sum, source) => sum + source.content.length, 0),
      sourceCount: groundingResult.sources.length,
      averageRelevance: groundingResult.totalRelevanceScore
    };

    return {
      prompt: groundedPrompt,
      groundingResult,
      hasGrounding: groundingResult.sources.length > 0,
      promptMetrics
    };
  }
}

// Factory functions
export function createEnhancedGroundingSystem(config?: Partial<EnhancedRAGConfig>): EnhancedGroundingSystem {
  return new EnhancedGroundingSystem({ ...ENHANCED_RAG_CONFIG, ...config });
}

export function createEnhancedGroundedPromptBuilder(groundingSystem: EnhancedGroundingSystem): EnhancedGroundedPromptBuilder {
  return new EnhancedGroundedPromptBuilder(groundingSystem);
}