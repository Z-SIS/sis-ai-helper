// Google AI Integration for reliable AI functionality
import { z } from 'zod';
import { 
  validateAgentResponse, 
  calculateConfidence, 
  needsReview,
  CompanyResearchSchema,
  SOPSchema,
  EmailSchema,
  ExcelHelperSchema,
  FeasibilitySchema,
  DeploymentPlanSchema,
  BattlecardSchema,
  DisbandmentPlanSchema,
  SlideTemplateSchema
} from '@/lib/ai/schema-validation';

// Version: 2.1.0 - Google AI Only

// Google AI is the primary AI service
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    fast: 'gemini-1.5-flash', // Google AI model
  },
  
  // Token limits based on agent complexity
  maxTokens: {
    simple: 800,    // Email, Excel helper
    medium: 1500,   // SOP, Battlecard, Slide template
    complex: 2000,  // Company research, Feasibility, Deployment, Disbandment
  },
  
  // Temperature settings for deterministic outputs (production-ready)
  temperature: {
    factual: 0.0,   // Company research - deterministic for accuracy
    structured: 0.0, // SOP, Deployment, Disbandment - structured outputs
    balanced: 0.1,  // Feasibility, Battlecard - minimal creativity
    creative: 0.2,  // Email, Slide template - limited creativity
  },
  
  // Top_p settings for deterministic outputs
  topP: {
    factual: 0.0,   // Company research - most deterministic
    structured: 0.0, // SOP, Deployment, Disbandment - structured
    balanced: 0.1,  // Feasibility, Battlecard - slightly flexible
    creative: 0.2,  // Email, Slide template - minimal flexibility
  },
} as const;

// ============================================================================
// OPTIMIZED PROMPT TEMPLATES
// ============================================================================

const PROMPT_TEMPLATES = {
  'company-research': {
    system: `You are a business research analyst. Provide accurate, current company information in JSON format.

CRITICAL RULES:
- Do not invent facts. If you are not 100% sure about information, state "Information not available" or "Unable to verify".
- Only include information that can be verified through reliable sources.
- Provide specific, factual information with confidence levels.
- Use web search for current data and cite sources when possible.
- Return valid JSON only - no explanations outside the JSON structure.

REQUIRED JSON FORMAT:
{
  "companyName": "string",
  "industry": "string", 
  "location": "string",
  "description": "string",
  "website": "string (valid URL)",
  "foundedYear": number (optional),
  "employeeCount": "string OR object with count field",
  "revenue": "string OR object with amount field",
  "keyExecutives": [{"name": "string", "title": "string"}] (optional),
  "competitors": ["string"] (optional),
  "recentNews": [{"title": "string", "summary": "string", "date": "YYYY-MM-DD"}] (optional),
  "dataConfidence": number (0-1, optional),
  "unverifiedFields": ["string"] (optional),
  "confidenceScore": number (0-1, optional),
  "needsReview": boolean (optional),
  "lastUpdated": "YYYY-MM-DD",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ" (optional)
}`,
    template: (input: AgentInput) => {
      const { companyName, industry, location } = input as any;
      return `Research "${companyName}"${industry ? ` in ${industry}` : ''}${location ? ` in ${location}` : ''}.
      
Provide comprehensive company information in the required JSON format.
Include: description, industry, location, website, founded year, employees, revenue, key executives, competitors, recent news.
Be concise but comprehensive. Use web search for current data. Mark uncertain information as "unverified".
Include confidence score (0-1) and list any unverified fields. Use current date for lastUpdated field.`;
    },
    maxTokens: TOKEN_CONFIG.maxTokens.complex,
    temperature: TOKEN_CONFIG.temperature.factual,
  },
  
  'generate-sop': {
    system: `You are a process documentation expert. Create clear, actionable SOPs.

CRITICAL RULES:
- Create practical, step-by-step procedures that can be realistically implemented.
- Do not invent requirements or regulations that don't exist.
- If specific industry standards are unknown, provide general best practices.
- Include clear responsibilities and measurable outcomes.
- Structure content in a logical, easy-to-follow format.`,
    template: (input: AgentInput) => {
      const { processName, department, purpose, scope } = input as any;
      return `Create SOP for "${processName}"${department ? ` (${department})` : ''}.
${purpose ? `Purpose: ${purpose}` : ''}
${scope ? `Scope: ${scope}` : ''}

Include: title, version, purpose, scope, responsibilities, step-by-step procedures with owners, references.
Make it practical and easy to follow. Use standard business practices and avoid inventing unnecessary complexity.`;
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
        keyLength: tavilyKey ? tavilyKey.length : 0,
        nodeEnv: process.env.NODE_ENV
      });
      
      if (!tavilyKey) {
        console.warn('TAVILY_API_KEY not found. Using mock search for development.');
        
        // For local development, provide mock search results for common companies
        if (process.env.NODE_ENV === 'development') {
          return provideMockSearchResults(query, maxResults);
        }
        
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
      
      // For development, provide mock results on error
      if (process.env.NODE_ENV === 'development') {
        console.log('Providing mock search results due to error in development');
        return provideMockSearchResults(query, maxResults);
      }
      
      return [];
    }
  },
};

