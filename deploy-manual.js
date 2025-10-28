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

async function deployManual() {
  try {
    console.log('🚀 Starting manual deployment...');
    
    // Test connection
    console.log('🔗 Testing connection...');
    const { data, error } = await supabaseAdmin
      .from('company_research_cache')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Read migrations
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
    
    console.log('📋 Deployment Summary:');
    console.log('='.repeat(80));
    console.log('🔗 Supabase Dashboard: https://mrofgjydvwjqbnhxrits.supabase.co');
    console.log('🔧 SQL Editor: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
    console.log('');
    console.log('📝 Migration Files Ready:');
    console.log(`✅ Schema: ${schemaPath}`);
    console.log(`✅ Enhancement: ${migrationPath}`);
    console.log('');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSize = fs.statSync(schemaPath).size;
      console.log(`📊 Schema file size: ${schemaSize} bytes`);
    }
    
    if (fs.existsSync(migrationPath)) {
      const migrationSize = fs.statSync(migrationPath).size;
      console.log(`📊 Migration file size: ${migrationSize} bytes`);
    }
    
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Open Supabase SQL Editor');
    console.log('2. Copy and execute schema.sql first');
    console.log('3. Then execute the enhancement migration');
    console.log('4. Verify tables are created');
    console.log('5. Test the application');
    
    console.log('');
    console.log('📂 Files to Execute:');
    console.log('1️⃣ supabase/schema.sql');
    console.log('2️⃣ supabase/migrations/20251022000001_enhance_search_analytics.sql');
    
    console.log('');
    console.log('🔍 Quick Verification:');
    
    // Test what exists
    const tables = [
      'knowledge_documents',
      'knowledge_chunks', 
      'company_research_cache',
      'knowledge_usage',
      'document_processing_queue',
      'search_analytics',
      'document_feedback',
      'search_cache'
    ];
    
    for (const tableName of tables) {
      try {
        const { data: tableData, error: tableError } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (tableError && tableError.code === 'PGRST116') {
          console.log(`❌ ${tableName} - Not created yet`);
        } else if (tableError) {
          console.log(`⚠️  ${tableName} - Error: ${tableError.message}`);
        } else {
          console.log(`✅ ${tableName} - Exists`);
        }
      } catch (e) {
        console.log(`❓ ${tableName} - Unknown state`);
      }
    }
    
    console.log('');
    console.log('🎉 Manual deployment setup completed!');
    console.log('📋 Ready for SQL execution in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Manual deployment setup failed:', error.message);
  }
}

deployManual();