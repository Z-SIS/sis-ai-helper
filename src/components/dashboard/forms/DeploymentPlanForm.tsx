'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Rocket, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AgentInput, AgentOutput } from '@/shared/schemas';

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectType: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  teamSize: z.number().optional(),
  timeline: z.string().optional(),
});

export function DeploymentPlanForm() {
  const [result, setResult] = useState<AgentOutput | null>(null);

  const form = useForm<AgentInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      projectType: '',
      environment: 'production',
      teamSize: undefined,
      timeline: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AgentInput) => {
      const response = await fetch('/api/agent/deployment-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate deployment plan');
      }

      const result = await response.json();
      
      // Check if the response has an error
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to generate deployment plan');
      }
      
      return result.data as AgentOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: AgentInput) => {
    mutation.mutate(data);
  };

  const downloadAsMarkdown = () => {
    if (!result) return;
    
    let markdown = `# ${result.projectName || 'Project'} Deployment Plan\n\n`;
    markdown += `**Deployment Strategy:** ${result.deploymentStrategy || 'N/A'}\n\n`;
    markdown += `## Prerequisites\n`;
    if (result.prerequisites && result.prerequisites.length > 0) {
      result.prerequisites.forEach(prereq => {
        markdown += `- ${prereq}\n`;
      });
    } else {
      markdown += 'No prerequisites specified\n';
    }
    markdown += `\n## Deployment Phases\n`;
    if (result.phases && result.phases.length > 0) {
      result.phases.forEach(phase => {
        markdown += `### Phase ${phase.phase}: ${phase.name || 'Unnamed Phase'}\n`;
        markdown += `**Duration:** ${phase.duration || 'N/A'}\n\n`;
        markdown += `**Description:** ${phase.description || 'No description'}\n\n`;
        markdown += `**Tasks:**\n`;
        if (phase.tasks && phase.tasks.length > 0) {
          phase.tasks.forEach(task => {
            markdown += `- ${task}\n`;
          });
        } else {
          markdown += '- No tasks specified\n';
        }
        markdown += `\n**Dependencies:** ${phase.dependencies?.join(', ') || 'None'}\n\n`;
        markdown += `**Rollback Plan:** ${phase.rollbackPlan || 'No rollback plan'}\n\n`;
      });
    } else {
      markdown += 'No deployment phases specified\n\n';
    }
    markdown += `## Success Criteria\n`;
    if (result.successCriteria && result.successCriteria.length > 0) {
      result.successCriteria.forEach(criteria => {
        markdown += `- ${criteria}\n`;
      });
    } else {
      markdown += 'No success criteria specified\n';
    }
    markdown += `\n## Monitoring\n`;
    if (result.monitoring && result.monitoring.length > 0) {
      result.monitoring.forEach(item => {
        markdown += `- ${item}\n`;
      });
    } else {
      markdown += 'No monitoring items specified\n';
    }
    markdown += `\n## Communication Plan\n${result.communicationPlan || 'No communication plan specified'}\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(result.projectName || 'Project').replace(/\s+/g, '_')}_Deployment_Plan.md`;
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
            <Rocket className="w-5 h-5" />
            Deployment Plan
          </CardTitle>
          <CardDescription>
            Create a comprehensive deployment plan with phases, tasks, and rollback procedures.
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
                      <Input placeholder="e.g., E-commerce Platform, Mobile App, API Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Web Application, Mobile App, Microservices, Database" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Environment *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 5, 10, 15"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
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
                      <Input placeholder="e.g., 2 weeks, 1 month, Q1 2024" {...field} />
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
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Generate Deployment Plan
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
                        <p>The deployment plan feature requires a Google AI API key to work.</p>
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
                  'An error occurred while generating the deployment plan. Please try again.'
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
                <CardTitle>{result.projectName} Deployment Plan</CardTitle>
                <CardDescription>{result.deploymentStrategy}</CardDescription>
              </div>
              <Button onClick={downloadAsMarkdown} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Prerequisites</h4>
              <ul className="list-disc list-inside space-y-1">
                {(result.prerequisites || []).map((prereq, index) => (
                  <li key={index} className="text-sm text-gray-600">{prereq}</li>
                )) || <li className="text-sm text-gray-500">No prerequisites specified</li>}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Deployment Phases</h4>
              <div className="space-y-4">
                {(result.phases || []).map((phase) => (
                  <Card key={phase.phase} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Phase {phase.phase}: {phase.name || 'Unnamed Phase'}
                        </CardTitle>
                        <Badge variant="outline">{phase.duration || 'No duration'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{phase.description || 'No description'}</p>
                      
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Tasks</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {(phase.tasks || []).map((task, index) => (
                            <li key={index} className="text-xs text-gray-600">{task}</li>
                          )) || <li className="text-xs text-gray-500">No tasks specified</li>}
                        </ul>
                      </div>

                      {phase.dependencies && phase.dependencies.length > 0 && (
                        <div>
                          <h5 className="font-medium text-xs text-gray-700 mb-1">Dependencies</h5>
                          <div className="flex flex-wrap gap-1">
                            {phase.dependencies.map((dep, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Rollback Plan</h5>
                        <p className="text-xs text-gray-600">{phase.rollbackPlan || 'No rollback plan'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )) || <p className="text-sm text-gray-500">No deployment phases specified</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Success Criteria</h4>
              <ul className="list-disc list-inside space-y-1">
                {(result.successCriteria || []).map((criteria, index) => (
                  <li key={index} className="text-sm text-gray-600">{criteria}</li>
                )) || <li className="text-sm text-gray-500">No success criteria specified</li>}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Monitoring</h4>
              <ul className="list-disc list-inside space-y-1">
                {(result.monitoring || []).map((item, index) => (
                  <li key={index} className="text-sm text-gray-600">{item}</li>
                )) || <li className="text-sm text-gray-500">No monitoring items specified</li>}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Communication Plan</h4>
              <p className="text-sm text-gray-600">{result.communicationPlan || 'No communication plan specified'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}