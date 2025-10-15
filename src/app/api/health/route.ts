import { NextResponse } from "next/server";

export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
    },
    aiServices: {
      googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'configured' : 'missing',
      tavilyApiKey: process.env.TAVILY_API_KEY ? 'configured' : 'missing',
    },
    version: "2.1.0-google-only"
  };

  return NextResponse.json(healthCheck);
}