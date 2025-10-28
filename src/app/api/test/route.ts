import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Simple test API received:', body);
    
    // Return a simple response without any agent processing
    return NextResponse.json({
      success: true,
      message: 'Simple test API working',
      data: {
        companyName: body.companyName || 'Unknown',
        industry: body.industry || 'Not specified',
        location: body.location || 'Not specified',
        timestamp: new Date().toISOString(),
        test: true
      }
    });
  } catch (error) {
    console.error('Simple test API error:', error);
    return NextResponse.json(
      { 
        error: 'Simple test API failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'simple-test-api-healthy',
    message: 'Simple test API is working',
    timestamp: new Date().toISOString(),
  });
}