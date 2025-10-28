-- Complete SIS AI Helper Database Migration
-- Generated: 2025-10-22T11:06:25.745Z
-- Project: https://mrofgjydvwjqbnhxrits.supabase.co
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire SQL script
-- 2. Go to: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql
-- 3. Paste and execute the script
-- 4. Wait for completion and verify no errors

-- Schema file for SIS AI Helper Project
-- Production Project: https://supabase.com/dashboard/project/mrofgjydvwjqbnhxrits
-- Last synchronized: 2025-10-22
-- 
-- ⚠️ CRITICAL ELEMENTS - DO NOT MODIFY:
-- - company_research_cache table
-- - match_company_research function  
-- - vector indexes (HNSW/ivfflat)
-- - core document tables

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Base Documents
CREATE TABLE knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source_url TEXT,
  content TEXT,
  file_type TEXT, -- pdf, txt, md, etc.
  file_size INTEGER,
  tags TEXT[],
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Chunks with Embeddings (pgvector)
CREATE TABLE knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Company Research Cache (CRITICAL TABLE - DO NOT MODIFY)
CREATE TABLE company_research_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  industry TEXT,
  location TEXT,
  description TEXT,
  website TEXT,
  founded_year INTEGER,
  employee_count TEXT,
  revenue TEXT,
  key_executives JSONB,
  competitors JSONB,
  recent_news JSONB,
  research_data JSONB NOT NULL,
  -- Vector field for semantic search (CRITICAL - DO NOT MODIFY)
  company_embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Usage Analytics
CREATE TABLE knowledge_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  retrieved_chunks TEXT[], -- Array of chunk IDs
  response TEXT,
  sources JSONB,
  relevance_score DECIMAL(3,2),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Processing Queue
CREATE TABLE document_processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast retrieval
-- ⚠️ CRITICAL INDEXES - DO NOT MODIFY
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_chunks_chunk_index ON knowledge_chunks(document_id, chunk_index);
CREATE INDEX idx_knowledge_documents_created_by ON knowledge_documents(created_by);
CREATE INDEX idx_knowledge_documents_tags ON knowledge_documents USING GIN(tags);
CREATE INDEX idx_company_research_cache_name ON company_research_cache(company_name);
CREATE INDEX idx_company_research_cache_updated_at ON company_research_cache(updated_at);
CREATE INDEX idx_knowledge_usage_user_id ON knowledge_usage(user_id);
CREATE INDEX idx_knowledge_usage_created_at ON knowledge_usage(created_at);
CREATE INDEX idx_document_processing_queue_status ON document_processing_queue(status);

-- Vector Search Function for Knowledge Chunks
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  similarity_threshold DECIMAL DEFAULT 0.7,
  filter_tags TEXT[] DEFAULT NULL,
  filter_created_by TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity DECIMAL,
  metadata JSONB,
  document_title TEXT,
  document_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kc.id,
    kc.document_id,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata,
    kd.title,
    kd.tags
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE 1 - (kc.embedding <=> query_embedding) > similarity_threshold
    AND (filter_tags IS NULL OR kd.tags && filter_tags)
    AND (filter_created_by IS NULL OR kd.created_by = filter_created_by)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Vector Search Function for Company Research (CRITICAL FUNCTION - DO NOT MODIFY)
CREATE OR REPLACE FUNCTION match_company_research(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 3,
  similarity_threshold DECIMAL DEFAULT 0.6
)
RETURNS TABLE(
  id UUID,
  company_name TEXT,
  description TEXT,
  industry TEXT,
  similarity DECIMAL,
  research_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crc.id,
    crc.company_name,
    crc.description,
    crc.industry,
    1 - (crc.company_embedding <=> query_embedding) AS similarity,
    crc.research_data
  FROM company_research_cache crc
  WHERE crc.company_embedding IS NOT NULL
    AND 1 - (crc.company_embedding <=> query_embedding) > similarity_threshold
  ORDER BY crc.company_embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update company embedding when research data changes
CREATE OR REPLACE FUNCTION update_company_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate embedding from company name and description
  -- This would be called from the application layer
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_knowledge_documents_updated_at 
  BEFORE UPDATE ON knowledge_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_research_cache_updated_at 
  BEFORE UPDATE ON company_research_cache 
  FOR EACH ROW EXECUTE FUNCTION update_company_embedding();

-- Row Level Security (RLS) policies
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;

-- Policies for knowledge_documents
CREATE POLICY "Users can view own documents" ON knowledge_documents
  FOR SELECT USING (auth.uid()::text = created_by);

CREATE POLICY "Users can insert own documents" ON knowledge_documents
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update own documents" ON knowledge_documents
  FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete own documents" ON knowledge_documents
  FOR DELETE USING (auth.uid()::text = created_by);

-- Policies for knowledge_chunks (inherited from documents)
CREATE POLICY "Users can view chunks from own documents" ON knowledge_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM knowledge_documents kd 
      WHERE kd.id = document_id AND kd.created_by = auth.uid()::text
    )
  );

