-- Enable RLS and add tenant/user columns to company_research_cache
-- Migration: 20251031_enable_rls_company_research_cache.sql
-- Purpose: Add multi-tenant security with Row Level Security

-- First, add tenant and user columns if they don't exist
ALTER TABLE public.company_research_cache 
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create indexes for tenant-based queries
CREATE INDEX IF NOT EXISTS idx_company_research_cache_tenant_id 
ON public.company_research_cache(tenant_id);

CREATE INDEX IF NOT EXISTS idx_company_research_cache_user_id 
ON public.company_research_cache(user_id);

-- Enable Row Level Security
ALTER TABLE public.company_research_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS company_research_cache_tenant_select ON public.company_research_cache;
DROP POLICY IF EXISTS company_research_cache_tenant_insert ON public.company_research_cache;
DROP POLICY IF EXISTS company_research_cache_tenant_update ON public.company_research_cache;
DROP POLICY IF EXISTS company_research_cache_tenant_delete ON public.company_research_cache;

-- Create tenant-based RLS policies
CREATE POLICY company_research_cache_tenant_select
ON public.company_research_cache
FOR SELECT TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY company_research_cache_tenant_insert
ON public.company_research_cache
FOR INSERT TO authenticated
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY company_research_cache_tenant_update
ON public.company_research_cache
FOR UPDATE TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY company_research_cache_tenant_delete
ON public.company_research_cache
FOR DELETE TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Revoke broad public privileges
REVOKE ALL ON public.company_research_cache FROM anon;
REVOKE ALL ON public.company_research_cache FROM public;

-- Grant necessary privileges to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_research_cache TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.company_research_cache IS 'Company research cache with multi-tenant RLS protection';
COMMENT ON COLUMN public.company_research_cache.tenant_id IS 'Tenant identifier for multi-tenant data isolation';
COMMENT ON COLUMN public.company_research_cache.user_id IS 'User identifier for user-level data access control';