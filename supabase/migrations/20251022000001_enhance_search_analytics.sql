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