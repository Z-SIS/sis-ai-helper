import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration
function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not configured - Supabase features disabled');
    return null;
  }
  // Clean up any potential whitespace or newlines
  const cleanUrl = url.trim().replace(/\n/g, '').replace(/\r/g, '');
  if (cleanUrl.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    console.error('Environment variable parsing error - URL contains variable name');
    return null;
  }
  return cleanUrl;
}

function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured - Supabase features disabled');
    return null;
  }
  // Clean up any potential whitespace or newlines
  const cleanKey = key.trim().replace(/\n/g, '').replace(/\r/g, '');
  if (cleanKey.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    console.error('Environment variable parsing error - ANON_KEY contains variable name');
    return null;
  }
  return cleanKey;
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - Supabase admin features disabled');
    return null;
  }
  // Clean up any potential whitespace or newlines
  const cleanKey = key.trim().replace(/\n/g, '').replace(/\r/g, '');
  if (cleanKey.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    console.error('Environment variable parsing error - SERVICE_ROLE_KEY contains variable name');
    return null;
  }
  return cleanKey;
}

// Client instance - for client-side operations
export const supabase = (() => {
  try {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) {
      console.warn('Supabase configuration incomplete - client disabled');
      return null;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      console.error('Invalid Supabase URL format:', url);
      return null;
    }
    
    // Validate key format (basic JWT validation)
    if (!key.startsWith('eyJ') || key.split('.').length !== 3) {
      console.error('Invalid Supabase key format');
      return null;
    }
    
    return createClient(url, key);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
})();

// Admin instance - for server-side operations (bypasses RLS)
export const supabaseAdmin = (() => {
  try {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceRoleKey();
    if (!url || !key) {
      console.warn('Supabase admin configuration incomplete - admin client disabled');
      return null;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      console.error('Invalid Supabase URL format:', url);
      return null;
    }
    
    // Validate key format (basic JWT validation)
    if (!key.startsWith('eyJ') || key.split('.').length !== 3) {
      console.error('Invalid Supabase service role key format');
      return null;
    }
    
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error('Failed to create Supabase admin client:', error);
    return null;
  }
})();

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
    const client = supabase;
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
    const client = supabase;
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
    const client = supabase;
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
    const client = supabaseAdmin;
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
