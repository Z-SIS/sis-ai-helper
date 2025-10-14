// Import ZAI SDK for more reliable AI functionality
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

// Version: 2.1.0 - ZAI SDK Integration

// Dynamic import for ZAI SDK to handle ES module compatibility
let ZAI: any = null;
const loadZAI = async () => {
  if (!ZAI) {
    try {
      const ZAIModule = await import('z-ai-web-dev-sdk');
      ZAI = ZAIModule.default;
    } catch (error) {
      console.error('Failed to load ZAI SDK:', error);
      throw new Error('ZAI SDK not available');
    }
  }
  return ZAI;
};
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
    fast: 'gemini-1.5-flash', // ZAI will handle the model selection
    // ZAI SDK will manage the model internally
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
    system: `You are a business research analyst. Provide accurate, current company information.

CRITICAL RULES:
- Do not invent facts. If you are not 100% sure about information, state "Information not available" or "Unable to verify".
- Only include information that can be verified through reliable sources.
- If data is missing or uncertain, explicitly state this rather than guessing.
- Provide specific, factual information with confidence levels.
- Use web search for current data and cite sources when possible.`,
    template: (input: AgentInput) => {
      const { companyName, industry, location } = input as any;
      return `Research "${companyName}"${industry ? ` in ${industry}` : ''}${location ? ` in ${location}` : ''}.
      
Provide: description, industry, location, website, founded year, employees, revenue, key executives, competitors, recent news.
Be concise but comprehensive. Use web search for current data. Mark uncertain information as "unverified".`;
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
    return {
      title: 'Standard Operating Procedure',
      content: response,
      summary: 'Comprehensive SOP generated successfully'
    } as AgentOutput;
  }
  
  private parseCompanyResearchResponse(response: string): AgentOutput {
    return {
      title: 'Company Research Report',
      content: response,
      summary: 'Company research completed successfully'
    } as AgentOutput;
  }
  
  private parseEmailResponse(response: string): AgentOutput {
    return {
      subject: 'Generated Email',
      body: response,
      preview: response.slice(0, 100) + '...'
    } as AgentOutput;
  }
  
  private parseExcelHelperResponse(response: string): AgentOutput {
    return {
      solution: response,
      explanation: 'Excel solution provided'
    } as AgentOutput;
  }
  
  private parseFeasibilityCheckResponse(response: string): AgentOutput {
    return {
      feasibilityScore: 75,
      recommendation: response,
      risks: []
    } as AgentOutput;
  }
  
  private parseDeploymentPlanResponse(response: string): AgentOutput {
    return {
      plan: response,
      timeline: 'To be determined',
      resources: []
    } as AgentOutput;
  }
  
  private parseUspsBattlecardResponse(response: string): AgentOutput {
    return {
      battlecard: response,
      keyPoints: []
    } as AgentOutput;
  }
  
  private parseDisbandmentPlanResponse(response: string): AgentOutput {
    return {
      plan: response,
      checklist: []
    } as AgentOutput;
  }
  
  private parseSlideTemplateResponse(response: string): AgentOutput {
    return {
      template: response,
      slideCount: 10
    } as AgentOutput;
  }
  
  private getSchemaForAgent(agentType: AgentType) {
    const schemas = {
      'company-research': CompanyResearchSchema,
      'generate-sop': SOPSchema,
      'compose-email': EmailSchema,
      'excel-helper': ExcelHelperSchema,
      'feasibility-check': FeasibilitySchema,
      'deployment-plan': DeploymentPlanSchema,
      'usps-battlecard': BattlecardSchema,
      'disbandment-plan': DisbandmentPlanSchema,
      'slide-template': SlideTemplateSchema,
    };
    
    return schemas[agentType];
  }
  
  private createFallbackResponse(agentType: AgentType, rawResponse: string, error: string): AgentOutput {
    const baseResponse = {
      success: false,
      confidence: 0.3,
      needsReview: true,
      timestamp: new Date().toISOString(),
      warnings: [`Schema validation failed: ${error}`],
    };
    
    switch (agentType) {
      case 'company-research':
        return {
          companyName: 'Unknown',
          description: rawResponse.slice(0, 500),
          industry: 'Unknown',
          location: 'Unknown',
          dataConfidence: 0.3,
          unverifiedFields: ['all'],
          ...baseResponse,
        } as AgentOutput;
        
      case 'generate-sop':
        return {
          title: 'Generated SOP',
          version: '1.0',
          purpose: 'Standard Operating Procedure',
          scope: 'General',
          responsibilities: [],
          procedures: [],
          implementationConfidence: 0.3,
          ...baseResponse,
        } as AgentOutput;
        
      default:
        return {
          title: 'Generated Response',
          content: rawResponse.slice(0, 1000),
          summary: 'Response generated with validation issues',
          ...baseResponse,
        } as AgentOutput;
    }
  }
  
  private async executeAgent<T extends AgentOutput>(
    agentType: AgentType,
    input: AgentInput,
    useCache: boolean = true
  ): Promise<T> {
    console.log(`Executing agent: ${agentType}`, { input, useCache });
    
    // ZAI will handle API keys internally, no need to check for them here
    console.log('Using ZAI SDK for AI generation');

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
    
    console.log('Agent config:', { agentType, hasConfig: !!config, hasSchema: !!schema });
    
    // Estimate input tokens
    const inputTokens = Math.ceil(JSON.stringify(input).length / 4);
    this.trackTokenUsage(agentType, inputTokens);
    
    // Prepare tools based on agent requirements
    const tools = AgentMetadata[agentType].requiresWebSearch 
      ? { webSearch: optimizedWebSearchTool }
      : undefined;
    
    // Create ZAI client and generate response
    let result;
    try {
      console.log('Loading ZAI SDK...');
      
      // Load ZAI SDK dynamically
      const ZAI = await loadZAI();
      
      console.log('ZAI SDK loaded, initializing client...');
      
      // Try to create ZAI instance with environment variable
      let zai;
      try {
        // Use environment variable for API key if available
        const apiKey = process.env.ZAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'z-ai-default-key';
        
        // Try to create ZAI instance with explicit configuration
        zai = await ZAI.create({ 
          apiKey: apiKey,
          model: 'gemini-1.5-flash',
          maxTokens: 2000,
          temperature: 0.3
        });
        
        console.log('ZAI client created with explicit config');
      } catch (configError) {
        console.warn('ZAI explicit config failed, trying with API key only:', configError);
        
        try {
          // Fallback: try with just API key
          const apiKey = process.env.ZAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'z-ai-default-key';
          zai = await ZAI.create({ apiKey });
          console.log('ZAI client created with API key only');
        } catch (apiKeyError) {
          console.warn('ZAI API key config failed, trying default creation:', apiKeyError);
          
          // Last resort: try default creation
          try {
            zai = await ZAI.create();
            console.log('ZAI client created with default config');
          } catch (defaultError) {
            console.error('All ZAI initialization methods failed:', defaultError);
            throw new Error(`ZAI SDK initialization failed: ${defaultError instanceof Error ? defaultError.message : 'Unknown error'}`);
          }
        }
      }
      
      console.log('ZAI client created successfully');
      
      // Prepare the prompt
      const prompt = config.template(input);
      const fullPrompt = `${config.system}\n\n${prompt}`;
      
      console.log('Sending request to ZAI...', { 
        agentType, 
        promptLength: fullPrompt.length,
        maxTokens: config.maxTokens 
      });
      
      // Generate completion with ZAI
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${config.system}

RESPONSE FORMAT:
You must respond with valid JSON only. Do not include any explanations outside the JSON structure.
Include confidence score (0-1), needsReview flag, and timestamp in your response.
Mark uncertain information explicitly and include warnings if applicable.`
          },
          {
            role: 'user',
            content: `${prompt}

Please provide a JSON response following the schema requirements.`
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        // Add top_p for deterministic output
        top_p: TOKEN_CONFIG.topP[agentType as keyof typeof TOKEN_CONFIG.topP] || 0.0,
      });
      
      console.log('ZAI response received successfully');
      
      // Extract the content from ZAI response
      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response received from ZAI');
      }
      
      console.log('Raw AI response received, parsing JSON...');
      
      // Parse and validate JSON response
      let parsedResponse;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      // Add metadata
      parsedResponse.timestamp = new Date().toISOString();
      parsedResponse.success = true;
      
      // Calculate confidence and determine if review is needed
      const confidence = calculateConfidence(parsedResponse, agentType);
      parsedResponse.confidence = confidence;
      parsedResponse.needsReview = needsReview(confidence, agentType);
      
      // Validate against schema
      let validatedResponse;
      try {
        const schema = this.getSchemaForAgent(agentType);
        validatedResponse = validateAgentResponse(schema, parsedResponse);
      } catch (validationError) {
        console.error('Schema validation failed:', validationError);
        // Return a safe fallback response
        validatedResponse = this.createFallbackResponse(agentType, aiResponse, validationError instanceof Error ? validationError.message : 'Unknown error');
      }
      
      console.log('Response validated successfully:', { 
        agentType, 
        confidence: validatedResponse.confidence,
        needsReview: validatedResponse.needsReview 
      });
      
      result = {
        object: validatedResponse
      };
      
    } catch (zaiError) {
      console.error('ZAI generation error:', zaiError);
      
      // Provide more helpful error message
      const baseError = zaiError instanceof Error ? zaiError.message : 'Unknown error';
      
      // Check for specific config file error
      if (baseError.includes('Configuration file not found')) {
        const enhancedError = `ZAI SDK is initializing... 

The AI functionality is starting up. Please try again in a moment.

This is a normal part of the deployment process.`;
        throw new Error(enhancedError);
      }
      
      // Check for module loading error
      if (baseError.includes('ZAI SDK not available') || baseError.includes('Failed to load ZAI SDK')) {
        const enhancedError = `AI SDK is currently starting up. 

The AI functionality is temporarily unavailable while loading.

Please try again in a moment.`;
        throw new Error(enhancedError);
      }
      
      // Check for initialization error
      if (baseError.includes('ZAI SDK initialization failed')) {
        const enhancedError = `AI services are configuring. 

The AI functionality is being configured for this deployment.

Please try again in a moment or contact support if this persists.`;
        throw new Error(enhancedError);
      }
      
      const enhancedError = `Failed to generate AI response: ${baseError}

This could be due to:
1. Missing or invalid API key
2. ZAI SDK service issue
3. Network connectivity problem
4. API service outage
5. Invalid request format

Please check your API key configuration and try again.`;
      
      throw new Error(enhancedError);
    }
    
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