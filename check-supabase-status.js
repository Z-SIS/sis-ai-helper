const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

// Create both anon and admin clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSupabaseStatus() {
  console.log('🔍 CHECKING SUPABASE STATUS');
  console.log('='.repeat(60));
  
  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('company_research_cache')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Basic connection failed:', testError.message);
      if (testError.code === 'PGRST116') {
        console.log('ℹ️  This might mean tables don\'t exist yet');
      }
    } else {
      console.log('✅ Basic connection successful');
    }
    
    // Check all expected tables
    console.log('\n📊 Checking table existence...');
    const expectedTables = [
      'knowledge_documents',
      'knowledge_chunks', 
      'company_research_cache',
      'knowledge_usage',
      'document_processing_queue',
      'search_analytics',
      'document_feedback',
      'search_cache'
    ];
    
    const tableStatus = {};
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          tableStatus[tableName] = '❌ Does not exist';
        } else if (error) {
          tableStatus[tableName] = `⚠️  Error: ${error.message}`;
        } else {
          // Get actual row count
          try {
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            tableStatus[tableName] = `✅ Exists (${count} rows)`;
          } catch (countError) {
            tableStatus[tableName] = '✅ Exists (count unavailable)';
          }
        }
      } catch (e) {
        tableStatus[tableName] = `❓ Unknown: ${e.message}`;
      }
    }
    
    // Display table status
    Object.entries(tableStatus).forEach(([table, status]) => {
      console.log(`   ${table.padEnd(25)}: ${status}`);
    });
    
    // Check if pgvector extension is available
    console.log('\n🔧 Checking pgvector extension...');
    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
        sql_query: 'SELECT 1 as test FROM pg_extension WHERE extname = \'vector\';' 
      });
      
      if (error) {
        console.log('⚠️  Could not check pgvector extension (might need admin access)');
      } else {
        console.log('✅ pgvector extension check completed');
      }
    } catch (e) {
      console.log('ℹ️  pgvector extension check skipped (requires direct DB access)');
    }
    
    // Test key functions if they exist
    console.log('\n⚡ Testing key functions...');
    const functions = [
      'match_knowledge_chunks',
      'match_company_research', 
      'get_knowledge_base_stats'
    ];
    
    for (const functionName of functions) {
      try {
        const { data, error } = await supabase.rpc(functionName, {
          query_embedding: null,
          match_count: 1
        });
        
        if (error) {
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log(`   ${functionName.padEnd(25)}: ❌ Function does not exist`);
          } else {
            console.log(`   ${functionName.padEnd(25)}: ⚠️  Error: ${error.message.substring(0, 50)}...`);
          }
        } else {
          console.log(`   ${functionName.padEnd(25)}: ✅ Function exists`);
        }
      } catch (e) {
        console.log(`   ${functionName.padEnd(25)}: ❓ Unknown: ${e.message.substring(0, 50)}...`);
      }
    }
    
    // Check RLS policies
    console.log('\n🛡️  Checking Row Level Security...');
    const tablesWithRLS = ['knowledge_documents', 'knowledge_chunks', 'company_research_cache'];
    
    for (const tableName of tablesWithRLS) {
      if (tableStatus[tableName].includes('✅ Exists')) {
        try {
          // Try to access without authentication - should be restricted
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error && error.message.includes('row-level security')) {
            console.log(`   ${tableName.padEnd(25)}: ✅ RLS enabled (properly restricted)`);
          } else if (error) {
            console.log(`   ${tableName.padEnd(25)}: ⚠️  RLS status unclear: ${error.message.substring(0, 50)}...`);
          } else {
            console.log(`   ${tableName.padEnd(25)}: ⚠️  RLS may not be properly configured`);
          }
        } catch (e) {
          console.log(`   ${tableName.padEnd(25)}: ❓ RLS check failed: ${e.message.substring(0, 50)}...`);
        }
      } else {
        console.log(`   ${tableName.padEnd(25)}: ⏭️  Skipped (table doesn't exist)`);
      }
    }
    
    // Summary
    console.log('\n📋 SUMMARY');
    console.log('='.repeat(60));
    
    const existingTables = Object.values(tableStatus).filter(status => status.includes('✅')).length;
    const totalTables = expectedTables.length;
    
    console.log(`Tables: ${existingTables}/${totalTables} exist`);
    
    if (existingTables === 0) {
      console.log('🔴 ACTION REQUIRED: Run database migration');
      console.log('   🔗 https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
    } else if (existingTables < totalTables) {
      console.log('🟡 PARTIAL SETUP: Some tables missing');
      console.log('   🔗 https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
    } else {
      console.log('🟢 ALL TABLES EXIST: Database is ready');
    }
    
    console.log('\n🔗 Connection Details:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Supabase status check failed:', error.message);
  }
}

checkSupabaseStatus();