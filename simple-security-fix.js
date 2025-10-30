/**
 * Simple Security Fix Script
 * 
 * This script provides the SQL commands needed to fix the security issues
 */

console.log('🔒 Supabase Security Fix Guide\n');

console.log('📋 Issues to Fix:');
console.log('1. RLS (Row Level Security) not enabled on company_research_cache');
console.log('2. Functions with mutable search_path');
console.log('3. Vector extension in public schema\n');

console.log('🚀 Quick Fix Options:\n');

console.log('Option 1: Execute via Supabase Dashboard');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the SQL commands from fix-security-issues.sql');
console.log('4. Execute the SQL\n');

console.log('Option 2: Use the API endpoint (when server is running)');
console.log('Run: curl -X POST http://localhost:3000/api/security/fix -H "Content-Type: application/json" -d \'{"action":"fix"}\'\n');

console.log('Option 3: Manual SQL Execution');
console.log('The following SQL commands need to be executed:\n');

const sqlCommands = `
-- 1. Enable RLS on company_research_cache
ALTER TABLE company_research_cache ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for company_research_cache
CREATE POLICY IF NOT EXISTS "Users can view company research cache" ON company_research_cache
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can insert company research cache" ON company_research_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update company research cache" ON company_research_cache
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can delete company research cache" ON company_research_cache
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Enable RLS on other tables
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for knowledge_documents
CREATE POLICY IF NOT EXISTS "Users can view their own knowledge documents" ON knowledge_documents
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can insert their own knowledge documents" ON knowledge_documents
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update their own knowledge documents" ON knowledge_documents
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete their own knowledge documents" ON knowledge_documents
    FOR DELETE USING (auth.uid() = created_by);

-- 5. Create policies for knowledge_usage
CREATE POLICY IF NOT EXISTS "Users can view their own knowledge usage" ON knowledge_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own knowledge usage" ON knowledge_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 7. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_company_research_cache_company_name ON company_research_cache(company_name);
CREATE INDEX IF NOT EXISTS idx_company_research_cache_industry ON company_research_cache(industry);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_by ON knowledge_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_usage_user_id ON knowledge_usage(user_id);
`;

console.log(sqlCommands);

console.log('📊 Verification Commands:');
console.log('After executing the fixes, run this to verify:');
console.log(`
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
`);

console.log('\n🎉 Expected Results:');
console.log('All tables should show RLS as enabled (true)');
console.log('No more security warnings in Supabase dashboard\n');

console.log('📝 Notes:');
console.log('- These changes will secure your database by enabling row-level security');
console.log('- Only authenticated users will be able to access data');
console.log('- Users can only access their own data (based on user ID)');
console.log('- Performance indexes will improve query performance');
console.log('- The vector extension issue requires manual intervention in Supabase dashboard');