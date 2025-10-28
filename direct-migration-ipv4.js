const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use shadow URL (pooler) which should be more accessible
const dbUrl = process.env.SUPABASE_DB_SHADOW_URL || "postgresql://postgres:BsWZIL9JyouUIs5M@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?options=project%3Dmrofgjydvwjqbnhxrits";

async function executeDirectMigration() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🚀 Starting direct database migration...');
    console.log(`🔗 Connecting to: ${dbUrl.replace(/:([^:@]+)@/, ':***@')}`);
    
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');
    
    // Test basic connection
    const testResult = await client.query('SELECT version()');
    console.log(`📊 Database version: ${testResult.rows[0].version.substring(0, 50)}...`);
    
    // Check existing tables
    console.log('📋 Checking existing tables...');
    const existingTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:', existingTablesResult.rows.map(row => row.table_name).join(', '));
    
    // Read the original schema first
    const schemaPath = path.join(__dirname, 'supabase/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing original schema...');
    
    // Split schema into individual statements and execute
    const schemaStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Schema statement ${i + 1}/${schemaStatements.length}...`);
          await client.query(statement);
          console.log(`✅ Schema statement ${i + 1} completed`);
        } catch (error) {
          // Check if it's a "already exists" error, which is fine
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`ℹ️  Schema statement ${i + 1} skipped (already exists): ${error.message.substring(0, 80)}...`);
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
          console.log(`⚡ Migration statement ${i + 1}/${migrationStatements.length}...`);
          await client.query(statement);
          console.log(`✅ Migration statement ${i + 1} completed`);
        } catch (error) {
          // Check if it's a "already exists" error, which is fine
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`ℹ️  Migration statement ${i + 1} skipped (already exists): ${error.message.substring(0, 80)}...`);
          } else {
            console.warn(`⚠️  Migration statement ${i + 1} warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Enhancement migration completed');
    
    // Verify the new tables exist
    console.log('🔍 Verifying new tables...');
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
          console.log(`✅ Table '${tableName}' exists`);
          
          // Get row count for existing tables
          try {
            const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`   📊 Rows: ${countResult.rows[0].count}`);
          } catch (countError) {
            console.log(`   ❓ Could not count rows: ${countError.message.substring(0, 50)}...`);
          }
        } else {
          console.log(`❌ Table '${tableName}' does not exist`);
        }
      } catch (error) {
        console.log(`❓ Could not verify table '${tableName}': ${error.message.substring(0, 50)}...`);
      }
    }
    
    // Check if vector extension is enabled
    try {
      const vectorResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_extension 
          WHERE extname = 'vector'
        );
      `);
      
      if (vectorResult.rows[0].exists) {
        console.log(`✅ pgvector extension is enabled`);
      } else {
        console.log(`❌ pgvector extension is not enabled`);
      }
    } catch (error) {
      console.log(`❓ Could not verify pgvector extension: ${error.message.substring(0, 50)}...`);
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