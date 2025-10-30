-- Fix Function Search Path Issues
-- This script recreates functions with fixed search_path

-- 1. Drop existing functions with mutable search_path
DROP FUNCTION IF EXISTS public.match_company_research CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- 2. Recreate match_company_research with fixed search_path
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

-- 3. Recreate update_updated_at_column with fixed search_path
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

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.match_company_research TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_company_research TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO service_role;

-- 5. Create a secure vector search function
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

-- 6. Grant execute permission for the new function
GRANT EXECUTE ON FUNCTION public.search_similar_companies TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_similar_companies TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Function security fixes applied successfully!';
    RAISE NOTICE '- Functions recreated with fixed search_path';
    RAISE NOTICE '- Security definer functions created';
    RAISE NOTICE '- Execute permissions granted';
END $$;