'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Building2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CompanyResearchInput, CompanyResearchOutput, CompanyResearchInputSchema } from '@/shared/schemas';
import { saveTaskToHistory } from '@/components/dashboard/history-sidebar';

const formSchema = CompanyResearchInputSchema;

export function CompanyResearchForm() {
  const [result, setResult] = useState<CompanyResearchOutput | null>(null);

  const form = useForm<CompanyResearchInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      location: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CompanyResearchInput) => {
      const response = await fetch('/api/agent/company-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to research company');
      }

      const result = await response.json();
      return result.data as CompanyResearchOutput;
    },
    onSuccess: (data) => {
      setResult(data);
      // Save to history
      saveTaskToHistory('company-research', mutation.variables as CompanyResearchInput, data);
    },
  });

  const onSubmit = (data: CompanyResearchInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Research
          </CardTitle>
          <CardDescription>
            Research companies and gather comprehensive information including industry, location, executives, and recent news.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Microsoft, Apple, Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Technology, Finance, Healthcare" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, New York, London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Researching Company...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Research Company
                  </>
                )}
              </Button>
            </form>
          </Form>

          {mutation.error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>
                {mutation.error instanceof Error ? (
                  <>
                    {mutation.error.message.includes('API key not configured') ? (
                      <div className="space-y-2">
                        <p className="font-semibold">API Keys Required</p>
                        <p>The company research feature requires API keys to provide real-time data. Currently running in demo mode.</p>
                        <div className="text-sm bg-gray-100 p-3 rounded-md">
                          <p className="font-medium mb-1">To enable real-time research:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Get a free Google AI API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
                            <li>Get a Tavily API key from <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Tavily</a></li>
                            <li>Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in your project root</li>
                            <li>Add the API keys:</li>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li><code className="bg-gray-200 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key</code></li>
                              <li><code className="bg-gray-200 px-1 rounded">TAVILY_API_KEY=your_tavily_api_key</code></li>
                            </ul>
                            <li>Restart the development server</li>
                          </ol>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Demo Mode:</strong> Try "SIS Limited" as company name to see sample data with full features.
                        </p>
                      </div>
                    ) : (
                      mutation.error.message
                    )}
                  </>
                ) : (
                  'An error occurred while researching the company. Please try again.'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Research Results</CardTitle>
            <CardDescription>
              Last updated: {result.lastUpdated ? new Date(result.lastUpdated).toLocaleDateString() : 'Not available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Company Name</h4>
                <p className="text-sm">{result.companyName || 'Not available'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Industry</h4>
                <p className="text-sm">{result.industry || 'Not available'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Location</h4>
                <p className="text-sm">{result.location || 'Not available'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Website</h4>
                {result.website && result.website !== 'Information not available' ? (
                  <a 
                    href={result.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {result.website}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Not available</p>
                )}
              </div>
              {result.foundedYear && result.foundedYear !== 'Information not available' && (
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Founded</h4>
                  <p className="text-sm">{result.foundedYear}</p>
                </div>
              )}
              {result.employeeCount && result.employeeCount !== 'Information not available' && (
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Employees</h4>
                  <p className="text-sm">{result.employeeCount}</p>
                </div>
              )}
            </div>

            {result.description && result.description !== 'Information not available' && (
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </div>
            )}

            {result.keyExecutives && result.keyExecutives.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">Key Executives</h4>
                <div className="space-y-1">
                  {result.keyExecutives.map((executive, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{executive.name}</span> - {executive.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.competitors && result.competitors.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">Competitors</h4>
                <div className="flex flex-wrap gap-2">
                  {result.competitors.map((competitor, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-secondary text-sm rounded-md"
                    >
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.recentNews && result.recentNews.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">Recent News</h4>
                <div className="space-y-3">
                  {result.recentNews.map((news, index) => (
                    <div key={index} className="border-l-2 border-border pl-3">
                      <h5 className="font-medium text-sm">{news.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{news.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}