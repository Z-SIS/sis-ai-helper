import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Check environment variables
    const config = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/https:\/\/(.*)\.supabase\.co/, 'https://***.supabase.co') : null
    }

    // Test basic connection
    let connectionTest = 'not_configured'
    let tablesExist = false
    let tables = []

    if (config.hasUrl && config.hasAnonKey && supabase) {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('task_history').select('count').limit(1)
        
        if (error) {
          if (error.code === 'PGRST116') {
            connectionTest = 'tables_missing'
          } else {
            connectionTest = 'connection_failed'
            console.error('Supabase connection error:', error)
          }
        } else {
          connectionTest = 'connected'
          tablesExist = true
        }
      } catch (error) {
        connectionTest = 'connection_failed'
        console.error('Supabase test failed:', error)
      }
    }

    // Check table structure if connected
    if (connectionTest === 'connected' && supabaseAdmin) {
      try {
        // Test task_history table
        await supabaseAdmin.from('task_history').select('*').limit(1)
        
        // Test company_research_cache table  
        await supabaseAdmin.from('company_research_cache').select('*').limit(1)
        
        tables = ['task_history', 'company_research_cache']
      } catch (error) {
        console.error('Table check failed:', error)
      }
    }

    return NextResponse.json({
      status: 'success',
      config,
      connection: {
        status: connectionTest,
        tablesExist,
        tables
      },
      recommendations: getRecommendations(config, connectionTest, tablesExist)
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }, { status: 500 })
  }
}

function getRecommendations(config: any, connectionStatus: string, tablesExist: boolean) {
  const recommendations = []

  if (!config.hasUrl) {
    recommendations.push({
      type: 'error',
      title: 'Missing Supabase URL',
      description: 'Vercel Supabase Integration should provide NEXT_PUBLIC_SUPABASE_URL'
    })
  }

  if (!config.hasAnonKey) {
    recommendations.push({
      type: 'error', 
      title: 'Missing Anonymous Key',
      description: 'Vercel Supabase Integration should provide NEXT_PUBLIC_SUPABASE_ANON_KEY'
    })
  }

  if (!config.hasServiceKey) {
    recommendations.push({
      type: 'warning',
      title: 'Missing Service Role Key',
      description: 'Vercel Supabase Integration should provide SUPABASE_SERVICE_ROLE_KEY'
    })
  }

  if (connectionStatus === 'tables_missing') {
    recommendations.push({
      type: 'error',
      title: 'Tables Not Found',
      description: 'Run the SQL schema in supabase-schema.sql to create required tables'
    })
  }

  if (connectionStatus === 'connected' && !tablesExist) {
    recommendations.push({
      type: 'warning',
      title: 'Table Structure Incomplete',
      description: 'Some tables may be missing. Check the database schema.'
    })
  }

  if (connectionStatus === 'connected' && tablesExist) {
    recommendations.push({
      type: 'success',
      title: 'Supabase Ready',
      description: 'Supabase is properly configured and ready to use!'
    })
  }

  return recommendations
}