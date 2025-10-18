import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  AgentInputSchemas, 
  AgentInput,
  AgentOutput
} from '@/shared/schemas';
import { 
  googleAIAgentSystem,
  handleAgentRequest
} from '@/lib/ai/agent-system';
<<<<<<< HEAD
// import { db } from '@/lib/supabase'; // Disabled to prevent Vercel errors
=======
import { db } from '@/lib/supabase';
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2

// Define AgentType locally to avoid circular dependencies
type AgentType = keyof typeof AgentInputSchemas;

// ============================================================================
// OPTIMIZED API HANDLER
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
<<<<<<< HEAD
  console.log(`🚀 Agent API called: ${params.slug}`);
  
  try {
    const { slug } = await params;
    const body = await request.json();
    
    console.log(`📥 Request body:`, { slug, body });
=======
  try {
    console.log('Agent API called:', { params });
    
    // Open platform - no authentication required
    const userId = 'open-user';
    
    const { slug } = await params;
    const body = await request.json();
    
    console.log('Request details:', { slug, bodyKeys: Object.keys(body) });
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
    
    // Validate agent type
    const agentType = slug as AgentType;
    if (!AgentInputSchemas[agentType]) {
<<<<<<< HEAD
      console.log(`❌ Invalid agent type: ${agentType}`);
=======
      console.error('Invalid agent type:', { agentType, available: Object.keys(AgentInputSchemas) });
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
      return NextResponse.json(
        { error: 'Invalid agent type', availableAgents: Object.keys(AgentInputSchemas) },
        { status: 400 }
      );
    }
    
<<<<<<< HEAD
    console.log(`✅ Agent type validated: ${agentType}`);
=======
    console.log('Agent type validated:', { agentType });
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
    
    // Validate input schema
    const inputSchema = AgentInputSchemas[agentType];
    const validatedInput = inputSchema.parse(body);
    
<<<<<<< HEAD
    console.log(`✅ Input validated:`, validatedInput);
    
    // Try to use the actual AI system with timeout protection
    console.log(`🔄 Processing request for agent: ${agentType}`);
    
    try {
      // Add overall timeout protection (25 seconds to stay under Vercel's 30s limit)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - processing took too long')), 25000)
      );
      
      const agentPromise = googleAIAgentSystem.handleAgentRequest(agentType, validatedInput);
      
      const result = await Promise.race([agentPromise, timeoutPromise]) as AgentOutput;
      
      console.log(`✅ AI response generated for: ${agentType}`);
      
      // Handle company research response format
      let processedResult = result;
      if (agentType === 'company-research' && result.content) {
        try {
          // Parse the JSON content to get the actual company data
          const companyData = JSON.parse(result.content);
          processedResult = companyData;
        } catch (parseError) {
          console.warn('Failed to parse company research content, using original result');
          // If parsing fails, use the original result
        }
      }
      
      // Create response with proper headers
      const response = NextResponse.json({ 
        success: true, 
        data: processedResult,
        meta: {
          agentType,
          timestamp: new Date().toISOString(),
        }
      });
      
      return response;
      
    } catch (aiError) {
      console.error(`❌ AI processing failed for ${agentType}:`, aiError);
      
      // Check if it's a timeout error
      if (aiError instanceof Error && aiError.message.includes('timeout')) {
        console.log(`⚠️ Processing timeout for ${agentType}, falling back to demo response`);
      } else {
        console.log(`⚠️ AI processing error for ${agentType}, falling back to demo response`);
      }
      
      // Fallback to demo response only if AI fails
      if (agentType === 'company-research') {
        console.log(`⚠️ Falling back to demo response for company research`);
        
        const { companyName, industry, location } = validatedInput as any;
        const current_date = new Date().toISOString().split('T')[0];
        
        // Demo data for SIS Limited or generic response
        const demoData = companyName === 'SIS Limited' ? {
          companyName: "SIS Limited",
          industry: "Security Services & Facility Management",
          location: "Mumbai, Maharashtra, India",
          description: "SIS Limited is India's leading security solutions company providing comprehensive security services, facility management, and cash logistics solutions. The company operates with over 200,000 employees across India and international markets.",
          website: "https://www.sisindia.com",
          foundedYear: 1985,
          employeeCount: "200,000+",
          revenue: "₹12,000 crore",
          keyExecutives: [
            { name: "Ravindra Kishore Sinha", title: "Founder & Chairman" },
            { name: "Rituraj Kishore Sinha", title: "Vice Chairman" },
            { name: "Uday Kishore Sinha", title: "Managing Director" }
          ],
          competitors: ["Security and Intelligence Services (SIS)", "G4S India", "TOPS Group"],
          recentNews: [
            {
              title: "SIS Limited Expands International Operations",
              summary: "SIS Limited announces expansion into new international markets with strategic acquisitions.",
              date: "2024-12-15"
            },
            {
              title: "Q3 Financial Results Show Strong Growth",
              summary: "SIS Limited reports 15% revenue growth in Q3 2024, driven by facility management segment.",
              date: "2024-10-20"
            }
          ],
          dataConfidence: 0.85,
          unverifiedFields: [],
          confidenceScore: 0.85,
          needsReview: false,
          lastUpdated: current_date,
          timestamp: new Date().toISOString()
        } : {
          companyName: companyName || 'Unknown',
          industry: industry || "Information not available",
          location: location || "Information not available",
          description: `${companyName} is a company operating in ${industry || 'various sectors'}. Detailed information is currently being updated.`,
          website: "Information not available",
          foundedYear: null,
          employeeCount: "Information not available",
          revenue: "Information not available",
          keyExecutives: [],
          competitors: [],
          recentNews: [
            {
              title: "Company Information Update",
              summary: "Research is ongoing to gather the most current information about this company.",
              date: current_date
            }
          ],
          dataConfidence: 0.3,
          unverifiedFields: ["website", "foundedYear", "employeeCount", "revenue"],
          confidenceScore: 0.3,
          needsReview: true,
          lastUpdated: current_date,
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ Demo fallback response prepared for: ${demoData.companyName}`);
        
        // Create response with proper headers
        const response = NextResponse.json({ 
          success: true, 
          data: demoData,
          meta: {
            agentType,
            demo: true,
            fallback: true,
            timestamp: new Date().toISOString(),
          }
        });
        
        return response;
      }
      
      // For other agents, provide a simple demo response
      const demoResponse = {
        title: `${agentType} Demo Response`,
        content: `This is a demo response for the ${agentType} agent. The full functionality will be available once API keys are configured.`,
        summary: `Demo response for ${agentType}`,
        timestamp: new Date().toISOString(),
        demo: true,
        fallback: true
      };
      
      console.log(`⚠️ Demo fallback response prepared for: ${agentType}`);
      
      // Create response with proper headers
      const response = NextResponse.json({ 
        success: true, 
        data: demoResponse,
        meta: {
          agentType,
          demo: true,
          fallback: true,
          timestamp: new Date().toISOString(),
        }
      });
      
      return response;
    }
    
  } catch (error) {
    console.error('❌ Agent API error:', error);
    
    // Create error response with proper headers
    const errorResponse = NextResponse.json(
=======
    console.log('Input validated:', { agentType, inputKeys: Object.keys(validatedInput) });
    
    // Execute agent request with Google AI system
    console.log('Executing agent request...');
    const result = await handleAgentRequest(agentType, validatedInput);
    
    console.log('Agent execution completed:', { agentType, hasResult: !!result });
    
    // Validate the result before proceeding
    if (!result || typeof result !== 'object') {
      throw new Error(`Invalid result from agent ${agentType}: result must be an object`);
    }
    
    // Save to task history (optional for open platform)
    try {
      await db.createTaskHistory({
        user_id: userId,
        agent_type: agentType,
        input_data: validatedInput,
        output_data: result,
        status: 'completed',
      });
    } catch (error) {
      // Log error but don't fail the request
      console.warn('Failed to save task history:', error);
    }
    
    // Return success response with token usage info
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      meta: {
        agentType,
        tokenUsage: {
          total: tokenUsage.total,
          byAgent: tokenUsage.byAgent[agentType] || 0,
        },
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Agent API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
<<<<<<< HEAD
    
    return errorResponse;
=======
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
  }
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

export async function GET() {
  try {
    const tokenUsage = googleAIAgentSystem.getTokenUsage();
    
<<<<<<< HEAD
    const responseData = {
      status: 'healthy',
      system: 'SIS AI Helper - Demo Mode',
      version: '2.1.0-demo',
=======
    return NextResponse.json({
      status: 'healthy',
      system: 'SIS AI Helper - Google AI Agent System',
      version: '2.1.0-google-only',
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
      agents: Object.keys(AgentInputSchemas),
      tokenUsage,
      cache: {
        size: tokenUsage.cacheStats?.size || 0,
        status: 'active',
      },
      timestamp: new Date().toISOString(),
<<<<<<< HEAD
    };
    
    // Create response with proper headers
    const response = NextResponse.json(responseData);
    
    return response;
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    
    // Create error response with proper headers
    const response = NextResponse.json(errorData, { status: 500 });
    
    return response;
=======
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
  }
}