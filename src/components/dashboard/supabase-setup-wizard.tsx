'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, AlertTriangle, Database, Settings, Key } from 'lucide-react'

interface SupabaseConfig {
  hasUrl: boolean
  hasAnonKey: boolean
  hasServiceKey: boolean
  url: string | null
}

interface ConnectionStatus {
  status: 'not_configured' | 'tables_missing' | 'connection_failed' | 'connected'
  tablesExist: boolean
  tables: string[]
}

interface Recommendation {
  type: 'error' | 'warning' | 'success'
  title: string
  description: string
}

export default function SupabaseSetupWizard() {
  const [config, setConfig] = useState<SupabaseConfig | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  const checkSupabaseStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supabase/check')
      const data = await response.json()
      
      setConfig(data.config)
      setConnection(data.connection)
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error('Failed to check Supabase status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSupabaseStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'connection_failed':
      case 'tables_missing':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200'
      case 'connection_failed':
      case 'tables_missing':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Database Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Database Setup
        </CardTitle>
        <CardDescription>
          Configure and test your Supabase database connection for production deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {/* Configuration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={config?.hasUrl ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">URL</p>
                      <p className="text-xs text-muted-foreground">
                        {config?.url || 'Not configured'}
                      </p>
                    </div>
                    {config?.hasUrl ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={config?.hasAnonKey ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Anon Key</p>
                      <p className="text-xs text-muted-foreground">
                        {config?.hasAnonKey ? 'Configured' : 'Not configured'}
                      </p>
                    </div>
                    {config?.hasAnonKey ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={config?.hasServiceKey ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Service Key</p>
                      <p className="text-xs text-muted-foreground">
                        {config?.hasServiceKey ? 'Configured' : 'Not configured'}
                      </p>
                    </div>
                    {config?.hasServiceKey ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connection Status */}
            {connection && (
              <Card className={getStatusColor(connection.status)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Connection Status</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {connection.status.replace('_', ' ')}
                      </p>
                      {connection.tables.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Tables: {connection.tables.join(', ')}
                        </p>
                      )}
                    </div>
                    {getStatusIcon(connection.status)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recommendations</h4>
                {recommendations.map((rec, index) => (
                  <Alert key={index} className={rec.type === 'error' ? 'border-red-200' : rec.type === 'warning' ? 'border-yellow-200' : 'border-green-200'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{rec.title}:</strong> {rec.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <Button onClick={checkSupabaseStatus} disabled={testing} className="w-full">
              {testing ? 'Testing...' : 'Refresh Status'}
            </Button>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Step 1: Create Supabase Project</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></li>
                  <li>Sign up/login and create a new project</li>
                  <li>Choose a database password and region</li>
                  <li>Wait for the project to be ready (2-3 minutes)</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Step 2: Get Project URL & Keys</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to Project Settings → API</li>
                  <li>Copy the Project URL</li>
                  <li>Copy the anon public key</li>
                  <li>Generate and copy the service_role key</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Step 3: Configure Environment Variables</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="supabase-url" className="text-sm">URL:</Label>
                    <Input 
                      id="supabase-url" 
                      placeholder="https://your-project.supabase.co"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="supabase-anon" className="text-sm">Anon Key:</Label>
                    <Input 
                      id="supabase-anon" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="supabase-service" className="text-sm">Service Key:</Label>
                    <Input 
                      id="supabase-service" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Add these environment variables to your Vercel project dashboard or .env file for local development.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Database Schema</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Run this SQL in your Supabase SQL Editor to create the required tables:
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">supabase-schema.sql</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard('/supabase-schema.sql')}
                  >
                    Copy Path
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The schema file is located at the root of your project. Copy its contents and run in Supabase SQL Editor.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <h5 className="text-sm font-medium">Tables Created:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>task_history</code> - Stores agent execution history</li>
                  <li>• <code>company_research_cache</code> - Caches company research results</li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <h5 className="text-sm font-medium">Features:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Row Level Security (RLS) enabled</li>
                  <li>• Automatic timestamp updates</li>
                  <li>• Optimized indexes for performance</li>
                  <li>• User-based data isolation</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}