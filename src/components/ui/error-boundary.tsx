'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Oops! Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in function components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured by useErrorHandler:', error);
    setError(error);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

// Component to handle specific API errors
export function ApiErrorHandler({ 
  error, 
  onRetry 
}: { 
  error: Error | null; 
  onRetry?: () => void;
}) {
  if (!error) return null;

  const isAuthError = error.message.includes('403') || error.message.includes('authentication');
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch');

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {isAuthError ? 'Authentication Error' : 'Connection Error'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>
          {isAuthError 
            ? 'There was an issue with authentication. Some features may be limited.'
            : isNetworkError
            ? 'Unable to connect to the server. Please check your internet connection.'
            : 'An unexpected error occurred while processing your request.'
          }
        </CardDescription>
        
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground">
          Error details: {error.message}
        </div>
      </CardContent>
    </Card>
  );
}