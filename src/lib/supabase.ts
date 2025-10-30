import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Browser client — safe for frontend usage (anon key)
export const supabaseBrowser = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ✅ Server admin client — full rights, bypasses RLS
// Must be used ONLY in API routes or server components.
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Legacy exports for backward compatibility (deprecated)
// Use supabaseBrowser for client code and supabaseAdmin for server code
export const supabase = supabaseBrowser

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
  // Task History operations (use admin client for server operations)
  async getTaskHistory(userId: string, limit = 50) {
    if (!supabaseAdmin) {
      console.warn('Supabase admin not configured - returning empty task history');
      return [];
    }
    
    try {
      const { data, error } = await supabaseAdmin
        .from('task_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching task history:', error);
        throw error;
      }
      
      return data as TaskHistory[];
    } catch (error) {
      console.error('Unexpected error in getTaskHistory:', error);
      return [];
    }
  },

  async createTaskHistory(task: Omit<TaskHistory, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabaseAdmin) {
      console.warn('Supabase admin not configured - skipping task history creation');
      return null;
    }
    
    try {
      const { data, error } = await supabaseAdmin
        .from('task_history')
        .insert(task)
        .select()
        .single();
      
      if (error) {
        console.error('Failed to save task history:', {
          error: error.message,
          hint: error.hint,
          code: error.code,
          details: error.details
        });
        throw error;
      }
      
      console.log('Task history saved successfully');
      return data as TaskHistory;
    } catch (error) {
      console.error('Unexpected error in createTaskHistory:', error);
      throw error;
    }
  },

  // Company Research Cache operations (use admin client for server operations)
  async getCompanyResearchCache(companyName: string) {
    if (!supabaseAdmin) {
      console.warn('Supabase admin not configured - no cache available');
      return null;
    }
    
    try {
      const { data, error } = await supabaseAdmin
        .from('company_research_cache')
        .select('*')
        .eq('company_name', companyName.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company research cache:', error);
        throw error;
      }
      
      return data as CompanyResearchCache | null;
    } catch (error) {
      console.error('Unexpected error in getCompanyResearchCache:', error);
      return null;
    }
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
      console.warn('Supabase admin not configured - skipping cache update');
      return null;
    }
    
    try {
      const { data, error } = await supabaseAdmin
        .from('company_research_cache')
        .upsert({
          ...cache,
          company_name: cache.company_name.toLowerCase()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error upserting company research cache:', error);
        throw error;
      }
      
      return data as CompanyResearchCache;
    } catch (error) {
      console.error('Unexpected error in upsertCompanyResearchCache:', error);
      throw error;
    }
  }
};

// Export configuration status for debugging
export const supabaseConfig = {
  isConfigured: !!(supabaseUrl && supabaseAnonKey),
  url: supabaseUrl ? supabaseUrl.replace(/https:\/\/(.*)\.supabase\.co/, 'https://***.supabase.co') : null,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceRoleKey: !!supabaseServiceKey,
  browserClientAvailable: !!supabaseBrowser,
  adminClientAvailable: !!supabaseAdmin
};