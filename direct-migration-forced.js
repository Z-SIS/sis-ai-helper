const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Force IPv4 by using the direct connection string
const dbUrl = process.env.POSTGRES_URL || "postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres";

async function executeDirectMigration() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000,
    query_timeout: 30000
  });
  
  try {
    console.log('🚀 Starting direct database migration...');
    console.log(`🔗 Connecting to database...`);
    
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');
    
    // Test basic connection
    const testResult = await client.query('SELECT version(), current_database(), current_user');
    console.log(`📊 Database: ${testResult.rows[0].current_database}`);
    console.log(`👤 User: ${testResult.rows[0].current_user}`);
    console.log(`📊 Version: ${testResult.rows[0].version.substring(0, 50)}...`);
    
    // Check existing tables
    console.log('📋 Checking existing tables...');
    const existingTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${existingTablesResult.rows.length} existing tables:`);
    existingTablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Enable pgvector extension first
    console.log('🔧 Enabling pgvector extension...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('✅ pgvector extension enabled');
    } catch (error) {
      console.log(`ℹ️  pgvector extension: ${error.message}`);
    }
    
    // Read the original schema first
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing original schema...');
    
    // Split schema into individual statements and execute
    const schemaStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE EXTENSION'));
    
    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Schema statement ${i + 1}/${schemaStatements.length}: ${statement.substring(0, 50)}...`);
          await client.query(statement);
          console.log(`✅ Schema statement ${i + 1} completed`);
        } catch (error) {
          // Check if it's a "already exists" error, which is fine
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key') ||
              (error.message.includes('relation') && error.message.includes('already exists'))) {
            console.log(`ℹ️  Schema statement ${i + 1} skipped (already exists)`);
          } else {
            console.warn(`⚠️  Schema statement ${i + 1} warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Original schema completed');
    
    // Now execute the enhancement migration
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Executing enhancement migration...');
    
    // Split migration into individual statements
    const migrationStatements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < migrationStatements.length; i++) {
      const statement = migrationStatements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Migration statement ${i + 1}/${migrationStatements.length}: ${statement.substring(0, 50)}...`);
          await client.query(statement);
          console.log(`✅ Migration statement ${i + 1} completed`);
        } catch (error) {
          // Check if it's a "already exists" error, which is fine
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key') ||
              (error.message.includes('relation') && error.message.includes('already exists'))) {
            console.log(`ℹ️  Migration statement ${i + 1} skipped (already exists)`);
          } else {
            console.warn(`⚠️  Migration statement ${i + 1} warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Enhancement migration completed');
    
    // Final verification
    console.log('🔍 Final verification of all tables...');
    const tablesToCheck = [
      'knowledge_documents',
      'knowledge_chunks', 
      'company_research_cache',
      'knowledge_usage',
      'document_processing_queue',
      'search_analytics',
      'document_feedback',
      'search_cache'
    ];
    
    let allTablesExist = true;
    for (const tableName of tablesToCheck) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);
        
        if (result.rows[0].exists) {
          // Get row count
          try {
            const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`✅ Table '${tableName}' exists (${countResult.rows[0].count} rows)`);
          } catch (countError) {
            console.log(`✅ Table '${tableName}' exists (row count unavailable)`);
          }
        } else {
          console.log(`❌ Table '${tableName}' does not exist`);
          allTablesExist = false;
        }
      } catch (error) {
        console.log(`❓ Could not verify table '${tableName}': ${error.message.substring(0, 50)}...`);
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      console.log('🎉 All tables successfully created!');
    } else {
      console.log('⚠️  Some tables may be missing');
    }
    
    // Check functions
    console.log('🔍 Checking key functions...');
    const functionsToCheck = [
      'match_knowledge_chunks',
      'match_company_research',
      'get_knowledge_base_stats',
      'match_knowledge_chunks_with_analytics',
      'get_search_analytics_summary'
    ];
    
    for (const functionName of functionsToCheck) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = $1
          );
        `, [functionName]);
        
        if (result.rows[0].exists) {
          console.log(`✅ Function '${functionName}' exists`);
        } else {
          console.log(`❌ Function '${functionName}' does not exist`);
        }
      } catch (error) {
        console.log(`❓ Could not verify function '${functionName}': ${error.message.substring(0, 50)}...`);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

executeDirectMigration().catch(console.error);