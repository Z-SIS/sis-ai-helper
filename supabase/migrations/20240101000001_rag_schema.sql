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

-- Enhanced Company Research Cache (existing table with vector support)
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
  -- Add vector field for semantic search
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

-- Vector Search Function for Company Research
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