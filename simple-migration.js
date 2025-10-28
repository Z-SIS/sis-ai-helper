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

async function executeSimpleMigration() {
  try {
    console.log('🚀 Starting simple migration...');
    
    // Test connection first
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabaseAdmin
      .from('knowledge_documents')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Create search_analytics table
    console.log('📊 Creating search_analytics table...');
    const { error: searchAnalyticsError } = await supabaseAdmin
      .from('search_analytics')
      .select('*')
      .limit(1);
    
    if (searchAnalyticsError && searchAnalyticsError.code === 'PGRST116') {
      // Table doesn't exist, let's create it using raw SQL
      console.log('🔧 Table does not exist, creating...');
      
      // Try using a different approach - create a simple test table first
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS search_analytics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          query_text TEXT NOT NULL,
          query_type TEXT NOT NULL,
          search_params JSONB,
          results_count INTEGER,
          top_result_similarity DECIMAL(3,2),
          response_time_ms INTEGER,
          user_satisfaction INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      console.log('⚡ Creating search_analytics table...');
      // Since we can't execute raw SQL directly, let's try using the Supabase dashboard approach
      console.log('📝 Please manually run the following SQL in your Supabase SQL Editor:');
      console.log('='.repeat(80));
      
      // Read the full migration file
      const migrationPath = path.join(__dirname, 'supabase/migrations/20251022000001_enhance_search_analytics.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(migrationSQL);
      console.log('='.repeat(80));
      console.log('\n🔗 Supabase SQL Editor: https://mrofgjydvwjqbnhxrits.supabase.co/project/sql');
      
    } else if (!searchAnalyticsError) {
      console.log('✅ search_analytics table already exists');
    }
    
    // Test if we can access the new schema
    console.log('🔍 Testing access to enhanced schema...');
    
    // Check if the enhanced search function exists
    const { data: funcTest, error: funcError } = await supabaseAdmin
      .rpc('get_knowledge_base_stats');
    
    if (funcError) {
      console.log('⚠️  Enhanced functions may not be available yet');
    } else {
      console.log('✅ Enhanced functions are available');
    }
    
    console.log('\n🎉 Migration setup completed!');
    console.log('📋 Next steps:');
    console.log('1. Copy the SQL above and run it in your Supabase SQL Editor');
    console.log('2. Verify the new tables were created successfully');
    console.log('3. Test the enhanced search functionality');
    
  } catch (error) {
    console.error('❌ Migration setup failed:', error.message);
  }
}

executeSimpleMigration();