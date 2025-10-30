'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Presentation, FileDown, Loader2 } from 'lucide-react';
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
  topic: z.string().min(1, 'Topic is required'),
  audience: z.string().optional(),
  purpose: z.enum(['informative', 'persuasive', 'educational', 'update']),
  slideCount: z.number().min(1).max(20).optional(),
  keyPoints: z.array(z.string()).optional(),
});

export function SlideTemplateForm() {
  const [result, setResult] = useState<AgentOutput | null>(null);
  const [keyPointsInput, setKeyPointsInput] = useState('');

  const form = useForm<AgentInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      audience: '',
      purpose: 'informative',
      slideCount: undefined,
      keyPoints: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AgentInput) => {
      const response = await fetch('/api/agent/slide-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate slide template');
      }

      const result = await response.json();
      
      // Check if the response has an error
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to generate slide template');
      }
      
      return result.data as AgentOutput;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: AgentInput) => {
    // Convert keyPointsInput to array if provided
    if (keyPointsInput.trim()) {
      data.keyPoints = keyPointsInput.split('\n').filter(point => point.trim());
    }
    mutation.mutate(data);
  };

  const downloadAsMarkdown = () => {
    if (!result) return;
    
    let markdown = `# ${result.title || 'Presentation'}\n\n`;
    markdown += `**Subtitle:** ${result.subtitle || 'N/A'}\n`;
    markdown += `**Audience:** ${result.audience || 'N/A'}\n`;
    markdown += `**Purpose:** ${result.purpose || 'N/A'}\n`;
    markdown += `**Estimated Duration:** ${result.estimatedDuration || 'N/A'}\n\n`;
    markdown += `## Slides\n\n`;
    
    if (result.slides && result.slides.length > 0) {
      result.slides.forEach(slide => {
        markdown += `### Slide ${slide.slideNumber}: ${slide.title || 'Untitled'}\n\n`;
        if (slide.content && slide.content.length > 0) {
          slide.content.forEach(point => {
            markdown += `- ${point}\n`;
          });
        }
        if (slide.speakerNotes) {
          markdown += `\n**Speaker Notes:** ${slide.speakerNotes}\n`;
        }
        if (slide.visualSuggestions) {
          markdown += `**Visual Suggestions:** ${slide.visualSuggestions}\n`;
        }
        markdown += '\n';
      });
    } else {
      markdown += 'No slides available\n\n';
    }
    
    markdown += `## Presentation Tips\n`;
    if (result.presentationTips && result.presentationTips.length > 0) {
      result.presentationTips.forEach(tip => {
        markdown += `- ${tip}\n`;
      });
    } else {
      markdown += 'No presentation tips available\n';
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(result.title || 'Presentation').replace(/\s+/g, '_')}_Presentation.md`;
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
            <Presentation className="w-5 h-5" />
            Slide Template Generator
          </CardTitle>
          <CardDescription>
            Create a comprehensive presentation template with slide content, speaker notes, and visual suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentation Topic *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q4 Business Review, Security Best Practices, Product Launch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audience (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Executive Team, Technical Staff, Clients, General Public" {...field} />
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
                    <FormLabel>Purpose *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select presentation purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slideCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Slides (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 5, 10, 15"
                        min="1"
                        max="20"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Template...
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    Generate Slide Template
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
                        <p>The slide template feature requires a Google AI API key to work.</p>
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
                  'An error occurred while generating the slide template. Please try again.'
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
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>
                  {result.subtitle} • {result.audience} • {result.purpose} • {result.estimatedDuration}
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
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Slides</h4>
              <div className="space-y-4">
                {result.slides?.map((slide) => (
                  <Card key={slide.slideNumber} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Slide {slide.slideNumber}: {slide.title}
                        </CardTitle>
                        <Badge variant="outline">Slide {slide.slideNumber}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-2">Content</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {slide.content?.map((point, index) => (
                            <li key={index} className="text-xs text-gray-600">{point}</li>
                          ))}
                        </ul>
                      </div>

                      {slide.speakerNotes && (
                        <div>
                          <h5 className="font-medium text-xs text-gray-700 mb-1">Speaker Notes</h5>
                          <p className="text-xs text-gray-600 italic">{slide.speakerNotes}</p>
                        </div>
                      )}

                      {slide.visualSuggestions && (
                        <div>
                          <h5 className="font-medium text-xs text-gray-700 mb-1">Visual Suggestions</h5>
                          <p className="text-xs text-gray-600">{slide.visualSuggestions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )) || <p className="text-sm text-gray-500">No slides available</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Presentation Tips</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.presentationTips?.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600">{tip}</li>
                )) || <li className="text-sm text-gray-500">No presentation tips available</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}