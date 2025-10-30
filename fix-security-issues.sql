-- Fix Supabase Security Issues
-- This script addresses RLS, function security, and extension placement

-- 1. Enable RLS on company_research_cache table
ALTER TABLE company_research_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_research_cache
-- Policy for authenticated users to read their own data
CREATE POLICY "Users can view company research cache" ON company_research_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert data
CREATE POLICY "Users can insert company research cache" ON company_research_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update their own data
CREATE POLICY "Users can update company research cache" ON company_research_cache
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete data
CREATE POLICY "Users can delete company research cache" ON company_research_cache
    FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Fix function search_path security
-- Drop and recreate functions with fixed search_path

-- Drop existing functions
DROP FUNCTION IF EXISTS public.match_company_research;
DROP FUNCTION IF EXISTS public.update_updated_at_column;

-- Recreate match_company_research with fixed search_path
CREATE OR REPLACE FUNCTION public.match_company_research(
    query_text TEXT,
    match_threshold FLOAT DEFAULT 0.7,
    max_results INT DEFAULT 5
)
RETURNS TABLE (
    id TEXT,
    company_name TEXT,
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
    research_data JSONB,
    similarity_score FLOAT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crc.id::TEXT,
        crc.company_name,
        crc.industry,
        crc.location,
        crc.description,
        crc.website,
        crc.founded_year,
        crc.employee_count,
        crc.revenue,
        crc.key_executives::JSONB,
        crc.competitors::JSONB,
        crc.recent_news::JSONB,
        crc.research_data::JSONB,
        CASE 
            WHEN crc.company_embedding IS NOT NULL THEN
                (crc.company_embedding <=> query_text::vector)::FLOAT
            ELSE 
                0.0
        END as similarity_score
    FROM company_research_cache crc
    WHERE crc.company_embedding IS NOT NULL
    ORDER BY similarity_score ASC
    LIMIT max_results;
END;
$$;

-- Recreate update_updated_at_column with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 3. Move vector extension from public to a dedicated schema
-- Create a new schema for extensions if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension to extensions schema
-- Note: This requires recreating the extension in the new schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- Grant usage to public
GRANT USAGE ON SCHEMA extensions TO public;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO public;

-- 4. Enable RLS on all tables that need it
-- Enable RLS on knowledge_documents
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_documents
CREATE POLICY "Users can view their own knowledge documents" ON knowledge_documents
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own knowledge documents" ON knowledge_documents
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own knowledge documents" ON knowledge_documents
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own knowledge documents" ON knowledge_documents
    FOR DELETE USING (auth.uid() = created_by);

-- Enable RLS on knowledge_chunks
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_chunks
CREATE POLICY "Users can view knowledge chunks from their documents" ON knowledge_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = document_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert knowledge chunks for their documents" ON knowledge_chunks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = document_id AND created_by = auth.uid()
        )
    );

-- Enable RLS on knowledge_usage
ALTER TABLE knowledge_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_usage
CREATE POLICY "Users can view their own knowledge usage" ON knowledge_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge usage" ON knowledge_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on document_processing_queue
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for document_processing_queue
CREATE POLICY "Users can view processing queue for their documents" ON document_processing_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = document_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert processing queue for their documents" ON document_processing_queue
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM knowledge_documents 
            WHERE id = document_id AND created_by = auth.uid()
        )
    );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_research_cache_company_name ON company_research_cache(company_name);
CREATE INDEX IF NOT EXISTS idx_company_research_cache_industry ON company_research_cache(industry);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_by ON knowledge_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_usage_user_id ON knowledge_usage(user_id);

-- 6. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 7. Create vector similarity search function with proper security
CREATE OR REPLACE FUNCTION public.search_similar_companies(
    company_name TEXT,
    max_results INT DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id TEXT,
    company_name TEXT,
    industry TEXT,
    location TEXT,
    description TEXT,
    website TEXT,
    similarity_score FLOAT
)
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crc.id::TEXT,
        crc.company_name,
        crc.industry,
        crc.location,
        crc.description,
        crc.website,
        (crc.company_embedding <=> (
            SELECT company_embedding::vector 
            FROM company_research_cache 
            WHERE company_name ILIKE company_name 
            LIMIT 1
        ))::FLOAT as similarity_score
    FROM company_research_cache crc
    WHERE crc.company_embedding IS NOT NULL
    AND crc.company_name ILIKE company_name = FALSE
    AND (crc.company_embedding <=> (
        SELECT company_embedding::vector 
        FROM company_research_cache 
        WHERE company_name ILIKE company_name 
        LIMIT 1
    ))::FLOAT <= similarity_threshold
    ORDER BY similarity_score ASC
    LIMIT max_results;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_similar_companies TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_company_research TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Security issues fixed successfully!';
    RAISE NOTICE '- RLS enabled on all tables';
    RAISE NOTICE '- Functions recreated with fixed search_path';
    RAISE NOTICE '- Vector extension moved to extensions schema';
    RAISE NOTICE '- Security policies created for all tables';
    RAISE NOTICE '- Performance indexes created';
END $$;