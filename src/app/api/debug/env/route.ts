import { NextResponse } from 'next/server'
import { supabaseConfig } from '@/lib/supabase'

export async function GET() {
  // Log all environment variables that start with common prefixes
  const envVars = {
    // Clean variables (what our code expects)
    clean: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    },
    // Other relevant variables
    other: {
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    }
  }

  // Show actual values (masked) for debugging
  const maskedValues = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
      process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/https:\/\/(.*)\.supabase\.co/, 'https://***.supabase.co') : null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
      process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : null,
  }

  // Test JWT token format
  const validateJWT = (token: string) => {
    try {
      const parts = token.split('.')
      return {
        valid: parts.length === 3 && parts.every(part => part.length > 0),
        parts: parts.length,
        headerLength: parts[0]?.length || 0,
        payloadLength: parts[1]?.length || 0,
        signatureLength: parts[2]?.length || 0
      }
    } catch {
      return { valid: false, parts: 0, headerLength: 0, payloadLength: 0, signatureLength: 0 }
    }
  }

  const tokenValidation = {
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? validateJWT(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : null,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? validateJWT(process.env.SUPABASE_SERVICE_ROLE_KEY) : null,
  }

  return NextResponse.json({
    status: 'debug',
    envVars,
    maskedValues,
    tokenValidation,
    supabaseConfig,
    recommendation: envVars.clean.NEXT_PUBLIC_SUPABASE_URL === 'NOT SET' ? 
      'Clean variables are not set. You need to set up Vercel environment variables correctly.' : 
      supabaseConfig.isConfigured ? 
        'Supabase is properly configured and ready to use!' :
        'Variables are set but configuration validation failed. Check token formats.'
  })
}