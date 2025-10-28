import { supabase, supabaseAdmin } from './supabase';

export async function checkSupabaseConnection() {
  console.log('Checking Supabase connection...');
  
  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment variables check:');
  console.log('- URL exists:', !!url);
  console.log('- URL value:', url);
  console.log('- Anon key exists:', !!anonKey);
  console.log('- Anon key length:', anonKey?.length);
  
  // Check client initialization
  console.log('\nClient initialization check:');
  console.log('- Supabase client exists:', !!supabase);
  console.log('- Supabase admin exists:', !!supabaseAdmin);
  
  if (supabase) {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('task_history').select('count').limit(1);
      console.log('\nConnection test:');
      console.log('- Test successful:', !error);
      if (error) {
        console.error('- Error:', error.message);
      } else {
        console.log('- Data received:', !!data);
      }
    } catch (err) {
      console.error('\nConnection test failed:', err);
    }
  }
  
  return {
    url: !!url,
    anonKey: !!anonKey,
    clientExists: !!supabase,
    adminExists: !!supabaseAdmin
  };
}