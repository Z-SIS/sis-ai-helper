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

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...');
    
    // First, let's see what tables exist
    console.log('📋 Checking existing tables...');
    
    // Try to get information about the database
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('⚠️  Cannot access information_schema, trying alternative approach...');
      
      // Try to list common tables that might exist
      const commonTables = [
        'knowledge_documents',
        'knowledge_chunks', 
        'company_research_cache',
        'knowledge_usage',
        'document_processing_queue',
        'search_analytics',
        'document_feedback',
        'search_cache'
      ];
      
      for (const tableName of commonTables) {
        try {
          const { data: tableData, error: tableError } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (tableError && tableError.code === 'PGRST116') {
            console.log(`❌ Table '${tableName}' does not exist`);
          } else if (tableError) {
            console.log(`⚠️  Table '${tableName}' error: ${tableError.message}`);
          } else {
            console.log(`✅ Table '${tableName}' exists`);
          }
        } catch (e) {
          console.log(`❓ Table '${tableName}' unknown state`);
        }
      }
    } else {
      console.log('✅ Existing tables:', data.map(t => t.table_name));
    }
    
    // Now let's provide the SQL needed to set up the database
    console.log('\n📝 Database Setup Required');
    console.log('='.repeat(80));
    
    // Read the original schema file
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      console.log('🔧 Run this SQL FIRST in your Supabase SQL Editor:');
      console.log('--- Original Schema ---');
      console.log(schemaSQL);
      console.log('\n');
    }
    
    // Read the new migration
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('🚀 Then run this enhancement SQL:');
      console.log('--- Enhancement Migration ---');
      console.log(migrationSQL);
    }
    
    console.log('='.repeat(80));
    console.log('\n🔗 Supabase SQL Editor: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
    console.log('\n📋 Steps:');
    console.log('1. Open the Supabase SQL Editor');
    console.log('2. Copy and run the Original Schema first');
    console.log('3. Wait for it to complete');
    console.log('4. Then copy and run the Enhancement Migration');
    console.log('5. Verify all tables are created successfully');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();