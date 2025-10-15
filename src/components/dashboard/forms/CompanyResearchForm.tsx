'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
<<<<<<< HEAD
import { Building2, Search, Loader2, Target, Users } from 'lucide-react';
=======
import { Building2, Search, Loader2 } from 'lucide-react';
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
<<<<<<< HEAD
import { Checkbox } from '@/components/ui/checkbox';
import { CompanyResearchInput, CompanyResearchOutput, CompanyResearchInputSchema } from '@/shared/schemas';
import { SalesIntelligenceReport } from '@/components/dashboard/reports/SalesIntelligenceReport';
=======
import { CompanyResearchInput, CompanyResearchOutput, CompanyResearchInputSchema } from '@/shared/schemas';
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d

const formSchema = CompanyResearchInputSchema;

export function CompanyResearchForm() {
  const [result, setResult] = useState<CompanyResearchOutput | null>(null);

  const form = useForm<CompanyResearchInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      location: '',
<<<<<<< HEAD
      researchFocus: '',
      competitorAnalysis: false,
=======
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
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
<<<<<<< HEAD
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-6 h-6 text-primary" />
            Sales Intelligence Research
          </CardTitle>
          <CardDescription className="text-base">
            Generate comprehensive company research with sales-focused insights including decision makers, pain points, competitive landscape, and sales opportunities.
=======
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Research
          </CardTitle>
          <CardDescription>
            Research companies and gather comprehensive information including industry, location, executives, and recent news.
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
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
<<<<<<< HEAD
        <SalesIntelligenceReport data={result} />
=======
        <Card>
          <CardHeader>
            <CardTitle>Research Results</CardTitle>
            <CardDescription>
              Last updated: {new Date(result.lastUpdated).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Company Name</h4>
                <p className="text-sm">{result.companyName}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Industry</h4>
                <p className="text-sm">{result.industry}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Location</h4>
                <p className="text-sm">{result.location}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Website</h4>
                <a 
                  href={result.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {result.website}
                </a>
              </div>
              {result.foundedYear && (
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Founded</h4>
                  <p className="text-sm">{result.foundedYear}</p>
                </div>
              )}
              {result.employeeCount && (
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Employees</h4>
                  <p className="text-sm">{result.employeeCount}</p>
                </div>
              )}
            </div>

            {result.description && (
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
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
      )}
    </div>
  );
}