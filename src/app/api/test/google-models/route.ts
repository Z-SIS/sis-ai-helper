import { NextResponse } from 'next/server';

// List available Google AI models
export async function GET() {
  try {
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!googleApiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Testing Google AI Models API...');
    console.log('🔑 API Key:', googleApiKey ? `${googleApiKey.substring(0, 10)}...` : 'Not found');

    // Call Google AI ListModels API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${googleApiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 ListModels API Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ListModels API Error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to list models',
          status: response.status,
          statusText: response.statusText,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Models retrieved successfully');
    console.log('📊 Available models:', data.models?.length || 0);

    // Filter for models that support generateContent
    const supportedModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ) || [];

    console.log('🎯 Models supporting generateContent:', supportedModels.length);

    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      supportedModels: supportedModels.length,
      models: data.models?.map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods,
        supportsGenerateContent: model.supportedGenerationMethods?.includes('generateContent')
      })) || [],
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!googleApiKey,
        keyLength: googleApiKey?.length || 0,
        keyPrefix: googleApiKey ? `${googleApiKey.substring(0, 6)}...` : 'none'
      }
    });

  } catch (error) {
    console.error('❌ Models test failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Models test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}