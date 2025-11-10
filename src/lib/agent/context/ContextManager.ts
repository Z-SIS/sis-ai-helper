import { z } from 'zod';
import { AIAgent, AgentMessage } from '../core/AIAgent';
import { RAGSystem, RAGQuery, RAGResult } from '../rag/RAGSystem';
import { getZAISync } from '@/lib/ai/zai-compat';

// Context Schema
export const ContextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  conversationId: z.string(),
  currentTopic: z.string().optional(),
  userIntent: z.string().optional(),
  entities: z.record(z.any()).optional(),
  previousInteractions: z.array(z.any()).optional(),
  userPreferences: z.record(z.any()).optional(),
  systemState: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export type Context = z.infer<typeof ContextSchema>;

// Context Update Schema
export const ContextUpdateSchema = z.object({
  topic: z.string().optional(),
  intent: z.string().optional(),
  entities: z.record(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
  systemState: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export type ContextUpdate = z.infer<typeof ContextUpdateSchema>;

// Response Generation Schema
export const ResponseRequestSchema = z.object({
  query: z.string(),
  context: ContextSchema,
  agentCapabilities: z.array(z.string()),
  responseStyle: z.enum(['concise', 'detailed', 'conversational', 'professional']).default('conversational'),
  maxTokens: z.number().default(1000),
  temperature: z.number().default(0.7),
  includeSources: z.boolean().default(true)
});

export type ResponseRequest = z.infer<typeof ResponseRequestSchema>;

// Response Schema
export const ResponseSchema = z.object({
  content: z.string(),
  confidence: z.number(),
  sources: z.array(z.string()),
  suggestedActions: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  contextUpdates: z.record(z.any()),
  metadata: z.record(z.any())
});

export type Response = z.infer<typeof ResponseSchema>;

export class ContextManager {
  private contexts: Map<string, Context> = new Map();
  private ragSystem: RAGSystem;
  private zai: any;

  constructor() {
    this.ragSystem = new RAGSystem();
    this.initializeZAI();
  }

  private async initializeZAI(): Promise<void> {
    try {
      this.zai = getZAISync();
    } catch (error) {
      console.error('Failed to initialize ZAI:', error);
    }
  }

  // Context Management
  async createContext(userId: string, sessionId: string, conversationId?: string): Promise<Context> {
    const context: Context = {
      userId,
      sessionId,
      conversationId: conversationId || crypto.randomUUID(),
      previousInteractions: [],
      userPreferences: {},
      systemState: {},
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };

    this.contexts.set(context.conversationId, context);
    await this.saveContextToStorage(context);
    
    return context;
  }

  async getContext(conversationId: string): Promise<Context | null> {
    let context = this.contexts.get(conversationId);
    
    if (!context) {
  // Try to load from storage
  // Cast to any to avoid cross-module type-name collisions during incremental fixes
  context = (await this.loadContextFromStorage(conversationId)) as any;
      if (context) {
        this.contexts.set(conversationId, context);
      }
    }
    
    return context || null;
  }

  async updateContext(conversationId: string, update: ContextUpdate): Promise<Context | null> {
    const context = await this.getContext(conversationId);
    if (!context) {
      return null;
    }

    const updatedContext: Context = {
      ...context,
      currentTopic: update.topic || context.currentTopic,
      userIntent: update.intent || context.userIntent,
      entities: { ...context.entities, ...update.entities },
      userPreferences: { ...context.userPreferences, ...update.preferences },
      systemState: { ...context.systemState, ...update.systemState },
      metadata: { 
        ...context.metadata, 
        ...update.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    this.contexts.set(conversationId, updatedContext);
    await this.saveContextToStorage(updatedContext);
    
    return updatedContext;
  }

  async addInteraction(conversationId: string, interaction: {
    type: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
  }): Promise<Context | null> {
    const context = await this.getContext(conversationId);
    if (!context) {
      return null;
    }

    const interactionWithTimestamp = {
      ...interaction,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };

    const updatedContext: Context = {
      ...context,
      previousInteractions: [
        ...(context.previousInteractions || []),
        interactionWithTimestamp
      ].slice(-50), // Keep last 50 interactions
      metadata: {
        ...context.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    this.contexts.set(conversationId, updatedContext);
    await this.saveContextToStorage(updatedContext);
    
    return updatedContext;
  }

  // Context Analysis
  async analyzeIntent(query: string, context: Context): Promise<string> {
    const intentPrompt = `
      Analyze the user's intent based on their query and conversation context:

      Current Query: "${query}"
      Previous Topic: ${context.currentTopic || 'None'}
      Previous Intent: ${context.userIntent || 'None'}
      Recent Interactions: ${context.previousInteractions?.slice(-3).map((i: any) => i.content).join('; ') || 'None'}

      Determine the user's primary intent. Common intents include:
      - company_research: User wants information about a company
      - email_generation: User wants to create an email
      - document_generation: User wants to create a document
      - data_analysis: User wants to analyze data
      - general_question: User has a general question
      - task_help: User needs help with a task
      - conversation: User is engaging in conversation

      Respond with just the intent name.
    `;

    try {
      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an intent analysis expert. Determine the user\'s primary intent from the given information.'
          },
          {
            role: 'user',
            content: intentPrompt
          }
        ],
        temperature: 0.3,
        maxTokens: 50
      });

      return response.choices[0].message.content?.trim().toLowerCase() || 'general_question';
    } catch (error) {
      console.error('Failed to analyze intent:', error);
      return 'general_question';
    }
  }

  async extractEntities(query: string, context: Context): Promise<Record<string, any>> {
    const entityPrompt = `
      Extract key entities from the user's query:

      Query: "${query}"
      Context: ${JSON.stringify(context, null, 2)}

      Extract and return a JSON object with the following entities if present:
      - company_name: Name of any company mentioned
      - person_name: Name of any person mentioned
      - location: Any location mentioned
      - date: Any date or time mentioned
      - industry: Any industry mentioned
      - document_type: Type of document requested
      - email_recipient: Email recipient mentioned
      - action_required: Any specific action requested
      - keywords: Important keywords from the query

      Return only valid JSON.
    `;

    try {
      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an entity extraction expert. Extract structured information from user queries.'
          },
          {
            role: 'user',
            content: entityPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 200
      });

      const entitiesText = response.choices[0].message.content || '{}';
      return JSON.parse(entitiesText);
    } catch (error) {
      console.error('Failed to extract entities:', error);
      return {};
    }
  }

  // Response Generation
  async generateResponse(request: ResponseRequest): Promise<Response> {
    const { query, context, agentCapabilities, responseStyle, maxTokens, temperature, includeSources } = request;

    try {
      // Analyze intent and entities if not already present
      const intent = context.userIntent || await this.analyzeIntent(query, context);
      const entities = context.entities || await this.extractEntities(query, context);

      // Update context with new analysis
      await this.updateContext(context.conversationId, {
        intent,
        entities
      });

      // Build context-aware prompt
      const prompt = this.buildContextAwarePrompt(query, context, intent, entities, responseStyle, agentCapabilities);

      // Generate response
      const aiResponse = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(responseStyle, agentCapabilities)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        maxTokens
      });

      const content = aiResponse.choices[0].message.content || 'I apologize, but I was unable to generate a response.';

      // Extract additional information from response
      const suggestedActions = await this.extractSuggestedActions(content, intent);
      const followUpQuestions = await this.generateFollowUpQuestions(content, intent, context);
      const sources = includeSources ? await this.extractSources(content, context) : [];

      // Generate context updates
      const contextUpdates = await this.generateContextUpdates(content, intent, entities);

      return {
        content,
        confidence: 0.8,
        sources,
        suggestedActions,
        followUpQuestions,
        contextUpdates,
        metadata: {
          intent,
          entities,
          responseStyle,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Failed to generate response:', error);
      return {
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        confidence: 0.1,
        sources: [],
        suggestedActions: [],
        followUpQuestions: [],
        contextUpdates: {},
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  private buildContextAwarePrompt(
    query: string,
    context: Context,
    intent: string,
    entities: Record<string, any>,
    responseStyle: string,
    agentCapabilities: string[]
  ): string {
    const recentInteractions = context.previousInteractions?.slice(-3).map((i: any) => 
      `${i.type}: ${i.content}`
    ).join('\n') || 'None';

    return `
User Query: "${query}"

Conversation Context:
- Current Topic: ${context.currentTopic || 'None'}
- User Intent: ${intent}
- Session ID: ${context.sessionId}
- Previous Interactions: ${recentInteractions}
- User Preferences: ${JSON.stringify(context.userPreferences, null, 2)}

Extracted Entities: ${JSON.stringify(entities, null, 2)}

Available Capabilities: ${agentCapabilities.join(', ')}

Response Style: ${responseStyle}

Please provide a helpful, context-aware response that:
1. Directly addresses the user's query
2. Takes into account the conversation history
3. Uses the available capabilities when relevant
4. Maintains the requested response style
5. Provides actionable information when possible
`;
  }

  private getSystemPrompt(responseStyle: string, capabilities: string[]): string {
    const basePrompt = 'You are an intelligent AI assistant with access to various tools and capabilities. ';
    
    const stylePrompts = {
      concise: 'Provide brief, to-the-point responses.',
      detailed: 'Provide comprehensive, detailed responses with thorough explanations.',
      conversational: 'Be friendly, engaging, and conversational in your responses.',
      professional: 'Maintain a professional, formal tone in all responses.'
    };

    const capabilityPrompts = {
      company_research: 'You can research companies and provide detailed business information.',
      email_generation: 'You can generate professional emails for various purposes.',
      document_generation: 'You can create various types of documents.',
      data_analysis: 'You can analyze data and provide insights.',
      rag: 'You have access to a knowledge base with company research information.'
    };

    let prompt = basePrompt + stylePrompts[responseStyle as keyof typeof stylePrompts] + ' ';
    
    capabilities.forEach(cap => {
      if (capabilityPrompts[cap as keyof typeof capabilityPrompts]) {
        prompt += capabilityPrompts[cap as keyof typeof capabilityPrompts] + ' ';
      }
    });

    return prompt;
  }

  private async extractSuggestedActions(content: string, intent: string): Promise<string[]> {
    const actionsPrompt = `
      Based on the following AI response and user intent, suggest 2-3 actionable next steps:

      Response: "${content}"
      Intent: ${intent}

      Return a JSON array of suggested actions as strings.
    `;

    try {
      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an action suggestion expert. Provide actionable next steps based on AI responses.'
          },
          {
            role: 'user',
            content: actionsPrompt
          }
        ],
        temperature: 0.5,
        maxTokens: 150
      });

      const actionsText = response.choices[0].message.content || '[]';
      return JSON.parse(actionsText);
    } catch (error) {
      console.error('Failed to extract suggested actions:', error);
      return [];
    }
  }

  private async generateFollowUpQuestions(content: string, intent: string, context: Context): Promise<string[]> {
    const questionsPrompt = `
      Based on the following AI response, user intent, and conversation context, generate 2-3 relevant follow-up questions:

      Response: "${content}"
      Intent: ${intent}
      Current Topic: ${context.currentTopic || 'None'}

      Return a JSON array of follow-up questions as strings.
    `;

    try {
      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a conversation expert. Generate relevant follow-up questions to continue the dialogue.'
          },
          {
            role: 'user',
            content: questionsPrompt
          }
        ],
        temperature: 0.6,
        maxTokens: 150
      });

      const questionsText = response.choices[0].message.content || '[]';
      return JSON.parse(questionsText);
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
      return [];
    }
  }

  private async extractSources(content: string, context: Context): Promise<string[]> {
    // For now, return empty array. In a real implementation, this would
    // extract actual sources from the RAG system or other knowledge bases
    return [];
  }

  private async generateContextUpdates(content: string, intent: string, entities: Record<string, any>): Promise<Record<string, any>> {
    const updates: Record<string, any> = {};

    // Update topic based on content analysis
    if (entities.company_name) {
      updates.topic = `Company Research: ${entities.company_name}`;
    } else if (intent.includes('email')) {
      updates.topic = 'Email Generation';
    } else if (intent.includes('document')) {
      updates.topic = 'Document Generation';
    }

    // Update preferences based on interaction patterns
    updates.lastInteractionType = intent;
    updates.lastInteractionTime = new Date().toISOString();

    return updates;
  }

  // Storage Management
  private async saveContextToStorage(context: Context): Promise<void> {
    try {
      const storageKey = `context_${context.conversationId}`;
      localStorage.setItem(storageKey, JSON.stringify(context));
    } catch (error) {
      console.error('Failed to save context to storage:', error);
    }
  }

  private async loadContextFromStorage(conversationId: string): Promise<Context | null> {
    try {
      const storageKey = `context_${conversationId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return ContextSchema.parse(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load context from storage:', error);
    }
    return null;
  }

  // Cleanup and Maintenance
  async clearContext(conversationId: string): Promise<void> {
    this.contexts.delete(conversationId);
    try {
      const storageKey = `context_${conversationId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear context from storage:', error);
    }
  }

  async clearOldContexts(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    let clearedCount = 0;

    for (const [conversationId, context] of this.contexts.entries()) {
      const metadata = context.metadata || {};
      const lastUpdated = new Date(metadata.lastUpdated || metadata.createdAt || Date.now()).getTime();
      if (now - lastUpdated > maxAge) {
        await this.clearContext(conversationId);
        clearedCount++;
      }
    }

    return clearedCount;
  }

  async getContextStats(): Promise<{
    totalContexts: number;
    activeContexts: number;
    averageInteractions: number;
    storageSize: number;
  }> {
    const contexts = Array.from(this.contexts.values());
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const activeContexts = contexts.filter(context => {
      const metadata = context.metadata || {};
      const lastUpdated = new Date(metadata.lastUpdated || metadata.createdAt || Date.now()).getTime();
      return lastUpdated > oneHourAgo;
    }).length;

    const averageInteractions = contexts.length > 0 
      ? contexts.reduce((sum, context) => sum + (context.previousInteractions?.length || 0), 0) / contexts.length
      : 0;

    const storageSize = JSON.stringify(contexts).length;

    return {
      totalContexts: contexts.length,
      activeContexts,
      averageInteractions,
      storageSize
    };
  }
}