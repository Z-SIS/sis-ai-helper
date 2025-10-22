'use client';

import { GoogleAPITester } from '@/components/debug/google-api-tester';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, AlertTriangle, Info, Lightbulb } from 'lucide-react';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bug className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Debug Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Test and debug Google API functionality in Vercel environment
          </p>
        </div>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Current Issue Investigation
            </CardTitle>
            <CardDescription>
              AI assistant is returning "Not available" for all fields instead of real data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">Symptoms</span>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• Company research returns "Not available" for all fields</li>
                  <li>• Google API may not be working correctly</li>
                  <li>• Identity Toolkit 403 errors (expected)</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">Investigation Steps</span>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• Test Google API connectivity</li>
                  <li>• Verify API key configuration</li>
                  <li>• Check Vercel AI SDK integration</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Environment: Vercel</Badge>
              <Badge variant="outline">SDK: Vercel AI SDK</Badge>
              <Badge variant="outline">Model: Gemini 1.5 Flash</Badge>
              <Badge variant="outline">Status: Investigating</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Google API Tester */}
        <GoogleAPITester />

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use This Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Run Google API Test" to test the API connectivity</li>
              <li>Check if Google API key is properly configured in Vercel</li>
              <li>Review the raw response from Google AI</li>
              <li>Verify if JSON parsing works correctly</li>
              <li>Check Tavily search API functionality</li>
            </ol>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> This test will show detailed logs in the browser console and Vercel function logs.
                Check both locations for complete debugging information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}