-- Policies for company_research_cache (read access for all authenticated users)
CREATE POLICY "Authenticated users can view company research cache" ON company_research_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company research cache" ON company_research_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company research cache" ON company_research_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for knowledge_usage
CREATE POLICY "Users can view own usage" ON knowledge_usage
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own usage" ON knowledge_usage
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policies for document_processing_queue
CREATE POLICY "Users can view own processing queue" ON document_processing_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM knowledge_documents kd 
      WHERE kd.id = document_id AND kd.created_by = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own processing queue" ON document_processing_queue
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledge_documents kd 
      WHERE kd.id = document_id AND kd.created_by = auth.uid()::text
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup function for old usage logs
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM knowledge_usage 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get knowledge base statistics
CREATE OR REPLACE FUNCTION get_knowledge_base_stats(user_id_param TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_documents', COUNT(DISTINCT kd.id),
    'total_chunks', COUNT(kc.id),
    'total_size_bytes', COALESCE(SUM(kd.file_size), 0),
    'avg_chunks_per_document', ROUND(AVG(chunk_count), 2),
    'most_common_tags', (
      SELECT jsonb_agg(tag) FROM (
        SELECT tag, COUNT(*) as count 
        FROM knowledge_documents, unnest(tags) as tag
        WHERE (user_id_param IS NULL OR created_by = user_id_param)
        GROUP BY tag 
        ORDER BY count DESC 
        LIMIT 10
      ) top_tags
    ),
    'recent_uploads', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'title', title,
        'created_at', created_at
      )) FROM (
        SELECT id, title, created_at
        FROM knowledge_documents
        WHERE (user_id_param IS NULL OR created_by = user_id_param)
        ORDER BY created_at DESC
        LIMIT 5
      ) recent
    )
  ) INTO result
  FROM knowledge_documents kd
  LEFT JOIN knowledge_chunks kc ON kd.id = kc.document_id
  LEFT JOIN (
    SELECT document_id, COUNT(*) as chunk_count
    FROM knowledge_chunks
    GROUP BY document_id
  ) chunk_counts ON kd.id = chunk_counts.document_id
  WHERE (user_id_param IS NULL OR kd.created_by = user_id_param);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Migration: Enhanced Search Analytics and Performance
-- Date: 2025-10-22
-- Description: Adds search analytics, performance tracking, and optimization features
-- 
-- This migration enhances the existing RAG schema with:
-- 1. Search analytics and tracking
-- 2. Performance monitoring
-- 3. Enhanced document metadata
-- 4. Search result caching

-- Search Analytics Table
CREATE TABLE search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  query_type TEXT NOT NULL, -- 'knowledge', 'company', 'hybrid'
  search_params JSONB,
  results_count INTEGER,
  top_result_similarity DECIMAL(3,2),
  response_time_ms INTEGER,
  user_satisfaction INTEGER, -- 1-5 rating, optional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Feedback Table