// Mock search results for development/testing
function provideMockSearchResults(query: string, maxResults: number = 3): any[] {
  const lowerQuery = query.toLowerCase();
  
  // Mock data for well-known companies
  const mockData: Record<string, any[]> = {
    'apple': [
      {
        title: 'Apple Inc. - Official Website',
        url: 'https://www.apple.com',
        content: 'Apple Inc. is an American multinational technology company headquartered in Cupertino, California. Apple is the world\'s largest technology company by revenue and has been the world\'s most valuable company since August 2018.',
        score: 0.95
      },
      {
        title: 'Apple Inc. - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Apple_Inc.',
        content: 'Apple Inc. is an American multinational technology company that specializes in consumer electronics, computer software, and online services. Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in April 1976.',
        score: 0.90
      },
      {
        title: 'Apple (AAPL) Stock Price & News',
        url: 'https://finance.yahoo.com/quote/AAPL',
        content: 'Apple Inc. (AAPL) stock price, news, and financial information. Market cap: $2.9 trillion. Employees: 164,000. Revenue: $383.3 billion (2023).',
        score: 0.88
      }
    ],
    'microsoft': [
      {
        title: 'Microsoft - Official Website',
        url: 'https://www.microsoft.com',
        content: 'Microsoft Corporation is an American multinational technology corporation headquartered in Redmond, Washington. Microsoft develops, manufactures, licenses, and supports software products and services.',
        score: 0.95
      },
      {
        title: 'Microsoft - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Microsoft',
        content: 'Microsoft Corporation was founded by Bill Gates and Paul Allen on April 4, 1975. Microsoft is the largest software company in the world and one of the most valuable companies globally.',
        score: 0.90
      }
    ],
    'google': [
      {
        title: 'Google - Official Website',
        url: 'https://about.google',
        content: 'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and artificial intelligence. Founded in 1998 by Larry Page and Sergey Brin.',
        score: 0.95
      }
    ]
  };
  
  // Check if query matches any mock data
  for (const [key, results] of Object.entries(mockData)) {
    if (lowerQuery.includes(key)) {
      console.log(`Providing mock search results for query: ${query}`);
      return results.slice(0, maxResults);
    }
  }
  
  // Generic mock result for unknown companies
  console.log(`Providing generic mock search results for query: ${query}`);
  return [
    {
      title: `${query} - Company Information`,
      url: 'https://example.com/company',
      content: `This is mock search result data for "${query}" in development mode. In production, this would be replaced with real search results from Tavily API.`,
      score: 0.5
    }
  ];
}

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
// GOOGLE AI AGENT HANDLERS
// ============================================================================

class GoogleAIAgentSystem {
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
  
