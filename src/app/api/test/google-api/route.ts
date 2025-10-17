import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify Google API functionality in Vercel environment
export async function POST(request: NextRequest) {
  console.log('🧪 Testing Google API call in Vercel environment...');
  
  try {
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    // Check environment variables
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log('🔑 Google API Key Status:', {
      hasKey: !!googleApiKey,
      keyLength: googleApiKey ? googleApiKey.length : 0,
      keyPrefix: googleApiKey ? googleApiKey.substring(0, 10) + '...' : 'null',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });
    
    if (!googleApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Google API key not configured',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          hasGoogleKey: false,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    // Test direct Google API calls
    console.log('📦 Testing direct Google API calls...');
    console.log('✅ Using direct Google API calls');
    
    // Test simple Google API call
    console.log('🤖 Testing simple Google API call...');
    const simpleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: 'Respond with exactly: "Google API connection successful"' }] }
          ]
        }),
      }
    );
    
    const simpleData = await simpleResponse.json();
    const simpleResult = simpleData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('✅ Simple API call result:', simpleResult);
    
    // Test company research call
    console.log('🏢 Testing company research API call...');
    const companyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { 
              parts: [{ 
                text: `You are a business research analyst. Provide company information in JSON format.
      
Required JSON format:
{
  "companyName": "string",
  "industry": "string",
  "location": "string",
  "description": "string",
  "website": "string",
  "foundedYear": number,
  "employeeCount": "string",
  "revenue": "string",
  "lastUpdated": "YYYY-MM-DD"
}

Research "Apple Inc." and provide the requested company information in the exact JSON format.` 
              }]
            }
          ]
        }),
      }
    );
    
    const companyData = await companyResponse.json();
    const companyResult = companyData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('✅ Company research result:', companyResult);
    
    // Parse the JSON response
    let parsedCompanyData = null;
    try {
      parsedCompanyData = JSON.parse(companyResult);
      console.log('✅ JSON parsed successfully:', parsedCompanyData);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('Raw response:', companyResult);
    }
    
    // Test Tavily API if available
    let tavilyResult = null;
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (tavilyKey) {
      console.log('🔍 Testing Tavily API...');
      try {
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: 'Apple Inc. company information',
            max_results: 2,
          }),
        });
        
        if (tavilyResponse.ok) {
          const tavilyData = await tavilyResponse.json();
          tavilyResult = {
            success: true,
            resultsCount: tavilyData.results?.length || 0,
            sampleResult: tavilyData.results?.[0] || null,
          };
          console.log('✅ Tavily API successful:', tavilyResult);
        } else {
          tavilyResult = {
            success: false,
            error: `HTTP ${tavilyResponse.status}`,
          };
          console.log('❌ Tavily API failed:', tavilyResponse.status);
        }
      } catch (tavilyError) {
        tavilyResult = {
          success: false,
          error: tavilyError instanceof Error ? tavilyError.message : 'Unknown error',
        };
        console.error('❌ Tavily API error:', tavilyError);
      }
    } else {
      console.log('⚠️ Tavily API key not found');
      tavilyResult = { success: false, error: 'API key not configured' };
    }
    
    // Return comprehensive test results
    return NextResponse.json({
      success: true,
      testResults: {
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          hasGoogleKey: !!googleApiKey,
          hasTavilyKey: !!tavilyKey,
        },
        googleApi: {
          simpleCall: {
            success: true,
            response: simpleResult,
            responseLength: simpleResult.length,
          },
          companyResearch: {
            success: !!parsedCompanyData,
            rawResponse: companyResult,
            parsedData: parsedCompanyData,
            responseLength: companyResult.length,
          },
        },
        tavilyApi: tavilyResult,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Google API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasGoogleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// GET endpoint for quick health check
export async function GET() {
  return NextResponse.json({
    status: 'Google API test endpoint ready',
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasGoogleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      hasTavilyKey: !!process.env.TAVILY_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
}