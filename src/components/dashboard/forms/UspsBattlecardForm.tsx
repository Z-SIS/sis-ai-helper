'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Target, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AgentInput, AgentOutput, UspsBattlecardInput, UspsBattlecardOutput } from '@/shared/schemas/index';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  competitor: z.string().min(1, 'Competitor name is required'),
  productCategory: z.string().optional(),
  targetMarket: z.string().optional(),
});

export function UspsBattlecardForm() {
  const [result, setResult] = useState<UspsBattlecardOutput | null>(null);
  
  const form = useForm<UspsBattlecardInput>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      companyName: '',
      competitor: '',
      productCategory: '',
      targetMarket: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UspsBattlecardInput) => {
      const response = await fetch('/api/agent/usps-battlecard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate battlecard');
      }

      const result = await response.json();
      return result.data as UspsBattlecardOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: UspsBattlecardInput) => {
    mutation.mutate(data);
  };

  const downloadAsMarkdown = () => {
    if (!result) return;
    
    let markdown = `# Competitive Battlecard: ${result.companyName} vs ${result.competitor}\n\n`;
    markdown += `**Product Category:** ${result.productCategory}\n\n`;
    markdown += `## Overview\n\n`;
    markdown += `### Our Positioning\n${result.overview?.ourPositioning || 'Not specified'}\n\n`;
    markdown += `### Competitor Positioning\n${result.overview?.competitorPositioning || 'Not specified'}\n\n`;
    markdown += `## Strengths\n\n`;
    markdown += `### Our Strengths\n`;
    (result.strengths?.ours || []).forEach(strength => {
      markdown += `- ${strength}\n`;
    });
    markdown += `\n### Competitor Strengths\n`;
    (result.strengths?.competitor || []).forEach(strength => {
      markdown += `- ${strength}\n`;
    });
    markdown += `\n## Weaknesses\n\n`;
    markdown += `### Our Weaknesses\n`;
    (result.weaknesses?.ours || []).forEach(weakness => {
      markdown += `- ${weakness}\n`;
    });
    markdown += `\n### Competitor Weaknesses\n`;
    (result.weaknesses?.competitor || []).forEach(weakness => {
      markdown += `- ${weakness}\n`;
    });
    markdown += `\n## Key Differentiators\n`;
    (result.keyDifferentiators || []).forEach(diff => {
      markdown += `- ${diff}\n`;
    });
    markdown += `\n## Talking Points\n`;
    (result.talkingPoints || []).forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += `\n## Competitive Advantages\n`;
    (result.competitiveAdvantages || []).forEach(adv => {
      markdown += `- ${adv}\n`;
    });
    markdown += `\n## Recommended Actions\n`;
    (result.recommendedActions || []).forEach(action => {
      markdown += `- ${action}\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.companyName}_vs_${result.competitor}_Battlecard.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            USPS Battlecard
          </CardTitle>
          <CardDescription>
            Create a competitive analysis battlecard to compare your company against competitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Company *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SecureCorp, DefenseTech, GuardPro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SafeGuard, ProtectAll, SecurityPlus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Security Services, Surveillance Systems, Access Control" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Market (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Enterprise, Small Business, Government" {...field} />
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
                    Generating Battlecard...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Generate Battlecard
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
                        <p className="font-semibold">API Key Required</p>
                        <p>The USPS battlecard feature requires a Google AI API key to work.</p>
                        <div className="text-sm bg-gray-100 p-3 rounded-md">
                          <p className="font-medium mb-1">To fix this issue:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
                            <li>Add it to your .env file: <code className="bg-gray-200 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here</code></li>
                            <li>Restart the development server</li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      mutation.error.message
                    )}
                  </>
                ) : (
                  'An error occurred while generating the battlecard. Please try again.'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{result.companyName} vs {result.competitor}</CardTitle>
                <CardDescription>{result.productCategory}</CardDescription>
              </div>
              <Button onClick={downloadAsMarkdown} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Our Positioning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{result.overview?.ourPositioning || 'Not specified'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Competitor Positioning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{result.overview?.competitorPositioning || 'Not specified'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Our Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {(result.strengths?.ours || []).map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600">{strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Competitor Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {(result.strengths?.competitor || []).map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600">{strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Our Weaknesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {(result.weaknesses?.ours || []).map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-600">{weakness}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Competitor Weaknesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {(result.weaknesses?.competitor || []).map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-600">{weakness}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Differentiators</h4>
              <div className="flex flex-wrap gap-2">
                {(result.keyDifferentiators || []).map((diff, index) => (
                  <Badge key={index} variant="secondary">{diff}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Talking Points</h4>
              <ul className="list-disc list-inside space-y-1">
                {(result.talkingPoints || []).map((point, index) => (
                  <li key={index} className="text-sm text-gray-600">{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Competitive Advantages</h4>
              <ul className="list-disc list-inside space-y-1">
                {(result.competitiveAdvantages || []).map((adv, index) => (
                  <li key={index} className="text-sm text-gray-600">{adv}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Recommended Actions</h4>
              <ul className="list-disc list-inside space-y-1">
                {(result.recommendedActions || []).map((action, index) => (
                  <li key={index} className="text-sm text-gray-600">{action}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}