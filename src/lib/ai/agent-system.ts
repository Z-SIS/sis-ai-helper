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
    
    return {
      title: 'Company Research',
      content: response,
      summary: 'Company research completed'
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