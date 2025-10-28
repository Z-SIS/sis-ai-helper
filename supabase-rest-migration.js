const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeRestMigration() {
  try {
    console.log('🚀 Starting REST-based migration...');
    
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('company_research_cache')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Read the migration files
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration files loaded');
    
    // Since we can't execute raw SQL directly via REST API,
    // let's provide the SQL for manual execution
    console.log('\n📝 MANUAL EXECUTION REQUIRED');
    console.log('='.repeat(80));
    console.log('🔗 Supabase SQL Editor: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
    console.log('\n📋 Steps:');
    console.log('1. Open the Supabase SQL Editor URL above');
    console.log('2. Copy and execute the SCHEMA SQL first:');
    console.log('--- START SCHEMA SQL ---');
    console.log(schemaSQL);
    console.log('--- END SCHEMA SQL ---\n');
    console.log('3. Then copy and execute the ENHANCEMENT SQL:');
    console.log('--- START ENHANCEMENT SQL ---');
    console.log(migrationSQL);
    console.log('--- END ENHANCEMENT SQL ---');
    console.log('='.repeat(80));
    
    // Test if we can create a simple test record to verify the setup
    console.log('🧪 Testing basic table operations...');
    
    // Try to check if knowledge_documents table exists by attempting a query
    const { data: docData, error: docError } = await supabaseAdmin
      .from('knowledge_documents')
      .select('count')
      .limit(1);
    
    if (docError && docError.code === 'PGRST116') {
      console.log('❌ knowledge_documents table does not exist - please run the schema migration');
    } else if (docError) {
      console.log('⚠️  knowledge_documents table error:', docError.message);
    } else {
      console.log('✅ knowledge_documents table exists');
    }
    
    // Check search_analytics table
    const { data: searchData, error: searchError } = await supabaseAdmin
      .from('search_analytics')
      .select('count')
      .limit(1);
    
    if (searchError && searchError.code === 'PGRST116') {
      console.log('❌ search_analytics table does not exist - please run the enhancement migration');
    } else if (searchError) {
      console.log('⚠️  search_analytics table error:', searchError.message);
    } else {
      console.log('✅ search_analytics table exists');
    }
    
    console.log('\n🎉 Migration preparation completed!');
    console.log('📋 After executing the SQL above, the following features will be available:');
    console.log('   • Enhanced RAG knowledge base system');
    console.log('   • Search analytics and performance tracking');
    console.log('   • Document feedback system');
    console.log('   • Search result caching');
    console.log('   • Advanced vector search capabilities');
    
  } catch (error) {
    console.error('❌ Migration preparation failed:', error.message);
  }
}

executeRestMigration();