CREATE TABLE document_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES knowledge_chunks(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL, -- 'helpful', 'not_helpful', 'irrelevant', 'outdated'
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search Result Cache Table
CREATE TABLE search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  query_embedding VECTOR(1536),
  search_params JSONB,
  result_data JSONB,
  hit_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enhanced Document Metadata
ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS 
  language TEXT DEFAULT 'en';

ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS 
  reading_time_minutes INTEGER;

ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS 
  difficulty_level TEXT; -- 'beginner', 'intermediate', 'advanced'

ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS 
  last_accessed TIMESTAMP WITH TIME ZONE;

ALTER TABLE knowledge_documents ADD COLUMN IF NOT EXISTS 
  access_count INTEGER DEFAULT 0;

-- Add indexes for new tables
CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX idx_search_analytics_query_type ON search_analytics(query_type);
CREATE INDEX idx_document_feedback_document_id ON document_feedback(document_id);
CREATE INDEX idx_document_feedback_user_id ON document_feedback(user_id);
CREATE INDEX idx_search_cache_cache_key ON search_cache(cache_key);
CREATE INDEX idx_search_cache_expires_at ON search_cache(expires_at);
CREATE INDEX idx_knowledge_documents_language ON knowledge_documents(language);
CREATE INDEX idx_knowledge_documents_last_accessed ON knowledge_documents(last_accessed);

-- Enhanced search function with analytics tracking
CREATE OR REPLACE FUNCTION match_knowledge_chunks_with_analytics(
  query_embedding VECTOR(1536),
  user_id_param TEXT,
  query_text_param TEXT,
  match_count INT DEFAULT 5,
  similarity_threshold DECIMAL DEFAULT 0.7,
  filter_tags TEXT[] DEFAULT NULL,
  filter_created_by TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity DECIMAL,
  metadata JSONB,
  document_title TEXT,
  document_tags TEXT[]
) AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
  end_time TIMESTAMP WITH TIME ZONE;
  response_time_ms INTEGER;
  results_count INTEGER;
BEGIN
  start_time = NOW();
  
  -- Perform the search
  RETURN QUERY
  SELECT 
    kc.id,
    kc.document_id,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata,
    kd.title,
    kd.tags
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE 1 - (kc.embedding <=> query_embedding) > similarity_threshold
    AND (filter_tags IS NULL OR kd.tags && filter_tags)
    AND (filter_created_by IS NULL OR kd.created_by = filter_created_by)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
  
  -- Calculate metrics
  GET DIAGNOSTICS results_count = ROW_COUNT;
  end_time = NOW();
  response_time_ms = EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
  
  -- Log analytics
  INSERT INTO search_analytics (
    user_id, 
    query_text, 
    query_type, 
    search_params, 
    results_count, 
    response_time_ms
  ) VALUES (
    user_id_param,
    query_text_param,
    'knowledge',
    jsonb_build_object(
      'match_count', match_count,
      'similarity_threshold', similarity_threshold,
      'filter_tags', filter_tags,
      'filter_created_by', filter_created_by
    ),
    results_count,
    response_time_ms
  );
  
  -- Update document access tracking
  UPDATE knowledge_documents 
  SET 
    last_accessed = NOW(),
    access_count = access_count + 1
  WHERE id IN (
    SELECT DISTINCT document_id 
    FROM knowledge_chunks kc
    WHERE kc.embedding IS NOT NULL
      AND 1 - (kc.embedding <=> query_embedding) > similarity_threshold
      AND (filter_tags IS NULL OR kd.tags && filter_tags)
      AND (filter_created_by IS NULL OR kd.created_by = filter_created_by)
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count
  );
  
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired search cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM search_cache 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get search analytics summary
CREATE OR REPLACE FUNCTION get_search_analytics_summary(
  days_back INTEGER DEFAULT 30,
  user_id_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_searches', COUNT(*),
    'avg_response_time_ms', ROUND(AVG(response_time_ms), 2),
    'avg_results_count', ROUND(AVG(results_count), 2),
    'search_types', (
      SELECT jsonb_agg(jsonb_build_object(
        'type', query_type,
        'count', COUNT(*),
        'percentage', ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)
      )) FROM (
        SELECT query_type, COUNT(*) as count
        FROM search_analytics
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
          AND (user_id_param IS NULL OR user_id = user_id_param)
        GROUP BY query_type
      ) type_counts
    ),
    'daily_searches', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', DATE(created_at),
        'count', COUNT(*)
      )) FROM (
        SELECT DATE(created_at) as created_at, COUNT(*) as count
        FROM search_analytics
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
          AND (user_id_param IS NULL OR user_id = user_id_param)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily_counts
    ),
    'top_queries', (
      SELECT jsonb_agg(jsonb_build_object(
        'query', query_text,
        'count', COUNT(*),
        'avg_results', ROUND(AVG(results_count), 2)
      )) FROM (
        SELECT query_text, COUNT(*) as count, AVG(results_count) as avg_results
        FROM search_analytics
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
          AND (user_id_param IS NULL OR user_id = user_id_param)
        GROUP BY query_text
        ORDER BY count DESC
        LIMIT 10
      ) top_queries
    )
  ) INTO result
  FROM search_analytics
  WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    AND (user_id_param IS NULL OR user_id = user_id_param);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security for new tables
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_analytics
CREATE POLICY "Users can view own search analytics" ON search_analytics
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own search analytics" ON search_analytics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for document_feedback
CREATE POLICY "Users can view own document feedback" ON document_feedback
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own document feedback" ON document_feedback
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own document feedback" ON document_feedback
  FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS Policies for search_cache (read access for all authenticated users)
CREATE POLICY "Authenticated users can view search cache" ON search_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert search cache" ON search_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update search cache" ON search_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger to update cache hit count
CREATE OR REPLACE FUNCTION update_cache_hit_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE search_cache 
  SET 
    hit_count = hit_count + 1,
    last_accessed = NOW()
  WHERE cache_key = NEW.cache_key;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cache hits (this would be called by application logic)
-- CREATE TRIGGER trigger_update_cache_hit_count
--   AFTER UPDATE ON search_cache
--   FOR EACH ROW EXECUTE FUNCTION update_cache_hit_count();

-- Grant permissions
GRANT SELECT, INSERT ON search_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON document_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE ON search_cache TO authenticated;
GRANT EXECUTE ON FUNCTION match_knowledge_chunks_with_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_analytics_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE search_analytics IS 'Tracks search queries and performance metrics for analytics';
COMMENT ON TABLE document_feedback IS 'User feedback on document relevance and quality';
COMMENT ON TABLE search_cache IS 'Caches search results to improve performance';
COMMENT ON COLUMN knowledge_documents.language IS 'Document language code (ISO 639-1)';
COMMENT ON COLUMN knowledge_documents.reading_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN knowledge_documents.difficulty_level IS 'Content difficulty: beginner, intermediate, advanced';
COMMENT ON COLUMN knowledge_documents.last_accessed IS 'Last time the document was accessed';
COMMENT ON COLUMN knowledge_documents.access_count IS 'Number of times the document has been accessed';

-- Migration completed successfully!
-- Verify tables by running: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
