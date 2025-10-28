'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  RefreshCw,
  Database,
  Cloud,
  Brain,
  Search,
  Settings,
  ArrowRight
} from 'lucide-react'

interface ConnectionStatus {
  timestamp: string
  overall: {
    status: string
    services: {
      total: number
      connected: number
      configured: number
      errors: number
    }
  }
  environment: {
    supabase: Record<string, boolean>
    supabaseClean: Record<string, boolean>
    aiServices: Record<string, boolean>
    platform: Record<string, boolean>
  }
  services: {
    supabase: { status: string; details: string | null }
    googleAI: { status: string; details: string | null }
    tavily: { status: string; details: string | null }
  }
  migration: {
    supabase: { current: boolean; target: boolean; ready: boolean }
  }
  recommendations: Array<{
    type: string
    category: string
    title: string
    description: string
    action: string
  }>
}

export default function ApiConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/connection-status')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStatus(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connection status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
      case 'degraded':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'not_configured':
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; label: string }> = {
      connected: { variant: 'default', label: 'Connected' },
      healthy: { variant: 'default', label: 'Healthy' },
      error: { variant: 'destructive', label: 'Error' },
      degraded: { variant: 'destructive', label: 'Degraded' },
      not_configured: { variant: 'secondary', label: 'Not Configured' },
      partial: { variant: 'secondary', label: 'Partial' },
      unknown: { variant: 'outline', label: 'Unknown' }
    }

    const config = variants[status] || variants.unknown
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading && !status) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">API Connection Status</h2>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load connection status: {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={fetchStatus}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!status) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Connection Status</h2>
          <p className="text-muted-foreground">
            Monitor the status of all integrated APIs and services
            {lastRefresh && (
              <span className="ml-2 text-xs">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={fetchStatus} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(status.overall.status)}
            Overall System Status
            {getStatusBadge(status.overall.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{status.overall.services.total}</div>
              <div className="text-sm text-muted-foreground">Total Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.overall.services.connected}</div>
              <div className="text-sm text-muted-foreground">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{status.overall.services.configured}</div>
              <div className="text-sm text-muted-foreground">Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{status.overall.services.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="environment">Environment Variables</TabsTrigger>
          <TabsTrigger value="migration">Migration Status</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Services Status */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Supabase */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5" />
                  Supabase
                  {getStatusBadge(status.services.supabase.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.services.supabase.status)}
                    <span className="text-sm font-medium capitalize">
                      {status.services.supabase.status.replace('_', ' ')}
                    </span>
                  </div>
                  {status.services.supabase.details && (
                    <p className="text-sm text-muted-foreground">
                      {status.services.supabase.details}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Google AI */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5" />
                  Google AI
                  {getStatusBadge(status.services.googleAI.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.services.googleAI.status)}
                    <span className="text-sm font-medium capitalize">
                      {status.services.googleAI.status.replace('_', ' ')}
                    </span>
                  </div>
                  {status.services.googleAI.details && (
                    <p className="text-sm text-muted-foreground">
                      {status.services.googleAI.details}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tavily */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5" />
                  Tavily Search
                  {getStatusBadge(status.services.tavily.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.services.tavily.status)}
                    <span className="text-sm font-medium capitalize">
                      {status.services.tavily.status.replace('_', ' ')}
                    </span>
                  </div>
                  {status.services.tavily.details && (
                    <p className="text-sm text-muted-foreground">
                      {status.services.tavily.details}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Environment Variables */}
        <TabsContent value="environment" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Supabase Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Supabase Environment Variables
                </CardTitle>
                <CardDescription>
                  Current (prefixed) vs Target (clean) variable names
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.environment.supabaseClean.url ? 'default' : 'secondary'}>
                        Clean
                      </Badge>
                      {getStatusIcon(status.environment.supabaseClean.url ? 'connected' : 'not_configured')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.environment.supabaseClean.anonKey ? 'default' : 'secondary'}>
                        Clean
                      </Badge>
                      {getStatusIcon(status.environment.supabaseClean.anonKey ? 'connected' : 'not_configured')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.environment.supabaseClean.serviceKey ? 'default' : 'secondary'}>
                        Clean
                      </Badge>
                      {getStatusIcon(status.environment.supabaseClean.serviceKey ? 'connected' : 'not_configured')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">SUPABASE_JWT_SECRET</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.environment.supabaseClean.jwtSecret ? 'default' : 'secondary'}>
                        Clean
                      </Badge>
                      {getStatusIcon(status.environment.supabaseClean.jwtSecret ? 'connected' : 'not_configured')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Services
                </CardTitle>
                <CardDescription>
                  External AI service API keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">GOOGLE_GENERATIVE_AI_API_KEY</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.environment.aiServices.googleApiKey ? 'connected' : 'not_configured')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">TAVILY_API_KEY</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.environment.aiServices.tavilyApiKey ? 'connected' : 'not_configured')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Platform
                </CardTitle>
                <CardDescription>
                  Deployment and platform information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">NODE_ENV</span>
                    <Badge variant="outline">{process.env.NODE_ENV || 'unknown'}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">VERCEL</span>
                    <Badge variant={status.environment.platform.vercel ? 'default' : 'secondary'}>
                      {status.environment.platform.vercel ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">VERCEL_ENV</span>
                    <Badge variant="outline">{process.env.VERCEL_ENV || 'unknown'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Migration Status */}
        <TabsContent value="migration" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Supabase Migration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current (Prefixed)</span>
                    {getStatusIcon(status.migration.supabase.current ? 'connected' : 'not_configured')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Target (Clean)</span>
                    {getStatusIcon(status.migration.supabase.target ? 'connected' : 'not_configured')}
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-sm">Ready for Migration</span>
                    {getStatusIcon(status.migration.supabase.ready ? 'connected' : 'not_configured')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  PostgreSQL Migration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current (Prefixed)</span>
                    {getStatusIcon(status.migration.postgres.current ? 'connected' : 'not_configured')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Target (Clean)</span>
                    {getStatusIcon(status.migration.postgres.target ? 'connected' : 'not_configured')}
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-sm">Ready for Migration</span>
                    {getStatusIcon(status.migration.postgres.ready ? 'connected' : 'not_configured')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {status.migration.supabase.ready && status.migration.postgres.ready && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Migration Ready!</strong> All clean environment variables are configured. 
                You can now update your code to use the clean variable names.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          {status.recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>All systems are operating correctly!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {status.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        {rec.action && (
                          <div className="flex items-center gap-2 text-sm">
                            <ArrowRight className="h-3 w-3" />
                            <code className="bg-muted px-2 py-1 rounded">{rec.action}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}