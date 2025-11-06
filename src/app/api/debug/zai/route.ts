import { NextResponse } from "next/server";
import { getZAI } from '@/lib/ai/zai-compat';

export async function GET() {
  try {
    // Test ZAI SDK initialization using compatibility layer
    let zaiClient: any = null;
    let testResult: any = null;

    try {
      // Use compatibility layer to get ZAI instance
      zaiClient = await getZAI();
      
      if (!zaiClient) {
        throw new Error('ZAI SDK failed to load');
      }

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
  } catch (error: any) {
    return NextResponse.json({
      status: "critical_error",
      message: "Debug endpoint failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}