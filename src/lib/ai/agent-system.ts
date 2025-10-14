import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { 
  AgentInputSchemas, 
  AgentOutputSchemas,
  AgentMetadata,
  AgentInput,
  AgentOutput
} from '@/shared/schemas';
import { db } from '@/lib/supabase';

// Define AgentType locally to avoid circular dependencies
type AgentType = keyof typeof AgentInputSchemas;

// ============================================================================
// TOKEN OPTIMIZATION CONFIGURATION
// ============================================================================

const TOKEN_CONFIG = {
  // Model configurations for different complexity levels
  models: {
    fast: 'gemini-pro', // Store as string for lazy initialization
    // Using only gemini-pro as it's the most stable and widely available
  },
  
  // Token limits based on agent complexity
  maxTokens: {
    simple: 800,    // Email, Excel helper
    medium: 1500,   // SOP, Battlecard, Slide template
    complex: 2000,  // Company research, Feasibility, Deployment, Disbandment
  },
  
  // Temperature settings for consistency vs creativity
  temperature: {
    factual: 0.1,   // Company research
    structured: 0.3, // SOP, Deployment, Disbandment
    balanced: 0.4,  // Feasibility, Battlecard
    creative: 0.5,  // Email, Slide template
  },
} as const;

// ============================================================================
// OPTIMIZED PROMPT TEMPLATES
// ============================================================================

