'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { FileText, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SopGenerationInput, SopGenerationOutput } from '@/shared/schemas';

const formSchema = z.object({
  processName: z.string().min(1, 'Process name is required'),
  department: z.string().optional(),
  purpose: z.string().optional(),
  scope: z.string().optional(),
});

export function SopGenerationForm() {
  const [result, setResult] = useState<SopGenerationOutput | null>(null);

  const form = useForm<SopGenerationInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      processName: '',
      department: '',
      purpose: '',
      scope: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SopGenerationInput) => {
      const response = await fetch('/api/agent/generate-sop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate SOP');
      }

      const result = await response.json();
      return result.data as SopGenerationOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: SopGenerationInput) => {
    mutation.mutate(data);
  };

  const downloadAsMarkdown = () => {
    if (!result) return;
    
    let markdown = `# ${result.title}\n\n`;
    markdown += `**Version:** ${result.version}\n`;
    markdown += `**Date:** ${result.date}\n\n`;
    markdown += `## Purpose\n${result.purpose}\n\n`;
    markdown += `## Scope\n${result.scope}\n\n`;
    markdown += `## Responsibilities\n`;
    result.responsibilities.forEach(resp => {
      markdown += `- ${resp}\n`;
    });
    markdown += `\n## Procedure\n`;
    result.procedure.forEach(step => {
      markdown += `### Step ${step.step}: ${step.action}\n`;
      markdown += `${step.details}\n`;
      markdown += `**Owner:** ${step.owner}\n\n`;
    });
    
    if (result.references && result.references.length > 0) {
      markdown += `## References\n`;
      result.references.forEach(ref => {
        markdown += `- ${ref}\n`;
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '_')}_SOP.md`;
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
            <FileText className="w-5 h-5" />
            Generate Standard Operating Procedure
          </CardTitle>
          <CardDescription>
            Create a comprehensive Standard Operating Procedure (SOP) for any business process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="processName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Employee Onboarding, Incident Response, Quality Assurance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HR, IT, Operations, Security" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of this SOP and what it aims to achieve..."
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
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Define the scope, boundaries, and applicability of this SOP..."
                        rows={3}
                        {...field} 
                      />
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
                    Generating SOP...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate SOP
                  </>
                )}
              </Button>
            </form>
          </Form>

          {mutation.error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>
                {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
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
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>
                  Version {result.version} • {result.date}
                </CardDescription>
              </div>
              <Button onClick={downloadAsMarkdown} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Purpose</h4>
              <p className="text-sm text-gray-600">{result.purpose}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Scope</h4>
              <p className="text-sm text-gray-600">{result.scope}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-sm text-gray-600">{responsibility}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Procedure</h4>
              <div className="space-y-4">
                {result.procedure.map((step) => (
                  <div key={step.step} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Step {step.step}
                      </span>
                      <h5 className="font-medium text-sm">{step.action}</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.details}</p>
                    <p className="text-xs text-gray-500">
                      <strong>Owner:</strong> {step.owner}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {result.references && result.references.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">References</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.references.map((reference, index) => (
                    <li key={index} className="text-sm text-gray-600">{reference}</li>
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