  private parseAIResponse(aiResponse: string, agentType: AgentType): AgentOutput {
    try {
      // For different agent types, parse the response appropriately
      switch (agentType) {
        case 'generate-sop':
          return this.parseSOPResponse(aiResponse);
        case 'company-research':
          return this.parseCompanyResearchResponse(aiResponse);
        case 'compose-email':
          return this.parseEmailResponse(aiResponse);
        case 'excel-helper':
          return this.parseExcelHelperResponse(aiResponse);
        case 'feasibility-check':
          return this.parseFeasibilityCheckResponse(aiResponse);
        case 'deployment-plan':
          return this.parseDeploymentPlanResponse(aiResponse);
        case 'usps-battlecard':
          return this.parseUspsBattlecardResponse(aiResponse);
        case 'disbandment-plan':
          return this.parseDisbandmentPlanResponse(aiResponse);
        case 'slide-template':
          return this.parseSlideTemplateResponse(aiResponse);
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a basic response structure
      return {
        title: 'Generated Response',
        content: aiResponse,
        summary: 'AI response generated successfully'
      } as AgentOutput;
    }
  }
  
  private parseSOPResponse(response: string): AgentOutput {
    // Generate a proper SOP structure from the response
    const lines = response.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#\s*/, '') || 'Standard Operating Procedure';
    
    return {
      title,
      content: response,
      summary: `SOP document generated with ${lines.length} sections`,
      sections: lines.map((line, index) => ({
        id: `section-${index}`,
        title: line.replace(/^#+\s*/, ''),
        content: line
      }))
    } as AgentOutput;
  }
  
  private parseCompanyResearchResponse(response: string): AgentOutput {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        // Add lastUpdated if missing
        if (!data.lastUpdated) {
          data.lastUpdated = new Date().toISOString().split('T')[0];
        }
        return {
          title: `Company Research: ${data.companyName || 'Unknown'}`,
          content: JSON.stringify(data, null, 2),
          summary: `Research completed for ${data.companyName || 'company'}`,
          data
        } as AgentOutput;
      }
    } catch (e) {
      // If JSON parsing fails, create a structured response from text
    }
    
    // Fallback response with current date
    const fallbackData = {
      lastUpdated: new Date().toISOString().split('T')[0],
      companyName: 'Unknown',
      industry: 'Not specified',
      location: 'Not specified',
      description: response.substring(0, 500) + '...',
    };
    
    return {
      title: 'Company Research',
      content: response,
      summary: 'Company research completed',
      data: fallbackData
    } as AgentOutput;
  }
  
  private parseEmailResponse(response: string): AgentOutput {
    const lines = response.split('\n');
    const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
    const subject = subjectLine?.replace(/subject:\s*/i, '') || 'Professional Email';
    
    return {
      title: subject,
      content: response,
      summary: 'Email drafted successfully'
    } as AgentOutput;
  }
  
  private parseExcelHelperResponse(response: string): AgentOutput {
    return {
      title: 'Excel Solution',
      content: response,
      summary: 'Excel help provided'
    } as AgentOutput;
  }
  
  private parseFeasibilityCheckResponse(response: string): AgentOutput {
    return {
      title: 'Feasibility Analysis',
      content: response,
      summary: 'Feasibility assessment completed'
    } as AgentOutput;
  }
  
  private parseDeploymentPlanResponse(response: string): AgentOutput {
    return {
      title: 'Deployment Plan',
      content: response,
      summary: 'Deployment plan created'
    } as AgentOutput;
  }
  
  private parseUspsBattlecardResponse(response: string): AgentOutput {
    return {
      title: 'Competitive Battlecard',
      content: response,
      summary: 'Battlecard generated'
    } as AgentOutput;
  }
  
  private parseDisbandmentPlanResponse(response: string): AgentOutput {
    return {
      title: 'Disbandment Plan',
      content: response,
      summary: 'Disbandment plan created'
    } as AgentOutput;
  }
  
  private parseSlideTemplateResponse(response: string): AgentOutput {
    return {
      title: 'Slide Template',
      content: response,
      summary: 'Slide template generated'
    } as AgentOutput;
  }
  
