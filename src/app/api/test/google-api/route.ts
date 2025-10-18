import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const model = "gemini-2.5-flash";

  try {
    console.log(`🧪 Testing Google API with model: ${model}`);
    console.log(`🔑 API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found'}`);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Hello Gemini, just say OK if you're working." }]
            }
          ]
        }),
      }
    );

    const data = await res.json();
    
    console.log("[Gemini] Raw response:", JSON.stringify(data, null, 2));
    if (!data?.candidates?.[0]) {
      console.error("[Gemini] No candidates returned.");
    }

    return NextResponse.json({
      status: "Google API test completed",
      success: !!data?.candidates?.[0],
      modelUsed: model,
      fullResponse: data,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasGoogleKey: !!apiKey,
        hasTavilyKey: !!process.env.TAVILY_API_KEY,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("[Gemini] Test failed:", err);
    return NextResponse.json({
      status: "Google API test failed",
      error: err.message,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasGoogleKey: !!apiKey,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}