'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Search, 
  FileText, 
  Tag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  BarChart3,
  Trash2,
  Edit,
  Plus,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useRAG, useRAGDocument } from '@/hooks/useRAG';

export default function RAGDashboard() {
  const [userId] = useState('demo-user'); // In real app, get from auth
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const {
    documents,
    loading,
    error,
    uploadDocument,
    createDocument,
    deleteDocument,
    search,
    getKnowledgeBaseStats,
    getUsageAnalytics,
    refreshDocuments
  } = useRAG(userId);

  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: '',
    tags: '',
    sourceUrl: ''
  });

  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    tags: '',
    sourceUrl: '',
    fileType: 'text'
  });

  // Load analytics on mount
  useEffect(() => {
    const loadAnalytics = async () => {
      const [statsData, analyticsData] = await Promise.all([
        getKnowledgeBaseStats(userId),
        getUsageAnalytics(userId)
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    };

    loadAnalytics();
  }, [userId, getKnowledgeBaseStats, getUsageAnalytics]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadDocument(file, {
      title: uploadForm.title || file.name,
      tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      sourceUrl: uploadForm.sourceUrl,
      userId
    });

    if (result.success) {
      setUploadModalOpen(false);
      setUploadForm({ title: '', tags: '', sourceUrl: '' });
    }
  };

  // Handle text document creation
  const handleCreateDocument = async () => {
    if (!createForm.title || !createForm.content) return;

    const result = await createDocument(createForm.content, {
      title: createForm.title,
      tags: createForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      sourceUrl: createForm.sourceUrl,
      file_type: createForm.fileType,
      userId
    });

    if (result.success) {
      setCreateModalOpen(false);
      setCreateForm({ title: '', content: '', tags: '', sourceUrl: '', fileType: 'text' });
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const result = await search(searchQuery, userId, {
      match_count: 5,
      similarity_threshold: 0.7,
      include_company_research: true
    });

    setSearchResults(result);
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(documentId, userId);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">RAG Knowledge Base</h1>
            <p className="text-muted-foreground">
              Upload documents and search your knowledge base with AI
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button onClick={() => setCreateModalOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Document
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_documents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total_chunks} chunks
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.total_size_bytes / 1024 / 1024).toFixed(1)} MB
                </div>
                <p className="text-xs text-muted-foreground">
                  Total storage used
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Chunks</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avg_chunks_per_document}</div>
                <p className="text-xs text-muted-foreground">
                  Per document
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queries</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.total_queries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total searches
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="search" className="space-y-4">
          <TabsList>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Knowledge Base</CardTitle>
                <CardDescription>
                  Ask questions and get answers from your documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {searchResults && (
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-semibold mb-2">Answer</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {searchResults.answer}
                      </p>
                    </div>

                    {searchResults.sources.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Sources</h4>
                        <div className="space-y-2">
                          {searchResults.sources.map((source: any, index: number) => (
                            <Card key={index} className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{source.type}</Badge>
                                    <span className="text-sm font-medium">{source.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(source.similarity * 100)}% match
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {source.content}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Response time: {searchResults.response_time_ms}ms
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Manage your knowledge base documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No documents yet</p>
                    <p className="text-sm text-muted-foreground">
                      Upload your first document to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={() => handleDeleteDocument(doc.id)}
                        userId={userId}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Queries</span>
                        <span className="font-semibold">{analytics.total_queries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response Time</span>
                        <span className="font-semibold">{analytics.avg_response_time}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Relevance Score</span>
                        <span className="font-semibold">
                          {Math.round(analytics.avg_relevance_score * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {analytics.recent_queries.slice(0, 10).map((query: any, index: number) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium">{query.query}</p>
                              <p className="text-muted-foreground">
                                {new Date(query.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>
                  Upload a PDF, TXT, or MD file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Document title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Source URL (optional)</label>
                  <Input
                    value={uploadForm.sourceUrl}
                    onChange={(e) => setUploadForm({ ...uploadForm, sourceUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">File</label>
                  <Input
                    type="file"
                    accept=".txt,.md,.pdf"
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => setUploadModalOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Document Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create Document</CardTitle>
                <CardDescription>
                  Create a new document from text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Document title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                    placeholder="Document content..."
                    rows={10}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Source URL (optional)</label>
                  <Input
                    value={createForm.sourceUrl}
                    onChange={(e) => setCreateForm({ ...createForm, sourceUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateDocument} className="flex-1">
                    Create Document
                  </Button>
                  <Button onClick={() => setCreateModalOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({ document, onDelete, userId }: {
  document: any;
  onDelete: () => void;
  userId: string;
}) {
  const { processingStatus } = useRAGDocument(document.id, userId);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{document.title}</h3>
            {processingStatus && getStatusIcon(processingStatus.status)}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{document.file_type}</Badge>
            {document.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Size: {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown'}</p>
            <p>Created: {new Date(document.created_at).toLocaleDateString()}</p>
            {document.source_url && (
              <p>
                Source: <a href={document.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {document.source_url}
                </a>
              </p>
            )}
          </div>
          
          {processingStatus?.error_message && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Error: {processingStatus.error_message}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}