import { useState, useEffect, useCallback } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  file_type: string;
  file_size?: number;
  tags: string[];
  source_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
}

interface RAGSearchResult {
  answer: string;
  sources: Array<{
    type: 'knowledge' | 'company';
    id: string;
    title: string;
    content: string;
    similarity: number;
    metadata: any;
  }>;
  context: string;
  query: string;
  response_time_ms: number;
  usage_id: string;
}

interface KnowledgeBaseStats {
  total_documents: number;
  total_chunks: number;
  total_size_bytes: number;
  avg_chunks_per_document: number;
  most_common_tags: string[];
  recent_uploads: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
}

interface UsageAnalytics {
  total_queries: number;
  avg_response_time: number;
  avg_relevance_score: number;
  recent_queries: Array<{
    id: string;
    query: string;
    response: string;
    response_time_ms: number;
    created_at: string;
  }>;
  daily_usage: Array<{
    date: string;
    count: number;
  }>;
}

interface UseRAGReturn {
  // Document Management
  documents: Document[];
  loading: boolean;
  error: string | null;
  
  // Actions
  uploadDocument: (file: File, metadata: {
    title: string;
    tags?: string[];
    source_url?: string;
    userId: string;
  }) => Promise<{ success: boolean; documentId?: string; error?: string }>;
  
  createDocument: (content: string, metadata: {
    title: string;
    tags?: string[];
    source_url?: string;
    file_type?: string;
    userId: string;
  }) => Promise<{ success: boolean; documentId?: string; error?: string }>;
  
  updateDocument: (documentId: string, updates: {
    title?: string;
    tags?: string[];
    userId: string;
  }) => Promise<boolean>;
  
  deleteDocument: (documentId: string, userId: string) => Promise<boolean>;
  
  getProcessingStatus: (documentId: string) => Promise<ProcessingStatus | null>;
  
  // Search
  search: (query: string, userId: string, options?: {
    match_count?: number;
    similarity_threshold?: number;
    filter_tags?: string[];
    include_company_research?: boolean;
  }) => Promise<RAGSearchResult | null>;
  
  retrieve: (query: string, userId: string, options?: {
    match_count?: number;
    similarity_threshold?: number;
    filter_tags?: string[];
    include_company_research?: boolean;
  }) => Promise<any>;
  
  // Analytics
  getKnowledgeBaseStats: (userId: string) => Promise<KnowledgeBaseStats | null>;
  getUsageAnalytics: (userId: string, options?: {
    days?: number;
    limit?: number;
  }) => Promise<UsageAnalytics | null>;
  
  // Refresh
  refreshDocuments: (userId: string, options?: {
    limit?: number;
    offset?: number;
    tags?: string[];
    search?: string;
  }) => Promise<void>;
}