const PROMPT_TEMPLATES = {
  'company-research': {
    system: "You are a business research analyst. Provide accurate, current company information.",
    template: (input: AgentInput) => {
      const { companyName, industry, location } = input as any;
      return `Research "${companyName}"${industry ? ` in ${industry}` : ''}${location ? ` in ${location}` : ''}.
      
Provide: description, industry, location, website, founded year, employees, revenue, key executives, competitors, recent news.
Be concise but comprehensive. Use web search for current data.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.complex,
    temperature: TOKEN_CONFIG.temperature.factual,
  },
  
  'generate-sop': {
    system: "You are a process documentation expert. Create clear, actionable SOPs.",
    template: (input: AgentInput) => {
      const { processName, department, purpose, scope } = input as any;
      return `Create SOP for "${processName}"${department ? ` (${department})` : ''}.
${purpose ? `Purpose: ${purpose}` : ''}
${scope ? `Scope: ${scope}` : ''}

Include: title, version, purpose, scope, responsibilities, step-by-step procedures with owners, references.
Make it practical and easy to follow.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.medium,
    temperature: TOKEN_CONFIG.temperature.structured,
  },
  
  'compose-email': {
    system: "You are a professional email writer. Create effective, well-structured emails.",
    template: (input: AgentInput) => {
      const { recipient, subject, tone, purpose, keyPoints, callToAction } = input as any;
      return `Write ${tone} email to: ${recipient}
Subject: ${subject}
Purpose: ${purpose}
${keyPoints?.length ? `Key points: ${keyPoints.join(', ')}` : ''}
${callToAction ? `CTA: ${callToAction}` : ''}

Include proper greeting, body, closing. Keep it professional and effective.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.simple,
    temperature: TOKEN_CONFIG.temperature.creative,
  },
  
  'excel-helper': {
    system: "You are an Excel expert. Provide practical solutions with clear explanations.",
    template: (input: AgentInput) => {
      const { question, context, excelVersion } = input as any;
      return `Excel question: "${question}"
${context ? `Context: ${context}` : ''}
${excelVersion ? `Version: ${excelVersion}` : ''}

Provide: clear answer, formulas, step-by-step instructions, alternatives, tips.
Be practical and solution-oriented.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.simple,
    temperature: TOKEN_CONFIG.temperature.factual,
  },
  
  'feasibility-check': {
    system: "You are a project analyst. Conduct thorough feasibility assessments.",
    template: (input: AgentInput) => {
      const { projectName, description, budget, timeline, resources, constraints } = input as any;
      return `Analyze feasibility of: "${projectName}"
${description ? `Description: ${description}` : ''}
${budget ? `Budget: ${budget}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}
${resources?.length ? `Resources: ${resources.join(', ')}` : ''}
${constraints?.length ? `Constraints: ${constraints.join(', ')}` : ''}

Assess: technical, financial, resource feasibility. Provide score (0-100), risks, mitigations, recommendations.
Be analytical and comprehensive.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.complex,
    temperature: TOKEN_CONFIG.temperature.balanced,
  },
  
  'deployment-plan': {
    system: "You are a deployment specialist. Create detailed, actionable deployment plans.",
    template: (input: AgentInput) => {
      const { projectName, projectType, environment, teamSize, timeline } = input as any;
      return `Create deployment plan for: "${projectName}"
${projectType ? `Type: ${projectType}` : ''}
Environment: ${environment}
${teamSize ? `Team: ${teamSize} people` : ''}
${timeline ? `Timeline: ${timeline}` : ''}

Include: strategy, phases with tasks/dependencies, prerequisites, success criteria, monitoring, communication, rollback.
Make it practical and comprehensive.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.complex,
    temperature: TOKEN_CONFIG.temperature.structured,
  },
  
  'usps-battlecard': {
    system: "You are a competitive analyst. Create insightful battlecards for sales teams.",
    template: (input: AgentInput) => {
      const { companyName, competitor, productCategory, targetMarket } = input as any;
      return `Create battlecard: ${companyName} vs ${competitor}
${productCategory ? `Category: ${productCategory}` : ''}
${targetMarket ? `Market: ${targetMarket}` : ''}

Include: positioning comparison, strengths/weaknesses, differentiators, talking points, competitive advantages, actions.
Be strategic and sales-focused.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.medium,
    temperature: TOKEN_CONFIG.temperature.balanced,
  },
  
  'disbandment-plan': {
    system: "You are a project manager specializing in orderly project wind-downs.",
    template: (input: AgentInput) => {
      const { projectName, reason, timeline, stakeholders } = input as any;
      return `Create disbandment plan for: "${projectName}"
Reason: ${reason}
${timeline ? `Timeline: ${timeline}` : ''}
${stakeholders?.length ? `Stakeholders: ${stakeholders.join(', ')}` : ''}

Include: phases with tasks, asset distribution, knowledge transfer, legal considerations, communication, checklist.
Be thorough and methodical.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.complex,
    temperature: TOKEN_CONFIG.temperature.structured,
  },
  
  'slide-template': {
    system: "You are a presentation expert. Create engaging, well-structured slide content.",
    template: (input: AgentInput) => {
      const { topic, audience, purpose, slideCount, keyPoints } = input as any;
      return `Create slide template for: "${topic}"
${audience ? `Audience: ${audience}` : ''}
Purpose: ${purpose}
${slideCount ? `Slides: ${slideCount}` : ''}
${keyPoints?.length ? `Key points: ${keyPoints.join(', ')}` : ''}

Include: title/subtitle, slide content with titles/bullets, speaker notes, visual suggestions, tips, duration.
Make it engaging and well-structured.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.medium,
    temperature: TOKEN_CONFIG.temperature.creative,
  },
} as const;

// ============================================================================
// OPTIMIZED WEB SEARCH TOOL
// ============================================================================

const optimizedWebSearchTool = {
  description: 'Search for current, relevant information with optimized queries',
  parameters: z.object({
    query: z.string().describe('Optimized search query'),
    maxResults: z.number().min(1).max(5).default(3).describe('Maximum results (optimized for performance)'),
  }),
  execute: async ({ query, maxResults = 3 }: { query: string; maxResults?: number }) => {
    try {
      // Check if Tavily API key is available
      const tavilyKey = process.env.TAVILY_API_KEY;
      console.log('Tavily API Key Debug:', {
        hasTavilyKey: !!tavilyKey,
        keyLength: tavilyKey ? tavilyKey.length : 0
      });
      
      if (!tavilyKey) {
        console.warn('TAVILY_API_KEY not found. Web search functionality is disabled.');
        return [];
      }

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: maxResults,
          search_depth: 'basic', // Use basic depth for token optimization
          include_answer: false, // Skip AI-generated answers to save tokens
          include_raw_content: false, // Skip raw content to save tokens
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return optimized, concise results
      return data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content?.slice(0, 500) || '', // Limit content length
        score: result.score,
      })) || [];
    } catch (error) {
      console.error('Optimized web search error:', error);
      return [];
    }
  },
};

// ============================================================================
// CACHING SYSTEM
// ============================================================================

class AgentCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const agentCache = new AgentCache();

// ============================================================================
// OPTIMIZED AGENT HANDLERS
// ============================================================================

class OptimizedAgentSystem {
  // Token usage tracking
  private tokenUsage = {
    total: 0,
    byAgent: {} as Record<string, number>,
  };
  
  private generateCacheKey(agentType: string, input: AgentInput): string {
    return `${agentType}:${JSON.stringify(input)}`;
  }
  
  private trackTokenUsage(agentType: string, tokens: number): void {
    this.tokenUsage.total += tokens;
    this.tokenUsage.byAgent[agentType] = (this.tokenUsage.byAgent[agentType] || 0) + tokens;
  }
  
  private async executeAgent<T extends AgentOutput>(
    agentType: AgentType,
    input: AgentInput,
    useCache: boolean = true
  ): Promise<T> {
    // Check if Google API key is available (support both variable names)
    const generativeAIKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const genAIKey = process.env.GOOGLE_GENAI_API_KEY;
    const apiKey = generativeAIKey || genAIKey;
    
    console.log('API Key Debug:', {
      hasGenerativeAIKey: !!generativeAIKey,
      hasGenAIKey: !!genAIKey,
      usingKey: generativeAIKey ? 'GOOGLE_GENERATIVE_AI_API_KEY' : (genAIKey ? 'GOOGLE_GENAI_API_KEY' : 'none')
    });
    
    if (!apiKey) {
      throw new Error('Google AI API key not found. Please configure either GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_GENAI_API_KEY in your environment variables.');
    }

    const cacheKey = this.generateCacheKey(agentType, input);
    
    // Check cache first
    if (useCache) {
      const cached = agentCache.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${agentType}`);
        return cached;
      }
    }
    
    const config = PROMPT_TEMPLATES[agentType];
    const schema = AgentOutputSchemas[agentType];
    
    // Estimate input tokens
    const inputTokens = Math.ceil(JSON.stringify(input).length / 4);
    this.trackTokenUsage(agentType, inputTokens);
    
    // Prepare tools based on agent requirements
    const tools = AgentMetadata[agentType].requiresWebSearch 
      ? { webSearch: optimizedWebSearchTool }
      : undefined;
    
    // Create Google AI provider and model dynamically
    const googleProvider = google({
      apiKey: apiKey,
    });
    const model = googleProvider(TOKEN_CONFIG.models.fast as string);
    
    // Generate with error handling
    const result = await generateObject({
      model: model,
      system: config.system,
      prompt: config.template(input),
      schema: schema as any,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      tools,
    }).catch((error) => {
      console.error('AI model generation error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('not found') || error.message?.includes('not supported')) {
        throw new Error(`AI model not available or not supported. Please check your Google AI API configuration. Original error: ${error.message}`);
      }
      
      if (error.message?.includes('API key')) {
        throw new Error(`Google AI API key issue: ${error.message}`);
      }
      
      throw new Error(`AI generation failed: ${error.message}`);
    });
    
    const output = result.object as T;
    
    // Track output tokens
    const outputTokens = Math.ceil(JSON.stringify(output).length / 4);
    this.trackTokenUsage(agentType, outputTokens);
    
    // Cache the result
    if (useCache) {
      agentCache.set(cacheKey, output, 30); // 30 minutes cache
    }
    
    return output;
  }
  
  // Special handler for company research with database caching
  private async handleCompanyResearch(input: AgentInput): Promise<AgentOutput> {
    const { companyName } = input as any;
    
    // Check database cache first
    const isStale = await db.isCompanyResearchCacheStale(companyName);
    if (!isStale) {
      const cachedData = await db.getCompanyResearchCache(companyName);
      if (cachedData) {
        console.log(`Database cache hit for company: ${companyName}`);
        return cachedData.research_data;
      }
    }
    
    // Execute with optimized prompt
    const result = await this.executeAgent('company-research', input);
    
    // Update database cache
    try {
      await db.upsertCompanyResearchCache({
        company_name: companyName,
        industry: (result as any).industry,
        location: (result as any).location,
        description: (result as any).description,
        website: (result as any).website,
        founded_year: (result as any).foundedYear,
        employee_count: (result as any).employeeCount,
        revenue: (result as any).revenue,
        key_executives: (result as any).keyExecutives,
        competitors: (result as any).competitors,
        recent_news: (result as any).recentNews,
        research_data: result,
      });
    } catch (error) {
      console.warn('Failed to cache company research data:', error);
    }
    
    return result;
  }
  
  // Main execution method
  async executeAgentRequest(agentType: AgentType, input: AgentInput): Promise<AgentOutput> {
    try {
      // Special handling for company research
      if (agentType === 'company-research') {
        return await this.handleCompanyResearch(input);
      }
      
      // Standard execution for other agents
      return await this.executeAgent(agentType, input);
    } catch (error) {
      console.error(`Agent execution error for ${agentType}:`, error);
      throw error;
    }
  }
  
  // Get token usage statistics
  getTokenUsage() {
    return {
      ...this.tokenUsage,
      cacheSize: agentCache['cache'].size,
    };
  }
  
  // Clear cache
  clearCache(): void {
    agentCache.clear();
  }
  
  // Cleanup expired cache entries
  cleanupCache(): void {
    agentCache.cleanup();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const optimizedAgentSystem = new OptimizedAgentSystem();

// Export individual handlers for backward compatibility
export const handleCompanyResearch = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('company-research', input);

export const handleSopGeneration = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('generate-sop', input);

export const handleEmailComposition = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('compose-email', input);

export const handleExcelHelper = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('excel-helper', input);

export const handleFeasibilityCheck = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('feasibility-check', input);

export const handleDeploymentPlan = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('deployment-plan', input);

export const handleUspsBattlecard = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('usps-battlecard', input);

export const handleDisbandmentPlan = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('disbandment-plan', input);

export const handleSlideTemplate = (input: AgentInput) => 
  optimizedAgentSystem.executeAgentRequest('slide-template', input);

// Export utilities
export { agentCache, TOKEN_CONFIG };