import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test ZAI SDK initialization
    let ZAI: any = null;
    let zaiClient: any = null;
    let testResult: any = null;

    try {
      // Dynamic import for ZAI SDK
      const ZAIModule = await import('z-ai-web-dev-sdk');
      ZAI = ZAIModule.default;
      
      if (ZAI) {
        // Try to create ZAI client
        const apiKey = process.env.ZAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'z-ai-default-key';
        
        try {
          zaiClient = await ZAI.create({ apiKey });
          
          // Try a simple test request
          testResult = await zaiClient.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: 'Respond with "ZAI SDK is working" in JSON format like {"status": "working"}'
              }
            ],
            max_tokens: 50,
          });
          
          return NextResponse.json({
            status: "success",
            message: "ZAI SDK is fully functional",
            environment: {
              NODE_ENV: process.env.NODE_ENV,
              VERCEL: process.env.VERCEL ? 'true' : 'false',
            },
            configuration: {
              zaiApiKey: process.env.ZAI_API_KEY ? 'configured' : 'missing',
              googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'configured' : 'missing',
            },
            test: {
              sdkLoaded: true,
              clientCreated: true,
              testResponse: testResult.choices[0]?.message?.content || 'No response content',
            }
          });
          
        } catch (clientError: any) {
          return NextResponse.json({
            status: "error",
            message: "ZAI SDK client creation failed",
            error: clientError.message,
            environment: {
              NODE_ENV: process.env.NODE_ENV,
              VERCEL: process.env.VERCEL ? 'true' : 'false',
            },
            configuration: {
              zaiApiKey: process.env.ZAI_API_KEY ? 'configured' : 'missing',
              googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'configured' : 'missing',
            },
            test: {
              sdkLoaded: true,
              clientCreated: false,
              error: clientError.message,
            }
          });
        }
      } else {
        throw new Error('ZAI SDK failed to load');
      }
    } catch (sdkError: any) {
      return NextResponse.json({
        status: "error",
        message: "ZAI SDK failed to initialize",
        error: sdkError.message,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL ? 'true' : 'false',
        },
        configuration: {
          zaiApiKey: process.env.ZAI_API_KEY ? 'configured' : 'missing',
          googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'configured' : 'missing',
        },
        test: {
          sdkLoaded: false,
          clientCreated: false,
          error: sdkError.message,
        }
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      status: "critical_error",
      message: "Debug endpoint failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}