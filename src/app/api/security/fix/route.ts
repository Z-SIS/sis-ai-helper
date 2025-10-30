import { NextRequest, NextResponse } from 'next/server';
import { executeSecurityFixes, checkSecurityStatus } from '@/lib/security-fix';

export async function POST(request: NextRequest) {
  const secret = process.env.SECURITY_FIX_SECRET;
  if (!secret || request.headers.get('x-security-fix-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
    }

    if (action === 'check') {
      const status = await checkSecurityStatus(dbUrl);
      return NextResponse.json({
        success: true,
        message: 'Security status retrieved',
        data: status
      });
    }

    if (action === 'fix') {
      await executeSecurityFixes(dbUrl);
      return NextResponse.json({ 
        success: true,
        status: '✅ Fix executed',
        message: 'Security fixes applied successfully'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "check" or "fix"'
    }, { status: 400 });

  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  const secret = process.env.SECURITY_FIX_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Unauthorized - missing secret' }, { status: 401 });
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
    }

    const status = await checkSecurityStatus(dbUrl);
    return NextResponse.json({
      success: true,
      message: 'Security status retrieved',
      data: status
    });
  } catch (error) {
    console.error('Security status check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check security status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}