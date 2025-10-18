import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration with proper error handling and cleaning
function getCleanEnvVar(varName: string): string | null {
  const value = process.env[varName];
  if (!value) return null;
  
  // Clean up any potential whitespace, newlines, or variable name contamination
  const cleanValue = value
    .trim()
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .replace(new RegExp(`^${varName}=`), '');
  
  // Check if the value looks like it contains variable name contamination
  if (cleanValue.includes(varName) || cleanValue.includes('\n')) {
    console.error(`Environment variable ${varName} appears to be contaminated:`, cleanValue);
    return null;
  }
  
  return cleanValue;
}

const supabaseUrl = getCleanEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getCleanEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getCleanEnvVar('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client only if environment variables are available and valid
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin instance - for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types
export interface TaskHistory {
  id: string;
  user_id: string;
  agent_type: string;
  input_data: any;
  output_data: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyResearchCache {
  id: string;
  company_name: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  founded_year?: number;
  employee_count?: string;
  revenue?: string;
  key_executives?: any;
  competitors?: any;
  recent_news?: any;
  research_data: any;
  created_at: string;
  updated_at: string;
}

// Helper functions for database operations
export const db = {
  // Task History operations
  async getTaskHistory(userId: string, limit = 50) {
    if (!supabase) {
      console.warn('Supabase not configured - returning empty task history');
      return [];
    }
    
    const { data, error } = await supabase
      .from('task_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as TaskHistory[];
  },

  async createTaskHistory(task: Omit<TaskHistory, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
      console.warn('Supabase not configured - skipping task history creation');
      return null;
    }
    
    const { data, error } = await supabase
      .from('task_history')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data as TaskHistory;
  },

  // Company Research Cache operations
  async getCompanyResearchCache(companyName: string) {
    if (!supabase) {
      console.warn('Supabase not configured - no cache available');
      return null;
    }
    
    const { data, error } = await supabase
      .from('company_research_cache')
      .select('*')
      .eq('company_name', companyName.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as CompanyResearchCache | null;
  },

  async isCompanyResearchCacheStale(companyName: string, days = 30) {
    const cache = await this.getCompanyResearchCache(companyName);
    if (!cache) return true;
    
    const cacheDate = new Date(cache.updated_at);
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - days);
    
    return cacheDate < staleDate;
  },

  async upsertCompanyResearchCache(cache: Omit<CompanyResearchCache, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabaseAdmin) {
      console.warn('Supabase not configured - skipping cache update');
      return null;
    }
    
    const { data, error } = await supabaseAdmin
      .from('company_research_cache')
      .upsert({
        ...cache,
        company_name: cache.company_name.toLowerCase()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as CompanyResearchCache;
  }
};