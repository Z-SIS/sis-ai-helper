'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AgentInput, FeasibilityCheckAgentOutput } from '@/shared/schemas';

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  resources: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

export function FeasibilityCheckForm() {
  const [result, setResult] = useState<FeasibilityCheckAgentOutput | null>(null);
  const [resourcesInput, setResourcesInput] = useState('');
  const [constraintsInput, setConstraintsInput] = useState('');

  type FeasibilityCheckInput = z.infer<typeof formSchema>;

const form = useForm<FeasibilityCheckInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      description: '',
      budget: '',
      timeline: '',
      resources: [],
      constraints: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FeasibilityCheckInput) => {
      const response = await fetch('/api/agent/feasibility-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check feasibility');
      }

      const result = await response.json();
      return result.data as FeasibilityCheckAgentOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (formData: FeasibilityCheckInput) => {
    const data = {
      projectName: formData.projectName,
      description: formData.description,
      budget: formData.budget,
      timeline: formData.timeline,
      resources: resourcesInput.trim() ? resourcesInput.split('\n').filter(r => r.trim()) : undefined,
      constraints: constraintsInput.trim() ? constraintsInput.split('\n').filter(c => c.trim()) : undefined,
    };
    mutation.mutate(data);
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 75) {
      return 'text-green-600 bg-green-50';
    } else if (score >= 50) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  };

  const getFeasibilityIcon = (score: number) => {
    if (score >= 75) {
      return CheckCircle;
    } else if (score >= 50) {
      return AlertTriangle;
    } else {
      return TrendingUp;
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Helper: normalize different possible shapes for feasibility fields
  const ratingToNumber = (field: any): number => {
    if (!field) return 0;
    // If the field has a numeric score (0-100)
    if (typeof field.score === 'number') return field.score;
    // If the field itself is a number
    if (typeof field === 'number') return field;
    // If the field has a 'rating' string, map to approximate numeric
    if (typeof field.rating === 'string') {
      const r = field.rating.toLowerCase();
      if (r === 'high' || r === 'excellent') return 90;
      if (r === 'medium' || r === 'moderate') return 60;
      if (r === 'low' || r === 'poor') return 30;
    }
    // Fallback: try overall numeric-like values
    const asNumber = Number(field);
    if (!isNaN(asNumber)) return asNumber;
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Feasibility Check
          </CardTitle>
          <CardDescription>
            Assess the feasibility of your project across technical, financial, and resource dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mobile App Development, Office Expansion, Security System Upgrade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project in detail, including objectives, scope, and expected outcomes..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $50,000, $100k-200k, Under $10,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3 months, Q1 2024, 6-8 weeks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Resources (Optional)</FormLabel>
                <p className="text-xs text-gray-500 mb-2">Enter each resource on a new line</p>
                <Textarea 
                  placeholder="Development team&#10;Marketing budget&#10;Office space&#10;Equipment"
                  rows={4}
                  value={resourcesInput}
                  onChange={(e) => setResourcesInput(e.target.value)}
                />
              </div>

              <div>
                <FormLabel>Constraints (Optional)</FormLabel>
                <p className="text-xs text-gray-500 mb-2">Enter each constraint on a new line</p>
                <Textarea 
                  placeholder="Budget limitations&#10;Regulatory requirements&#10;Technical limitations&#10;Time constraints"
                  rows={4}
                  value={constraintsInput}
                  onChange={(e) => setConstraintsInput(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Feasibility...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check Feasibility
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
                        <p>The feasibility check feature requires a Google AI API key to work.</p>
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
                  'An error occurred while checking feasibility. Please try again.'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Feasibility Analysis for {result.data?.projectName || 'Project'}</span>
              <div className="flex items-center gap-2">
                <Badge className={getFeasibilityColor(Math.floor((result.data?.overallScore || 0) / 34))}>
                  {result.data?.overallScore || 0}% FEASIBILITY
                </Badge>
                <span className="text-sm font-medium">{result.data?.overallScore || 0}/100</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Overall Score</h4>
              <Progress value={result.score} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Score: {result.score}/100</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Technical Feasibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const scoreNum = ratingToNumber(result.technicalFeasibility);
                      const Icon = getFeasibilityIcon(scoreNum);
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <Badge className={getFeasibilityColor(ratingToNumber(result.technicalFeasibility))}>
                      {typeof result.technicalFeasibility?.rating === 'string' ? result.technicalFeasibility.rating : `${ratingToNumber(result.technicalFeasibility)}%`}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{result.technicalFeasibility.details}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Financial Feasibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const scoreNum = ratingToNumber(result.financialFeasibility);
                      const Icon = getFeasibilityIcon(scoreNum);
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <Badge className={getFeasibilityColor(ratingToNumber(result.financialFeasibility))}>
                      {typeof result.financialFeasibility?.rating === 'string' ? result.financialFeasibility.rating : `${ratingToNumber(result.financialFeasibility)}%`}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{result.financialFeasibility.details}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Resource Feasibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const scoreNum = ratingToNumber(result.resourceFeasibility);
                      const Icon = getFeasibilityIcon(scoreNum);
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <Badge className={getFeasibilityColor(ratingToNumber(result.resourceFeasibility))}>
                      {typeof result.resourceFeasibility?.rating === 'string' ? result.resourceFeasibility.rating : `${ratingToNumber(result.resourceFeasibility)}%`}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{result.resourceFeasibility.details}</p>
                </CardContent>
              </Card>
            </div>

            {result.risks && result.risks.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Risk Assessment</h4>
                <div className="space-y-3">
                  {(result.risks as any[]).map((risk, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      {typeof risk === 'string' ? (
                        <p className="text-sm text-gray-700">{risk}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{risk.risk}</span>
                            <Badge className={getFeasibilityColor(typeof risk.impact === 'number' ? risk.impact : ratingToNumber(risk.impact))}>
                              {risk.impact} impact
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-gray-600">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}