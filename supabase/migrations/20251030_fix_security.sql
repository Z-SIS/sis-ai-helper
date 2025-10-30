-- SUPABASE SECURITY PATCH (idempotent)
-- Date: 2025-10-30
-- Purpose: Enable RLS, fix search_path, move vector extension.

-- 1️⃣ Enable RLS on public.company_research_cache
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_research_cache') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'company_research_cache' AND c.relrowsecurity = true
    ) THEN
      EXECUTE 'ALTER TABLE public.company_research_cache ENABLE ROW LEVEL SECURITY;';
      EXECUTE 'ALTER TABLE public.company_research_cache FORCE ROW LEVEL SECURITY;';
      RAISE NOTICE '✅ RLS enabled on public.company_research_cache';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_research_cache' AND policyname = 'allow_select_authenticated'
    ) THEN
      EXECUTE $POLICY$
        CREATE POLICY allow_select_authenticated
        ON public.company_research_cache
        FOR SELECT
        TO authenticated
        USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));
      $POLICY$;
      RAISE NOTICE '✅ Policy allow_select_authenticated created with enhanced security';
    END IF;

    -- Add insert policy for authenticated users
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_research_cache' AND policyname = 'allow_insert_authenticated'
    ) THEN
      EXECUTE $POLICY$
        CREATE POLICY allow_insert_authenticated
        ON public.company_research_cache
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'service_role'));
      $POLICY$;
      RAISE NOTICE '✅ Policy allow_insert_authenticated created';
    END IF;

    -- Add update policy for authenticated users
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_research_cache' AND policyname = 'allow_update_authenticated'
    ) THEN
      EXECUTE $POLICY$
        CREATE POLICY allow_update_authenticated
        ON public.company_research_cache
        FOR UPDATE
        TO authenticated
        USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'))
        WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'service_role'));
      $POLICY$;
      RAISE NOTICE '✅ Policy allow_update_authenticated created';
    END IF;

    -- Add delete policy for admin users only
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_research_cache' AND policyname = 'allow_delete_admin'
    ) THEN
      EXECUTE $POLICY$
        CREATE POLICY allow_delete_admin
        ON public.company_research_cache
        FOR DELETE
        TO authenticated
        USING (auth.jwt() ->> 'role' = 'admin');
      $POLICY$;
      RAISE NOTICE '✅ Policy allow_delete_admin created';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Table not found, skipping RLS';
  END IF;
END $$;

-- 2️⃣ Fix function search_path
DO $$
DECLARE
  fn RECORD;
  targets TEXT[] := ARRAY['match_company_research', 'update_updated_at_column'];
BEGIN
  FOR fn IN
    SELECT n.nspname AS schema, p.proname AS function_name, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = ANY(targets)
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = pg_catalog, public;',
        fn.schema, fn.function_name, fn.args
      );
      RAISE NOTICE '✅ search_path fixed for %.%', fn.schema, fn.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Failed on %.%: %', fn.schema, fn.function_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- 3️⃣ Move vector extension to secure schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
    EXECUTE 'CREATE SCHEMA extensions AUTHORIZATION current_user;';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE 'ALTER EXTENSION vector SET SCHEMA extensions;';
    RAISE NOTICE '✅ vector extension moved';
  END IF;
END $$;

COMMENT ON SCHEMA extensions IS 'Schema for Supabase extensions (security hardened)';

-- 4️⃣ Create security audit log table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'extensions' AND tablename = 'security_fix_audit') THEN
    EXECUTE $AUDIT$
      CREATE TABLE extensions.security_fix_audit (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        executed_by text DEFAULT current_user,
        executed_at timestamptz DEFAULT now(),
        details jsonb
      );
    $AUDIT$;
    RAISE NOTICE '✅ Security audit log table created';
  END IF;
END $$;

-- 5️⃣ Enable RLS on audit table and create policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'extensions' AND tablename = 'security_fix_audit') THEN
    -- Enable RLS
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'extensions' AND c.relname = 'security_fix_audit' AND c.relrowsecurity = true
    ) THEN
      EXECUTE 'ALTER TABLE extensions.security_fix_audit ENABLE ROW LEVEL SECURITY;';
      EXECUTE 'ALTER TABLE extensions.security_fix_audit FORCE ROW LEVEL SECURITY;';
      RAISE NOTICE '✅ RLS enabled on security_fix_audit';
    END IF;

    -- Create policies for audit table
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'extensions' AND tablename = 'security_fix_audit' AND policyname = 'allow_insert_service_role'
    ) THEN
      EXECUTE $POLICY$
        CREATE POLICY allow_insert_service_role
        ON extensions.security_fix_audit
        FOR INSERT
        TO service_role
        WITH CHECK (true);
      $POLICY$;
      RAISE NOTICE '✅ Policy allow_insert_service_role created for audit table';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'extensions' AND tablename = 'security_fix_audit' AND policyname = 'allow_select_admin'
    ) THEN
      EXECUTE $POLICY$
        CREATE POLICY allow_select_admin
        ON extensions.security_fix_audit
        FOR SELECT
        TO authenticated
        USING (auth.jwt() ->> 'role' = 'admin' OR executed_by = current_user);
      $POLICY$;
      RAISE NOTICE '✅ Policy allow_select_admin created for audit table';
    END IF;
  END IF;
END $$;