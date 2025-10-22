'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Table, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExcelHelperInput, ExcelHelperOutput } from '@/shared/schemas';

const formSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  context: z.string().optional(),
  excelVersion: z.string().optional(),
});

export function ExcelHelperForm() {
  const [result, setResult] = useState<ExcelHelperOutput | null>(null);

  const form = useForm<ExcelHelperInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      context: '',
      excelVersion: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ExcelHelperInput) => {
      const response = await fetch('/api/agent/excel-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get Excel help');
      }

      const result = await response.json();
      return result.data as ExcelHelperOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: ExcelHelperInput) => {
    mutation.mutate(data);
  };

  const copyFormula = () => {
    if (!result?.formula) return;
    navigator.clipboard.writeText(result.formula);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Excel Helper
          </CardTitle>
          <CardDescription>
            Get Excel formulas, solutions, and step-by-step instructions for your spreadsheet needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., How do I sum values based on multiple conditions? How can I remove duplicates? What's the formula for calculating percentage change?"
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
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide additional context about your spreadsheet, data structure, or specific requirements..."
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
                name="excelVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excel Version (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Excel version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excel-365">Excel 365</SelectItem>
                        <SelectItem value="excel-2021">Excel 2021</SelectItem>
                        <SelectItem value="excel-2019">Excel 2019</SelectItem>
                        <SelectItem value="excel-2016">Excel 2016</SelectItem>
                        <SelectItem value="excel-2013">Excel 2013</SelectItem>
                        <SelectItem value="excel-online">Excel Online</SelectItem>
                        <SelectItem value="google-sheets">Google Sheets</SelectItem>
                      </SelectContent>
                    </Select>
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
                    Getting Help...
                  </>
                ) : (
                  <>
                    <Table className="w-4 h-4 mr-2" />
                    Get Excel Help
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
                        <p>The Excel helper feature requires a Google AI API key to work.</p>
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
                  'An error occurred while getting Excel help. Please try again.'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Excel Solution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Answer</h4>
              <p className="text-sm text-gray-600">{result.answer}</p>
            </div>

            {result.formula && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-700">Formula</h4>
                  <Button onClick={copyFormula} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                  {result.formula}
                </div>
              </div>
            )}

            {result.steps && result.steps.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Step-by-Step Instructions</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {result.steps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-600">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.alternativeSolutions && result.alternativeSolutions.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Alternative Solutions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.alternativeSolutions.map((solution, index) => (
                    <li key={index} className="text-sm text-gray-600">{solution}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.tips && result.tips.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Tips & Best Practices</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600">{tip}</li>
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