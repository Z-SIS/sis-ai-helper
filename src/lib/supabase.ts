import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin instance - for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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