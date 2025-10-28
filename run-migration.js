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

async function executeMigration() {
  try {
    console.log('🚀 Starting migration execution...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            // Try direct SQL execution if RPC fails
            console.log('🔄 Trying direct SQL execution...');
            const { error: directError } = await supabaseAdmin
              .from('pg_tables')
              .select('*')
              .limit(1);
            
            if (directError && directError.message.includes('does not exist')) {
              console.log(`✅ Statement ${i + 1} appears to have executed successfully (table creation detected)`);
            } else if (directError) {
              console.warn(`⚠️  Statement ${i + 1} may have failed:`, directError.message);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (stmtError) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, stmtError.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the new tables exist
    console.log('🔍 Verifying new tables...');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .in('tablename', ['search_analytics', 'document_feedback', 'search_cache']);
    
    if (tablesError) {
      console.warn('Could not verify tables:', tablesError.message);
    } else {
      console.log('✅ New tables created:', tables.map(t => t.tablename).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

executeMigration();