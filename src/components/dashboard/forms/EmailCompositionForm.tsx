'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailCompositionInput, EmailCompositionOutput } from '@/shared/schemas';
<<<<<<< HEAD
import { saveTaskToHistory } from '@/components/dashboard/history-sidebar';
=======
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2

const formSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  tone: z.enum(['formal', 'casual', 'friendly', 'professional', 'urgent']),
  purpose: z.string().min(1, 'Purpose is required'),
  keyPoints: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
});

export function EmailCompositionForm() {
  const [result, setResult] = useState<EmailCompositionOutput | null>(null);
  const [keyPointsInput, setKeyPointsInput] = useState('');

  const form = useForm<EmailCompositionInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      subject: '',
      tone: 'professional',
      purpose: '',
      keyPoints: [],
      callToAction: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EmailCompositionInput) => {
      const response = await fetch('/api/agent/compose-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to compose email');
      }

      const result = await response.json();
      return result.data as EmailCompositionOutput;
    },
    onSuccess: (data) => {
      setResult(data);
<<<<<<< HEAD
      // Save to history
      saveTaskToHistory('compose-email', mutation.variables as EmailCompositionInput, data);
=======
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
    },
  });

  const onSubmit = (data: EmailCompositionInput) => {
    // Convert keyPointsInput to array if provided
    if (keyPointsInput.trim()) {
      data.keyPoints = keyPointsInput.split('\n').filter(point => point.trim());
    }
    mutation.mutate(data);
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    const emailText = `Subject: ${result.subject}\n\n${result.body}`;
    navigator.clipboard.writeText(emailText);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email
          </CardTitle>
          <CardDescription>
            Draft professional emails with the appropriate tone and structure for your specific purpose.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe, Marketing Team, Client Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q4 Report, Meeting Invitation, Project Update" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select email tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of this email and what you want to achieve..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Key Points (Optional)</FormLabel>
                <p className="text-xs text-gray-500 mb-2">Enter each key point on a new line</p>
                <Textarea 
                  placeholder="Key point 1&#10;Key point 2&#10;Key point 3"
                  rows={4}
                  value={keyPointsInput}
                  onChange={(e) => setKeyPointsInput(e.target.value)}
                />
              </div>

              <FormField
                control={form.control}
                name="callToAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call to Action (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What specific action do you want the recipient to take?"
                        rows={2}
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
                    Composing Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Compose Email
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
                        <p>The email composition feature requires a Google AI API key to work.</p>
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
                  'An error occurred while composing the email. Please try again.'
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
                <CardTitle>Generated Email</CardTitle>
                <CardDescription>
                  {result.tone} tone • {result.wordCount} words
                </CardDescription>
              </div>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Subject</h4>
              <p className="text-sm font-medium">{result.subject}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Message</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {result.body}
                </pre>
              </div>
            </div>

            {result.suggestedImprovements && result.suggestedImprovements.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Suggested Improvements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.suggestedImprovements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-600">{improvement}</li>
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