export function useRAG(userId?: string): UseRAGReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API helper function
  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }

    return response.json();
  }, []);

  // Upload document
  const uploadDocument = useCallback(async (
    file: File,
    metadata: {
      title: string;
      tags?: string[];
      source_url?: string;
      userId: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', metadata.title);
      formData.append('user_id', metadata.userId);
      
      if (metadata.tags) {
        formData.append('tags', metadata.tags.join(','));
      }
      
      if (metadata.source_url) {
        formData.append('source_url', metadata.source_url);
      }

      const result = await apiCall('/api/rag/upload', {
        method: 'POST',
        body: formData,
      });

      if (result.success) {
        await refreshDocuments(metadata.userId);
        return { success: true, documentId: result.document_id };
      } else {
        return { success: false, error: 'Failed to upload document' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Create document from text
  const createDocument = useCallback(async (
    content: string,
    metadata: {
      title: string;
      tags?: string[];
      source_url?: string;
      file_type?: string;
      userId: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall('/api/rag/documents', {
        method: 'POST',
        body: JSON.stringify({
          content,
          title: metadata.title,
          source_url: metadata.source_url,
          file_type: metadata.file_type || 'text',
          tags: metadata.tags || [],
          user_id: metadata.userId
        }),
      });

      if (result.success) {
        await refreshDocuments(metadata.userId);
        return { success: true, documentId: result.document_id };
      } else {
        return { success: false, error: 'Failed to create document' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Update document
  const updateDocument = useCallback(async (
    documentId: string,
    updates: {
      title?: string;
      tags?: string[];
      userId: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(`/api/rag/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          user_id: updates.userId,
          title: updates.title,
          tags: updates.tags
        }),
      });

      if (result.success) {
        await refreshDocuments(updates.userId);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Delete document
  const deleteDocument = useCallback(async (documentId: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(`/api/rag/documents/${documentId}?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        return true;
      } else {
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Get processing status
  const getProcessingStatus = useCallback(async (documentId: string): Promise<ProcessingStatus | null> => {
    try {
      const result = await apiCall(`/api/rag/documents/${documentId}?user_id=${userId}`);
      return result.status || null;
    } catch (err) {
      console.error('Failed to get processing status:', err);
      return null;
    }
  }, [apiCall, userId]);

  // Search with RAG
  const search = useCallback(async (
    query: string,
    userId: string,
    options: {
      match_count?: number;
      similarity_threshold?: number;
      filter_tags?: string[];
      include_company_research?: boolean;
    } = {}
  ): Promise<RAGSearchResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall('/api/rag/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          user_id: userId,
          ...options
        }),
      });

      return result.result || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Retrieve documents (without LLM generation)
  const retrieve = useCallback(async (
    query: string,
    userId: string,
    options: {
      match_count?: number;
      similarity_threshold?: number;
      filter_tags?: string[];
      include_company_research?: boolean;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        user_id: userId,
        match_count: (options.match_count || 5).toString(),
        similarity_threshold: (options.similarity_threshold || 0.7).toString(),
        include_company_research: (options.include_company_research !== false).toString()
      });

      if (options.filter_tags) {
        params.append('filter_tags', options.filter_tags.join(','));
      }

      const result = await apiCall(`/api/rag/search?${params}`);
      return result.retrieval_result || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Get knowledge base statistics
  const getKnowledgeBaseStats = useCallback(async (userId: string): Promise<KnowledgeBaseStats | null> => {
    try {
      const result = await apiCall(`/api/rag/analytics?type=stats&user_id=${userId}`);
      return result.data || null;
    } catch (err) {
      console.error('Failed to get knowledge base stats:', err);
      return null;
    }
  }, [apiCall]);

  // Get usage analytics
  const getUsageAnalytics = useCallback(async (
    userId: string,
    options: {
      days?: number;
      limit?: number;
    } = {}
  ): Promise<UsageAnalytics | null> => {
    try {
      const params = new URLSearchParams({
        type: 'usage',
        user_id: userId,
        days: (options.days || 30).toString(),
        limit: (options.limit || 100).toString()
      });

      const result = await apiCall(`/api/rag/analytics?${params}`);
      return result.data || null;
    } catch (err) {
      console.error('Failed to get usage analytics:', err);
      return null;
    }
  }, [apiCall]);

  // Refresh documents list
  const refreshDocuments = useCallback(async (
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      tags?: string[];
      search?: string;
    } = {}
  ) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        user_id: userId,
        limit: (options.limit || 10).toString(),
        offset: (options.offset || 0).toString()
      });

      if (options.tags) {
        params.append('tags', options.tags.join(','));
      }

      if (options.search) {
        params.append('search', options.search);
      }

      const result = await apiCall(`/api/rag/documents?${params}`);
      
      if (result.success) {
        setDocuments(result.documents || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Auto-refresh documents when userId changes
  useEffect(() => {
    if (userId) {
      refreshDocuments(userId);
    }
  }, [userId, refreshDocuments]);

  return {
    // Document Management
    documents,
    loading,
    error,
    
    // Actions
    uploadDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    getProcessingStatus,
    
    // Search
    search,
    retrieve,
    
    // Analytics
    getKnowledgeBaseStats,
    getUsageAnalytics,
    
    // Refresh
    refreshDocuments
  };
}

// Hook for managing a single document
export function useRAGDocument(documentId: string, userId?: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getProcessingStatus: getDocStatus } = useRAG(userId);

  const refreshDocument = useCallback(async () => {
    if (!documentId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const status = await getDocStatus(documentId);
      setProcessingStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentId, userId, getDocStatus]);

  useEffect(() => {
    refreshDocument();
    
    // Set up polling for processing status
    if (processingStatus?.status === 'processing') {
      const interval = setInterval(refreshDocument, 2000);
      return () => clearInterval(interval);
    }
  }, [refreshDocument, processingStatus?.status]);

  return {
    document,
    processingStatus,
    loading,
    error,
    refreshDocument
  };
}