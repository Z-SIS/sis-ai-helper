import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase clients
let supabaseClient: ReturnType<typeof createClient> | null = null;
let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not configured - Supabase features disabled');
    return null;
  }
  return url;
}

function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured - Supabase features disabled');
    return null;
  }
  return key;
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - Supabase admin features disabled');
    return null;
  }
  return key;
}

// Client instance - for client-side operations
export const supabase = () => {
  if (!supabaseClient) {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) {
      return null;
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
};

// Admin instance - for server-side operations (bypasses RLS)
export const supabaseAdmin = () => {
  if (!supabaseAdminClient) {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceRoleKey();
    if (!url || !key) {
      return null;
    }
    supabaseAdminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminClient;
};

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
    const client = supabase();
    if (!client) {
      console.warn('Supabase not configured - returning empty task history');
      return [];
    }
    
    const { data, error } = await client
      .from('task_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as TaskHistory[];
  },

  async createTaskHistory(task: Omit<TaskHistory, 'id' | 'created_at' | 'updated_at'>) {
    const client = supabase();
    if (!client) {
      console.warn('Supabase not configured - skipping task history creation');
      return null;
    }
    
    const { data, error } = await client
      .from('task_history')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data as TaskHistory;
  },

  // Company Research Cache operations
  async getCompanyResearchCache(companyName: string) {
    const client = supabase();
    if (!client) {
      console.warn('Supabase not configured - no cache available');
      return null;
    }
    
    const { data, error } = await client
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
    const client = supabaseAdmin();
    if (!client) {
      console.warn('Supabase not configured - skipping cache update');
      return null;
    }
    
    const { data, error } = await client
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