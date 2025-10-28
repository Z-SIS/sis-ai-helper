import { NextResponse } from 'next/server'
import { supabase, supabaseConfig } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic configuration
    const configStatus = {
      configured: supabaseConfig.isConfigured,
      clientAvailable: supabaseConfig.clientAvailable,
      adminAvailable: supabaseConfig.adminClientAvailable,
      url: supabaseConfig.url
    }

    if (!supabaseConfig.isConfigured) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase not properly configured',
        config: configStatus,
        recommendation: 'Check your environment variables in .env.local or Vercel dashboard'
      }, { status: 500 })
    }

    // Test basic connection with a simple query
    let connectionTest = 'failed'
    let error = null

    try {
      const { data, error: queryError } = await supabase
        .from('task_history')
        .select('count')
        .limit(1)

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          connectionTest = 'tables_missing'
          error = {
            code: queryError.code,
            message: 'Tables do not exist',
            hint: 'Run the SQL schema to create required tables'
          }
        } else {
          connectionTest = 'connection_failed'
          error = {
            code: queryError.code,
            message: queryError.message,
            hint: queryError.hint
          }
        }
      } else {
        connectionTest = 'success'
      }
    } catch (err) {
      connectionTest = 'connection_failed'
      error = {
        message: err instanceof Error ? err.message : 'Unknown error',
        type: typeof err
      }
    }

    return NextResponse.json({
      status: connectionTest === 'success' ? 'success' : 'warning',
      config: configStatus,
      connection: {
        status: connectionTest,
        error
      },
      recommendations: getRecommendations(connectionTest, error)
    })

  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: 'Test failed to run',
      error: err instanceof Error ? err.message : 'Unknown error',
      config: supabaseConfig
    }, { status: 500 })
  }
}

function getRecommendations(connectionStatus: string, error: any) {
  const recommendations = []

  if (connectionStatus === 'tables_missing') {
    recommendations.push({
      type: 'error',
      title: 'Database Tables Missing',
      description: 'The required tables do not exist in your Supabase database.',
      action: 'Run the SQL schema in supabase-schema.sql to create the required tables.'
    })
  }

  if (connectionStatus === 'connection_failed') {
    recommendations.push({
      type: 'error',
      title: 'Connection Failed',
      description: error?.message || 'Failed to connect to Supabase',
      action: 'Check your Supabase URL and keys, and ensure your Supabase project is active.'
    })
  }

  if (connectionStatus === 'success') {
    recommendations.push({
      type: 'success',
      title: 'Connection Successful',
      description: 'Supabase is properly configured and connected!',
      action: 'Your application is ready to use Supabase features.'
    })
  }

  return recommendations
}