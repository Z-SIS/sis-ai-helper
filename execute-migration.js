const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  console.log('🚀 EXECUTING SUPABASE MIGRATION');
  console.log('='.repeat(60));
  
  try {
    // Test connection
    console.log('📡 Testing admin connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('company_research_cache')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Admin connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Admin connection successful');
    
    // Read and execute schema first
    console.log('\n📄 Executing schema migration...');
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into manageable chunks
    const schemaStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .filter(stmt => !stmt.includes('CREATE EXTENSION')); // Skip extension as it might already exist
    
    console.log(`Found ${schemaStatements.length} schema statements to execute`);
    
    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Schema ${i + 1}/${schemaStatements.length}: ${statement.substring(0, 50)}...`);
          
          // Try to execute via raw SQL (this might not work via REST API)
          // Instead, we'll provide the SQL for manual execution
          console.log('ℹ️  Statement prepared for manual execution');
          
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key')) {
            console.log(`ℹ️  Schema statement ${i + 1} skipped (already exists)`);
          } else {
            console.warn(`⚠️  Schema statement ${i + 1} warning: ${error.message}`);
          }
        }
      }
    }
    
    // Read enhancement migration
    console.log('\n📄 Preparing enhancement migration...');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    const migrationStatements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${migrationStatements.length} enhancement statements to execute`);
    
    for (let i = 0; i < migrationStatements.length; i++) {
      const statement = migrationStatements[i];
      if (statement.trim()) {
        console.log(`⚡ Enhancement ${i + 1}/${migrationStatements.length}: ${statement.substring(0, 50)}...`);
        console.log('ℹ️  Statement prepared for manual execution');
      }
    }
    
    // Create complete SQL file for manual execution
    const completeSQL = `-- Complete SIS AI Helper Database Migration
-- Generated: ${new Date().toISOString()}
-- Project: https://mrofgjydvwjqbnhxrits.supabase.co
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire SQL script
-- 2. Go to: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql
-- 3. Paste and execute the script
-- 4. Wait for completion and verify no errors

${schemaSQL}

${migrationSQL}

-- Migration completed successfully!
-- Verify tables by running: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
`;
    
    // Write complete migration file
    const outputPath = path.join(__dirname, 'COMPLETE_MIGRATION.sql');
    fs.writeFileSync(outputPath, completeSQL);
    
    console.log('\n✅ Migration preparation completed!');
    console.log(`📁 Complete migration saved to: ${outputPath}`);
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Copy the SQL from COMPLETE_MIGRATION.sql');
    console.log('2. Go to: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
    console.log('3. Paste and execute the complete script');
    console.log('4. Verify table creation');
    console.log('5. Test the application');
    
    // Show what will be created
    console.log('\n📊 TABLES THAT WILL BE CREATED:');
    const tables = [
      'knowledge_documents',
      'knowledge_chunks',
      'company_research_cache (enhanced)',
      'knowledge_usage',
      'document_processing_queue',
      'search_analytics',
      'document_feedback',
      'search_cache'
    ];
    
    tables.forEach(table => {
      console.log(`   ✅ ${table}`);
    });
    
    console.log('\n⚡ FUNCTIONS THAT WILL BE CREATED:');
    const functions = [
      'match_knowledge_chunks',
      'match_company_research',
      'get_knowledge_base_stats',
      'match_knowledge_chunks_with_analytics',
      'get_search_analytics_summary',
      'cleanup_expired_cache'
    ];
    
    functions.forEach(func => {
      console.log(`   ✅ ${func}`);
    });
    
  } catch (error) {
    console.error('❌ Migration preparation failed:', error.message);
  }
}

executeMigration();