import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  // Environment variables to check
  const environmentVars = {
    // Supabase (prefixed - current)
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.SUPABASE_JWT_SECRET,
    },
    // Supabase (clean - target)
    supabaseClean: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.SUPABASE_JWT_SECRET,
    },
    // PostgreSQL (prefixed - current)
    postgres: {
      url: !!process.env.POSTGRES_URL,
      prismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      nonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
      user: !!process.env.POSTGRES_USER,
      password: !!process.env.POSTGRES_PASSWORD,
      database: !!process.env.POSTGRES_DATABASE,
      host: !!process.env.POSTGRES_HOST,
    },
    // PostgreSQL (clean - target)
    postgresClean: {
      url: !!process.env.POSTGRES_URL,
      prismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      nonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
      user: !!process.env.POSTGRES_USER,
      password: !!process.env.POSTGRES_PASSWORD,
      database: !!process.env.POSTGRES_DATABASE,
      host: !!process.env.POSTGRES_HOST,
    },
    // AI Services
    aiServices: {
      googleApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      tavilyApiKey: !!process.env.TAVILY_API_KEY,
    },
    // Platform
    platform: {
      nodeEnv: !!process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      vercelEnv: !!process.env.VERCEL_ENV,
    }
  }

  // Service connectivity tests
  const serviceStatus = {
    supabase: { status: 'unknown', details: null },
    prisma: { status: 'unknown', details: null },
    googleAI: { status: 'unknown', details: null },
    tavily: { status: 'unknown', details: null },
  }

  // Test Supabase connection
  try {
    if (environmentVars.supabase.url && environmentVars.supabase.anonKey) {
      const { data, error } = await supabase.from('task_history').select('count').limit(1)
      
      if (error) {
        serviceStatus.supabase = {
          status: 'error',
          details: error.message
        }
      } else {
        serviceStatus.supabase = {
          status: 'connected',
          details: 'Successfully connected to Supabase'
        }
      }
    } else {
      serviceStatus.supabase = {
        status: 'not_configured',
        details: 'Missing Supabase URL or Anonymous Key'
      }
    }
  } catch (error) {
    serviceStatus.supabase = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test Prisma/DB connection
  try {
    if (environmentVars.postgres.url || environmentVars.postgresClean.url) {
      await db.$queryRaw`SELECT 1`
      serviceStatus.prisma = {
        status: 'connected',
        details: 'Successfully connected to database via Prisma'
      }
    } else {
      serviceStatus.prisma = {
        status: 'not_configured',
        details: 'Missing database connection URL'
      }
    }
  } catch (error) {
    serviceStatus.prisma = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test Google AI API
  try {
    if (environmentVars.aiServices.googleApiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`)
      
      if (response.ok) {
        serviceStatus.googleAI = {
          status: 'connected',
          details: 'Google AI API is accessible'
        }
      } else {
        serviceStatus.googleAI = {
          status: 'error',
          details: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } else {
      serviceStatus.googleAI = {
        status: 'not_configured',
        details: 'Missing Google AI API Key'
      }
    }
  } catch (error) {
    serviceStatus.googleAI = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Network error'
    }
  }

  // Test Tavily API
  try {
    if (environmentVars.aiServices.tavilyApiKey) {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: 'test',
          max_results: 1
        })
      })
      
      if (response.ok) {
        serviceStatus.tavily = {
          status: 'connected',
          details: 'Tavily API is accessible'
        }
      } else {
        serviceStatus.tavily = {
          status: 'error',
          details: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } else {
      serviceStatus.tavily = {
        status: 'not_configured',
        details: 'Missing Tavily API Key'
      }
    }
  } catch (error) {
    serviceStatus.tavily = {
      status: 'error',
      details: error instanceof Error ? error.message : 'Network error'
    }
  }

  // Calculate overall status
  const allServices = Object.values(serviceStatus)
  const connectedServices = allServices.filter(s => s.status === 'connected').length
  const configuredServices = allServices.filter(s => s.status !== 'not_configured').length
  const errorServices = allServices.filter(s => s.status === 'error').length

  let overallStatus = 'unknown'
  if (connectedServices === allServices.length) {
    overallStatus = 'healthy'
  } else if (errorServices > 0) {
    overallStatus = 'degraded'
  } else if (configuredServices > 0) {
    overallStatus = 'partial'
  }

  // Environment variable migration status
  const migrationStatus = {
    supabase: {
      current: Object.values(environmentVars.supabase).every(Boolean),
      target: Object.values(environmentVars.supabaseClean).every(Boolean),
      ready: Object.values(environmentVars.supabaseClean).every(Boolean)
    },
    postgres: {
      current: Object.values(environmentVars.postgres).every(Boolean),
      target: Object.values(environmentVars.postgresClean).every(Boolean),
      ready: Object.values(environmentVars.postgresClean).every(Boolean)
    }
  }

  return NextResponse.json({
    timestamp,
    overall: {
      status: overallStatus,
      services: {
        total: allServices.length,
        connected: connectedServices,
        configured: configuredServices,
        errors: errorServices
      }
    },
    environment: environmentVars,
    services: serviceStatus,
    migration: migrationStatus,
    recommendations: generateRecommendations(environmentVars, serviceStatus, migrationStatus)
  })
}

function generateRecommendations(envVars: any, services: any, migration: any) {
  const recommendations = []

  // Supabase recommendations
  if (!migration.supabase.ready) {
    recommendations.push({
      type: 'warning',
      category: 'environment',
      title: 'Complete Supabase Environment Migration',
      description: 'Set up clean Supabase environment variables using the provided setup script',
      action: 'Run: node vercel-env-setup-local.js'
    })
  }

  if (services.supabase.status === 'error') {
    recommendations.push({
      type: 'error',
      category: 'supabase',
      title: 'Supabase Connection Failed',
      description: services.supabase.details,
      action: 'Check Supabase project settings and API keys'
    })
  }

  // PostgreSQL recommendations
  if (!migration.postgres.ready) {
    recommendations.push({
      type: 'warning',
      category: 'environment',
      title: 'Complete PostgreSQL Environment Migration',
      description: 'Set up clean PostgreSQL environment variables',
      action: 'Run: node vercel-env-setup-local.js'
    })
  }

  if (services.prisma.status === 'error') {
    recommendations.push({
      type: 'error',
      category: 'database',
      title: 'Database Connection Failed',
      description: services.prisma.details,
      action: 'Verify database URL and credentials'
    })
  }

  // AI Services recommendations
  if (services.googleAI.status === 'not_configured') {
    recommendations.push({
      type: 'warning',
      category: 'ai',
      title: 'Google AI API Not Configured',
      description: 'Add GOOGLE_GENERATIVE_AI_API_KEY to enable AI features',
      action: 'Set up Google AI API key in environment variables'
    })
  }

  if (services.tavily.status === 'not_configured') {
    recommendations.push({
      type: 'info',
      category: 'ai',
      title: 'Tavily API Not Configured',
      description: 'Add TAVILY_API_KEY to enable web search capabilities',
      action: 'Set up Tavily API key in environment variables'
    })
  }

  // Success recommendations
  if (migration.supabase.ready && migration.postgres.ready && services.supabase.status === 'connected') {
    recommendations.push({
      type: 'success',
      category: 'migration',
      title: 'Environment Migration Complete',
      description: 'All clean environment variables are configured and services are connected',
      action: 'You can now update code to use clean variable names'
    })
  }

  return recommendations
}