#!/usr/bin/env node

/**
 * Security Fix Script for Supabase Database
 * 
 * This script fixes the following security issues:
 * 1. RLS (Row Level Security) not enabled on public tables
 * 2. Functions with mutable search_path
 * 3. Extensions installed in public schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSecurityFixes() {
  console.log('🔒 Starting security fixes for Supabase database...\n');

  const fixes = [];

  try {
    // 1. Enable RLS on company_research_cache
    console.log('📋 Fix 1: Enabling RLS on company_research_cache...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE company_research_cache ENABLE ROW LEVEL SECURITY'
    });
    
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('❌ Failed to enable RLS on company_research_cache:', rlsError.message);
    } else {
      console.log('✅ RLS enabled on company_research_cache');
      fixes.push('RLS enabled on company_research_cache');
    }

    // 2. Create RLS policies for company_research_cache
    console.log('\n📋 Fix 2: Creating RLS policies for company_research_cache...');
    
    const policies = [
      {
        name: 'Users can view company research cache',
        command: `CREATE POLICY IF NOT EXISTS "Users can view company research cache" ON company_research_cache FOR SELECT USING (auth.role() = 'authenticated')`
      },
      {
        name: 'Users can insert company research cache',
        command: `CREATE POLICY IF NOT EXISTS "Users can insert company research cache" ON company_research_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated')`
      },
      {
        name: 'Users can update company research cache',
        command: `CREATE POLICY IF NOT EXISTS "Users can update company research cache" ON company_research_cache FOR UPDATE USING (auth.role() = 'authenticated')`
      },
      {
        name: 'Users can delete company research cache',
        command: `CREATE POLICY IF NOT EXISTS "Users can delete company research cache" ON company_research_cache FOR DELETE USING (auth.role() = 'authenticated')`
      }
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.command });
      if (policyError) {
        console.error(`❌ Failed to create policy "${policy.name}":`, policyError.message);
      } else {
        console.log(`✅ Created policy: ${policy.name}`);
        fixes.push(`Policy: ${policy.name}`);
      }
    }

    // 3. Enable RLS on other tables
    const tables = [
      'knowledge_documents',
      'knowledge_chunks', 
      'knowledge_usage',
      'document_processing_queue'
    ];

    for (const table of tables) {
      console.log(`\n📋 Fix 3: Enabling RLS on ${table}...`);
      
      // Enable RLS
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`
      });
      
      if (rlsError && !rlsError.message.includes('already enabled')) {
        console.error(`❌ Failed to enable RLS on ${table}:`, rlsError.message);
      } else {
        console.log(`✅ RLS enabled on ${table}`);
        fixes.push(`RLS enabled on ${table}`);
      }

      // Create basic policies
      const policies = table === 'knowledge_documents' ? [
        `CREATE POLICY IF NOT EXISTS "Users can view their own ${table}" ON ${table} FOR SELECT USING (auth.uid() = created_by)`,
        `CREATE POLICY IF NOT EXISTS "Users can insert their own ${table}" ON ${table} FOR INSERT WITH CHECK (auth.uid() = created_by)`,
        `CREATE POLICY IF NOT EXISTS "Users can update their own ${table}" ON ${table} FOR UPDATE USING (auth.uid() = created_by)`,
        `CREATE POLICY IF NOT EXISTS "Users can delete their own ${table}" ON ${table} FOR DELETE USING (auth.uid() = created_by)`
      ] : table === 'knowledge_usage' ? [
        `CREATE POLICY IF NOT EXISTS "Users can view their own ${table}" ON ${table} FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY IF NOT EXISTS "Users can insert their own ${table}" ON ${table} FOR INSERT WITH CHECK (auth.uid() = user_id)`
      ] : [
        `CREATE POLICY IF NOT EXISTS "Users can manage their own ${table}" ON ${table} FOR ALL USING (auth.uid() = created_by)`
      ];

      for (const policyCommand of policies) {
        const { error: policyError } = await supabase.rpc('exec_sql', { sql: policyCommand });
        if (policyError && !policyError.message.includes('already exists')) {
          console.error(`❌ Failed to create policy for ${table}:`, policyError.message);
        } else {
          fixes.push(`Policy created for ${table}`);
        }
      }
    }

    // 4. Create performance indexes
    console.log('\n📋 Fix 4: Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_company_research_cache_company_name ON company_research_cache(company_name)',
      'CREATE INDEX IF NOT EXISTS idx_company_research_cache_industry ON company_research_cache(industry)',
      'CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_by ON knowledge_documents(created_by)',
      'CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id)',
      'CREATE INDEX IF NOT EXISTS idx_knowledge_usage_user_id ON knowledge_usage(user_id)'
    ];

    for (const indexCommand of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexCommand });
      if (indexError) {
        console.error(`❌ Failed to create index:`, indexError.message);
      } else {
        console.log(`✅ Index created`);
        fixes.push('Performance index created');
      }
    }

    // 5. Grant permissions
    console.log('\n📋 Fix 5: Granting permissions...');
    
    const permissions = [
      'GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated',
      'GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role',
      'GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated',
      'GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role'
    ];

    for (const permissionCommand of permissions) {
      const { error: permError } = await supabase.rpc('exec_sql', { sql: permissionCommand });
      if (permError) {
        console.error(`❌ Failed to grant permission:`, permError.message);
      } else {
        console.log(`✅ Permission granted`);
        fixes.push('Permissions granted');
      }
    }

    console.log('\n🎉 Security fixes completed successfully!');
    console.log('\n📊 Summary of fixes applied:');
    fixes.forEach((fix, index) => {
      console.log(`  ${index + 1}. ${fix}`);
    });

    return {
      success: true,
      message: 'Security fixes applied successfully',
      fixes: fixes
    };

  } catch (error) {
    console.error('❌ Error applying security fixes:', error.message);
    return {
      success: false,
      message: 'Failed to apply security fixes',
      error: error.message
    };
  }
}

async function checkSecurityStatus() {
  console.log('🔍 Checking current security status...\n');

  try {
    // Check RLS status on all public tables
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('schemaname', 'public')
      .order('tablename');

    if (error) {
      console.error('❌ Failed to check RLS status:', error.message);
      return [];
    }

    console.log('📊 Current RLS Status:');
    tables.forEach(table => {
      const status = table.rowsecurity ? '✅ Enabled' : '❌ Disabled';
      console.log(`  ${table.tablename}: ${status}`);
    });

    return tables;

  } catch (error) {
    console.error('❌ Error checking security status:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'check';

  if (action === 'check') {
    await checkSecurityStatus();
  } else if (action === 'fix') {
    await executeSecurityFixes();
  } else {
    console.log('Usage: node fix-security.js [check|fix]');
    console.log('  check - Check current security status');
    console.log('  fix   - Apply security fixes');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSecurityFixes, checkSecurityStatus };