  // Mock AI processing for development when API keys are not available
  private processCompanyResearchWithMockAI(companyName: string, searchResults: any[], industry?: string, location?: string): AgentOutput {
    console.log('Processing company research with mock AI in development mode');
    
    // Extract information from search results
    const extractedData = this.extractCompanyInfoFromSearchResults(searchResults, companyName);
    
    const mockData = {
      companyName,
      industry: extractedData.industry || industry || 'Technology',
      location: extractedData.location || location || 'United States',
      description: extractedData.description || `${companyName} is a company in the ${industry || 'technology'} sector.`,
      website: extractedData.website || 'Information not available',
      foundedYear: extractedData.foundedYear || null,
      employeeCount: extractedData.employeeCount || 'Information not available',
      revenue: extractedData.revenue || 'Information not available',
      keyExecutives: extractedData.keyExecutives || [],
      competitors: extractedData.competitors || [],
      recentNews: extractedData.recentNews || [],
      dataConfidence: 0.7, // Medium confidence for mock data
      unverifiedFields: extractedData.unverifiedFields || [],
      confidenceScore: 0.7,
      needsReview: true,
      lastUpdated: new Date().toISOString().split('T')[0],
      sources: searchResults.map(result => ({
        title: result.title,
        url: result.url,
        reliability: 'medium' as const
      })),
      searchResultsCount: searchResults.length,
      searchPerformed: true,
      searchTimestamp: new Date().toISOString(),
      developmentMode: true
    };
    
    return {
      title: `Company Research: ${companyName}`,
      content: `Company research completed for ${companyName} using mock search results in development mode. In production, this would use real AI processing with Google Gemini.`,
      summary: `Mock research completed for ${companyName}`,
      data: mockData
    } as AgentOutput;
  }
  
  // Helper method to extract company information from search results
  private extractCompanyInfoFromSearchResults(searchResults: any[], companyName: string): any {
    const extracted = {
      industry: '',
      location: '',
      description: '',
      website: '',
      foundedYear: null as number | null,
      employeeCount: '',
      revenue: '',
      keyExecutives: [] as any[],
      competitors: [] as string[],
      recentNews: [] as any[],
      unverifiedFields: [] as string[]
    };
    
    // Combine all search content for analysis
    const allContent = searchResults.map(result => result.content).join(' ').toLowerCase();
    
    // Extract information based on common patterns
    for (const result of searchResults) {
      const content = result.content.toLowerCase();
      
      // Extract industry
      if (content.includes('technology') && !extracted.industry) {
        extracted.industry = 'Technology';
      } else if (content.includes('software') && !extracted.industry) {
        extracted.industry = 'Software';
      }
      
      // Extract location
      if (content.includes('cupertino, california') && !extracted.location) {
        extracted.location = 'Cupertino, California';
      } else if (content.includes('redmond, washington') && !extracted.location) {
        extracted.location = 'Redmond, Washington';
      }
      
      // Extract website
      if (result.url.includes('apple.com') && !extracted.website) {
        extracted.website = 'https://www.apple.com';
      } else if (result.url.includes('microsoft.com') && !extracted.website) {
        extracted.website = 'https://www.microsoft.com';
      } else if (result.url.includes('google.com') && !extracted.website) {
        extracted.website = 'https://about.google';
      }
      
      // Extract employee count
      const employeeMatch = content.match(/(\d{1,3}(,\d{3})*(\s*(million|thousand|k))?\s*employees)/);
      if (employeeMatch && !extracted.employeeCount) {
        extracted.employeeCount = employeeMatch[1];
      }
      
      // Extract revenue
      const revenueMatch = content.match(/\$(\d{1,3}(,\d{3})*(\s*(billion|million|trillion)))/);
      if (revenueMatch && !extracted.revenue) {
        extracted.revenue = `$${revenueMatch[1]}`;
      }
      
      // Extract founding year
      const yearMatch = content.match(/founded.*(\d{4})/);
      if (yearMatch && !extracted.foundedYear) {
        extracted.foundedYear = parseInt(yearMatch[1]);
      }
      
      // Extract description (use first substantial content)
      if (!extracted.description && result.content.length > 100) {
        extracted.description = result.content.substring(0, 200) + '...';
      }
    }
    
    // Mark fields that couldn't be verified
    if (!extracted.industry) extracted.unverifiedFields.push('industry');
    if (!extracted.location) extracted.unverifiedFields.push('location');
    if (!extracted.employeeCount) extracted.unverifiedFields.push('employeeCount');
    if (!extracted.revenue) extracted.unverifiedFields.push('revenue');
    if (!extracted.foundedYear) extracted.unverifiedFields.push('foundedYear');
    
    return extracted;
  }
  
