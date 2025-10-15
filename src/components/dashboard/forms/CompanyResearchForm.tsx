'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Building2, Search, Loader2, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CompanyResearchInput, CompanyResearchOutput, CompanyResearchInputSchema } from '@/shared/schemas';
import { SalesIntelligenceReport } from '@/components/dashboard/reports/SalesIntelligenceReport';

const formSchema = CompanyResearchInputSchema;

export function CompanyResearchForm() {
  const [result, setResult] = useState<CompanyResearchOutput | null>(null);

  const form = useForm<CompanyResearchInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      location: '',
      researchFocus: '',
      competitorAnalysis: false,
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
    },
  });

  const onSubmit = (data: CompanyResearchInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-6 h-6 text-primary" />
            Sales Intelligence Research
          </CardTitle>
          <CardDescription className="text-base">
            Generate comprehensive company research with sales-focused insights including decision makers, pain points, competitive landscape, and sales opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              <strong>API Keys Required:</strong> This feature requires <code>GOOGLE_GENERATIVE_AI_API_KEY</code> and <code>TAVILY_API_KEY</code> environment variables to be configured.
            </AlertDescription>
          </Alert>
          
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

              <FormField
                control={form.control}
                name="researchFocus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Research Focus (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Focus on decision makers in IT department, competitive positioning against specific vendors, recent technology investments..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competitorAnalysis"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Include Competitor Analysis
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Add detailed competitive landscape and positioning insights
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                size="lg"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Sales Intelligence...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Generate Sales Intelligence Report
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
                        <p>The company research feature requires both Google AI and Tavily API keys to work.</p>
                        <div className="text-sm bg-gray-100 p-3 rounded-md">
                          <p className="font-medium mb-1">To fix this issue:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Get a free Google AI API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
                            <li>Get a Tavily API key from <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Tavily</a></li>
                            <li>Add them to your .env file:</li>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li><code className="bg-gray-200 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key</code></li>
                              <li><code className="bg-gray-200 px-1 rounded">TAVILY_API_KEY=your_tavily_api_key</code></li>
                            </ul>
                            <li>Restart the development server</li>
                          </ol>
                        </div>
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
        <SalesIntelligenceReport data={result} />
      )}
    </div>
  );
}