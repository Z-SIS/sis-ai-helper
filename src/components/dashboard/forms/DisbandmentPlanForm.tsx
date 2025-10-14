'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { XCircle, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DisbandmentPlanInput, DisbandmentPlanOutput } from '@/shared/schemas';

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  reason: z.string().min(1, 'Reason is required'),
  timeline: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
});

export function DisbandmentPlanForm() {
  const [result, setResult] = useState<DisbandmentPlanOutput | null>(null);
  const [stakeholdersInput, setStakeholdersInput] = useState('');

  const form = useForm<DisbandmentPlanInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      reason: '',
      timeline: '',
      stakeholders: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DisbandmentPlanInput) => {
      const response = await fetch('/api/agent/disbandment-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate disbandment plan');
      }

      const result = await response.json();
      return result.data as DisbandmentPlanOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: DisbandmentPlanInput) => {
    // Convert stakeholders input to array if provided
    if (stakeholdersInput.trim()) {
      data.stakeholders = stakeholdersInput.split('\n').filter(stakeholder => stakeholder.trim());
    }
    mutation.mutate(data);
  };

  const downloadAsMarkdown = () => {
    if (!result) return;
    
    let markdown = `# Project Disbandment Plan: ${result.projectName}\n\n`;
    markdown += `**Reason:** ${result.reason}\n`;
    markdown += `**Disbandment Date:** ${result.disbandmentDate}\n\n`;
    markdown += `## Disbandment Phases\n`;
    result.phases.forEach(phase => {
      markdown += `### Phase ${phase.phase}: ${phase.name}\n`;
      markdown += `**Duration:** ${phase.duration}\n\n`;
      markdown += `**Description:** ${phase.description}\n\n`;
      markdown += `**Tasks:**\n`;
      phase.tasks.forEach(task => {
        markdown += `- ${task}\n`;
      });
      markdown += `\n**Responsible:** ${phase.responsible}\n\n`;
    });
    markdown += `## Asset Distribution\n`;
    result.assetDistribution.forEach(asset => {
      markdown += `### ${asset.asset}\n`;
      markdown += `**Disposition:** ${asset.disposition}\n`;
      markdown += `**Responsible:** ${asset.responsible}\n\n`;
    });
    markdown += `## Knowledge Transfer\n`;
    result.knowledgeTransfer.forEach(transfer => {
      markdown += `### ${transfer.knowledgeArea}\n`;
      markdown += `**Recipient:** ${transfer.recipient}\n`;
      markdown += `**Method:** ${transfer.method}\n`;
      markdown += `**Deadline:** ${transfer.deadline}\n\n`;
    });
    markdown += `## Legal Considerations\n`;
    result.legalConsiderations.forEach(consideration => {
      markdown += `- ${consideration}\n`;
    });
    markdown += `\n## Communication Plan\n${result.communicationPlan}\n\n`;
    markdown += `## Final Checklist\n`;
    result.finalChecklist.forEach(item => {
      markdown += `- [ ] ${item}\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.projectName.replace(/\s+/g, '_')}_Disbandment_Plan.md`;
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
            <XCircle className="w-5 h-5" />
            Disbandment Plan
          </CardTitle>
          <CardDescription>
            Create a comprehensive project wind-down plan with phases, asset distribution, and knowledge transfer.
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
                      <Input placeholder="e.g., Legacy System Migration, Pilot Program, R&D Initiative" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Disbandment *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why this project is being disbanded..."
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
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 months, By end of Q1, 90 days" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Stakeholders (Optional)</FormLabel>
                <p className="text-xs text-gray-500 mb-2">Enter each stakeholder on a new line</p>
                <Textarea 
                  placeholder="Project Manager&#10;Development Team&#10;Business Stakeholders&#10;IT Department"
                  rows={4}
                  value={stakeholdersInput}
                  onChange={(e) => setStakeholdersInput(e.target.value)}
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
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Generate Disbandment Plan
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
                <CardTitle>{result.projectName} Disbandment Plan</CardTitle>
                <CardDescription>
                  Reason: {result.reason} • Target: {result.disbandmentDate}
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
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Disbandment Phases</h4>
              <div className="space-y-4">
                {result.phases.map((phase) => (
                  <Card key={phase.phase} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Phase {phase.phase}: {phase.name}
                        </CardTitle>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{phase.description}</p>
                      
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Tasks</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {phase.tasks.map((task, index) => (
                            <li key={index} className="text-xs text-gray-600">{task}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Responsible</h5>
                        <p className="text-xs text-gray-600">{phase.responsible}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Asset Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.assetDistribution.map((asset, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{asset.asset}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h5 className="font-medium text-xs text-gray-700">Disposition</h5>
                        <p className="text-xs text-gray-600">{asset.disposition}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-xs text-gray-700">Responsible</h5>
                        <p className="text-xs text-gray-600">{asset.responsible}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Knowledge Transfer</h4>
              <div className="space-y-3">
                {result.knowledgeTransfer.map((transfer, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{transfer.knowledgeArea}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-xs text-gray-700">Recipient</h5>
                          <p className="text-xs text-gray-600">{transfer.recipient}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-xs text-gray-700">Method</h5>
                          <p className="text-xs text-gray-600">{transfer.method}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-xs text-gray-700">Deadline</h5>
                          <p className="text-xs text-gray-600">{transfer.deadline}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Legal Considerations</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.legalConsiderations.map((consideration, index) => (
                  <li key={index} className="text-sm text-gray-600">{consideration}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Communication Plan</h4>
              <p className="text-sm text-gray-600">{result.communicationPlan}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Final Checklist</h4>
              <ul className="space-y-1">
                {result.finalChecklist.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    <input type="checkbox" className="mr-2" readOnly />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}