'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  success: boolean;
  testResults?: {
    environment: any;
    googleApi: {
      simpleCall: any;
      companyResearch: any;
    };
    tavilyApi: any;
  };
  error?: string;
  stack?: string;
  timestamp: string;
}

export function GoogleAPITester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Starting Google API test...');
      
      const response = await fetch('/api/test/google-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'google-api-functionality',
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log('📊 Test response received:', data);
      
      setResult(data);
    } catch (error) {
      console.error('❌ Test failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean, label: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(success)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Google API Test - Vercel Environment
        </CardTitle>
        <CardDescription>
          Test how Vercel calls Google APIs and check the output
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Button 
            onClick={runTest} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing Google API...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Google API Test
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-semibold">Overall Status:</span>
              {getStatusBadge(result.success, result.success ? 'Success' : 'Failed')}
            </div>

            {/* Environment Info */}
            {result.testResults?.environment && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="font-semibold mb-2">Environment:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Node Env: <Badge variant="outline">{result.testResults.environment.nodeEnv}</Badge></div>
                  <div>Vercel Env: <Badge variant="outline">{result.testResults.environment.vercelEnv || 'N/A'}</Badge></div>
                  <div>Google Key: <Badge variant={result.testResults.environment.hasGoogleKey ? "default" : "destructive"}>
                    {result.testResults.environment.hasGoogleKey ? 'Configured' : 'Not Found'}
                  </Badge></div>
                  <div>Tavily Key: <Badge variant={result.testResults.environment.hasTavilyKey ? "default" : "destructive"}>
                    {result.testResults.environment.hasTavilyKey ? 'Configured' : 'Not Found'}
                  </Badge></div>
                </div>
              </div>
            )}

            {/* Google API Results */}
            {result.testResults?.googleApi && (
              <div className="space-y-3">
                <h3 className="font-semibold">Google API Results:</h3>
                
                {/* Simple Call Test */}
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Simple Call Test:</span>
                    {getStatusBadge(result.testResults.googleApi.simpleCall.success, 'Success')}
                  </div>
                  {result.testResults.googleApi.simpleCall.response && (
                    <div className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                      <strong>Response:</strong> {result.testResults.googleApi.simpleCall.response}
                    </div>
                  )}
                </div>

                {/* Company Research Test */}
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Company Research Test:</span>
                    {getStatusBadge(result.testResults.googleApi.companyResearch.success, 
                      result.testResults.googleApi.companyResearch.success ? 'Success' : 'Failed')}
                  </div>
                  
                  {/* Raw Response */}
                  <div className="mb-2">
                    <strong className="text-sm">Raw Response ({result.testResults.googleApi.companyResearch.responseLength} chars):</strong>
                    <div className="text-xs p-2 bg-white dark:bg-gray-800 rounded border mt-1 max-h-32 overflow-y-auto">
                      {result.testResults.googleApi.companyResearch.rawResponse}
                    </div>
                  </div>

                  {/* Parsed Data */}
                  {result.testResults.googleApi.companyResearch.parsedData && (
                    <div>
                      <strong className="text-sm">Parsed JSON Data:</strong>
                      <div className="text-xs p-2 bg-white dark:bg-gray-800 rounded border mt-1">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(result.testResults.googleApi.companyResearch.parsedData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tavily API Results */}
            {result.testResults?.tavilyApi && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h3 className="font-semibold mb-2">Tavily API Results:</h3>
                {getStatusBadge(result.testResults.tavilyApi.success, 
                  result.testResults.tavilyApi.success ? 'Connected' : 'Failed')}
                <div className="text-sm mt-2">
                  {result.testResults.tavilyApi.success ? (
                    <div>
                      <strong>Results Count:</strong> {result.testResults.tavilyApi.resultsCount}
                      {result.testResults.tavilyApi.sampleResult && (
                        <div className="mt-2">
                          <strong>Sample Result:</strong>
                          <div className="text-xs p-2 bg-white dark:bg-gray-800 rounded border mt-1">
                            {result.testResults.tavilyApi.sampleResult.title}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <strong>Error:</strong> {result.testResults.tavilyApi.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Details */}
            {result.error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <h3 className="font-semibold text-red-600 mb-2">Error Details:</h3>
                <div className="text-sm">
                  <div className="mb-2"><strong>Error:</strong> {result.error}</div>
                  {result.stack && (
                    <div className="text-xs p-2 bg-white dark:bg-gray-800 rounded border">
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{result.stack}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground text-center">
              Test completed at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}