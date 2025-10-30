'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { supabaseConfig } from '@/lib/supabase'
import { 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  ExternalLink 
} from 'lucide-react'

export function SupabaseStatusAlert() {
  const { isConfigured, hasServiceRoleKey, hasAnonKey } = supabaseConfig

  if (isConfigured && hasServiceRoleKey && hasAnonKey) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Database Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Your Supabase database is properly configured and ready to use.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Database Configuration Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-amber-700">
          Your Supabase database is not fully configured. Some features may not work properly.
        </p>
        
        <div className="space-y-2">
          <p className="font-medium text-amber-800">Missing Configuration:</p>
          <div className="flex flex-wrap gap-2">
            {!isConfigured && (
              <Badge variant="destructive">Supabase URL</Badge>
            )}
            {!hasAnonKey && (
              <Badge variant="destructive">Public API Key</Badge>
            )}
            {!hasServiceRoleKey && (
              <Badge variant="destructive">Service Role Key</Badge>
            )}
          </div>
        </div>

        <div className="bg-amber-100 p-3 rounded-md">
          <p className="text-sm font-medium text-amber-800 mb-2">
            <Settings className="inline h-4 w-4 mr-1" />
            Quick Fix:
          </p>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Go to your Supabase project settings</li>
            <li>Copy your Project URL and API keys</li>
            <li>Add them as environment variables in Vercel</li>
            <li>Redeploy your application</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <a 
            href="https://vercel.com/docs/concepts/projects/environment-variables"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-amber-700 hover:text-amber-800 underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Vercel Environment Variables Guide
          </a>
          <a 
            href="/VERCEL_ENV_SETUP_GUIDE.md"
            className="inline-flex items-center text-sm text-amber-700 hover:text-amber-800 underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Detailed Setup Guide
          </a>
        </div>
      </AlertDescription>
    </Alert>
  )
}