  // Enhanced company research with real web search data
  private async handleCompanyResearchWithSearch(input: AgentInput): Promise<AgentOutput> {
    try {
      console.log('Starting company research with web search...');
      
      const { companyName, industry, location } = input as any;
      
      // Step 1: Search for real company data using Tavily
      const searchQueries = [
        `${companyName} company profile ${industry || ''} ${location || ''}`,
        `${companyName} employees revenue funding ${location || ''}`,
        `${companyName} recent news 2024`,
        `${companyName} competitors ${industry || ''}`
      ];
      
      let searchResults: any[] = [];
      
      for (const query of searchQueries) {
        try {
          const results = await optimizedWebSearchTool.execute({ query, maxResults: 3 });
          searchResults = [...searchResults, ...results];
        } catch (error) {
          console.warn(`Search failed for query: ${query}`, error);
        }
      }
      
      console.log(`Found ${searchResults.length} search results`);
      
      // Step 2: Process search results with Google AI
      if (searchResults.length > 0) {
        const searchContext = searchResults.map((result, index) => 
          `Source ${index + 1}: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
        ).join('\n\n');
        
        const researchPrompt = `Based on the following real-time search results, provide comprehensive company information for "${companyName}".

SEARCH RESULTS:
${searchContext}

CRITICAL REQUIREMENTS:
- Use ONLY the information from the search results above
- Do not invent or guess any information
- If information is not available in the search results, state "Information not available"
- Provide specific data points with sources
- Include confidence levels based on source reliability

REQUIRED JSON FORMAT:
{
  "companyName": "${companyName}",
  "industry": "string (from search results)",
  "location": "string (from search results)",
  "description": "string (from search results)",
  "website": "string (valid URL from search results)",
  "foundedYear": number (if found in search results),
  "employeeCount": "string or object (from search results)",
  "revenue": "string or object (from search results)",
  "keyExecutives": [{"name": "string", "title": "string"}] (if found),
  "competitors": ["string"] (if found),
  "recentNews": [{"title": "string", "summary": "string", "date": "YYYY-MM-DD", "url": "string"}] (if found),
  "dataConfidence": number (0-1, based on source quality),
  "unverifiedFields": ["string"] (fields that couldn't be verified),
  "confidenceScore": number (0-1, overall confidence),
  "needsReview": boolean (if data seems incomplete),
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "sources": [{"title": "string", "url": "string", "reliability": "high/medium/low"}]
}

Analyze the search results and provide accurate, factual information only.`;

        // Check if Google AI API key is available
        const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!googleApiKey) {
          console.warn('GOOGLE_GENERATIVE_AI_API_KEY not found. Using mock AI processing for development.');
          
          if (process.env.NODE_ENV === 'development') {
            return this.processCompanyResearchWithMockAI(companyName, searchResults, industry, location);
          }
          
          throw new Error('Google AI API key not configured');
        }
        
        // Initialize Google AI
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({ 
          model: TOKEN_CONFIG.models.fast,
          generationConfig: {
            temperature: 0.0, // Very low temperature for factual accuracy
            maxOutputTokens: TOKEN_CONFIG.maxTokens.complex,
            topP: 0.0,
          }
        });
        
        console.log('Processing search results with Google AI...');
        
        // Generate content with Google AI
        const result = await model.generateContent([
          { text: "You are a business research analyst. Process search results to extract accurate company information." },
          { text: researchPrompt }
        ]);
        
        const response = result.response;
        const text = response.text();
        
        if (!text) {
          throw new Error('No response received from Google AI');
        }
        
        console.log('Google AI processed search results, parsing response...');
        
        // Parse the response
        const parsedResponse = this.parseCompanyResearchResponse(text);
        
        // Add search results metadata
        if (parsedResponse.data) {
          (parsedResponse.data as any).searchResultsCount = searchResults.length;
          (parsedResponse.data as any).searchPerformed = true;
          (parsedResponse.data as any).searchTimestamp = new Date().toISOString();
        }
        
        // Cache the result
        const cacheKey = this.generateCacheKey('company-research', input);
        agentCache.set(cacheKey, parsedResponse, 60); // Cache for 1 hour
        
        return parsedResponse;
      } else {
        // No search results found - provide fallback response
        console.log('No search results found, providing fallback response');
        
        const fallbackData = {
          companyName,
          industry: industry || 'Information not available',
          location: location || 'Information not available',
          description: 'No current information found in search results',
          website: 'Information not available',
          employeeCount: 'Information not available',
          revenue: 'Information not available',
          lastUpdated: new Date().toISOString().split('T')[0],
          dataConfidence: 0.0,
          confidenceScore: 0.0,
          needsReview: true,
          unverifiedFields: ['all'],
          searchResultsCount: 0,
          searchPerformed: true,
          searchTimestamp: new Date().toISOString(),
          sources: []
        };
        
        return {
          title: `Company Research: ${companyName}`,
          content: `No current information found for "${companyName}" in web search. This could mean:\n\n1. The company name may be misspelled\n2. The company may not have significant online presence\n3. The company may be too new or private\n\nPlease verify the company name and try again.`,
          summary: `No search results found for ${companyName}`,
          data: fallbackData
        } as AgentOutput;
      }
      
    } catch (error) {
      console.error('Company research with search failed:', error);
      
      // Return error response
      return {
        title: 'Research Failed',
        content: `Failed to research company: ${error instanceof Error ? error.message : 'Unknown error'}`,
        summary: 'Company research failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          companyName: (input as any).companyName,
          lastUpdated: new Date().toISOString().split('T')[0],
          searchPerformed: false,
          error: true
        }
      } as AgentOutput;
    }
  }
  
  // Main method to handle agent requests using Google AI
  async handleAgentRequest(agentType: AgentType, input: AgentInput): Promise<AgentOutput> {
    try {
      console.log(`Handling ${agentType} request with Google AI`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(agentType, input);
      const cachedResult = agentCache.get(cacheKey);
      if (cachedResult) {
        console.log(`Returning cached result for ${agentType}`);
        return cachedResult;
      }
      
      // Special handling for company research - use web search first
      if (agentType === 'company-research') {
        return this.handleCompanyResearchWithSearch(input);
      }
      
      // Get the prompt template for this agent type
      const promptConfig = PROMPT_TEMPLATES[agentType];
      if (!promptConfig) {
        throw new Error(`No prompt template found for agent type: ${agentType}`);
      }
      
      // Build the prompt
      const systemPrompt = promptConfig.system;
      const userPrompt = promptConfig.template(input);
      
      // Check if Google AI API key is available
      const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!googleApiKey) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY not found in environment');
        throw new Error('Google AI API key not configured');
      }
      
      console.log('Google AI API Key found, initializing Google AI...');
      
      // Initialize Google AI
      const genAI = new GoogleGenerativeAI(googleApiKey);
      const model = genAI.getGenerativeModel({ 
        model: TOKEN_CONFIG.models.fast,
        generationConfig: {
          temperature: promptConfig.temperature,
          maxOutputTokens: promptConfig.maxTokens,
          topP: TOKEN_CONFIG.topP.factual,
        }
      });
      
      console.log('Google AI model initialized, sending request...');
      
      // Generate content with Google AI
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);
      
      console.log('Google AI response received successfully');
      
      // Extract the content from Google AI response
      const response = result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('No response received from Google AI');
      }
      
      console.log('Google AI response text extracted, parsing...');
      
      // Parse the AI response
      const parsedResponse = this.parseAIResponse(text, agentType);
      
      // Cache the result
      agentCache.set(cacheKey, parsedResponse, 30);
      
      // Track token usage (estimated)
      this.trackTokenUsage(agentType, text.length / 4); // Rough estimate
      
      return parsedResponse;
      
    } catch (error) {
      console.error(`Google AI generation error for ${agentType}:`, error);
      
      // Return a fallback response
      return {
        title: 'Error Processing Request',
        content: `We encountered an error while processing your ${agentType} request. Please try again later.`,
        summary: 'Request failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AgentOutput;
    }
  }
  
  // Get token usage statistics
  getTokenUsage() {
    return {
      ...this.tokenUsage,
      cacheStats: {
        size: agentCache['cache'].size,
        // Add other cache stats if needed
      }
    };
  }
  
  // Clear cache
  clearCache() {
    agentCache.clear();
  }
}

// Export the Google AI agent system
export const googleAIAgentSystem = new GoogleAIAgentSystem();

// Export the main handler function
export async function handleAgentRequest(agentType: AgentType, input: AgentInput): Promise<AgentOutput> {
  return googleAIAgentSystem.handleAgentRequest(agentType, input);
}

// Export utility functions
export { getTokenUsage, clearCache } from './agent-system';

function getTokenUsage() {
  return googleAIAgentSystem.getTokenUsage();
}

function clearCache() {
  googleAIAgentSystem.clearCache();
}