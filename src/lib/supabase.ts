import { createClient } from '@supabase/supabase-js'

// Validate and clean environment variables
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  // Validate URL format
  if (url && !url.startsWith('https://')) {
    console.error('Invalid Supabase URL format:', url)
    return null
  }

  // Validate JWT token format (basic check)
  const isValidJWT = (token: string) => {
    try {
      const parts = token.split('.')
      return parts.length === 3 && parts.every(part => part.length > 0)
    } catch {
      return false
    }
  }

  if (anonKey && !isValidJWT(anonKey)) {
    console.error('Invalid Supabase anonymous key format')
    return null
  }

  if (serviceRoleKey && !isValidJWT(serviceRoleKey)) {
    console.error('Invalid Supabase service role key format')
    return null
  }

  return { url, anonKey, serviceRoleKey }
}

const config = getSupabaseConfig()

if (!config) {
  console.warn('Supabase configuration is invalid. Check your environment variables.')
}

// Create Supabase client with proper configuration
export const supabase = config?.url && config?.anonKey 
  ? createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'sis-helper/1.0.0',
          'X-Auth-Provider': 'supabase'
        }
      },
      db: {
        schema: 'public'
      }
    })
  : null;

// Admin instance - for server-side operations (bypasses RLS)
export const supabaseAdmin = config?.url && config?.serviceRoleKey 
  ? createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'sis-helper-admin/1.0.0',
          'X-Auth-Provider': 'supabase'
        }
      },
      db: {
        schema: 'public'
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
    
    try {
      const { data, error } = await supabase
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
    if (!supabase) {
      console.warn('Supabase not configured - skipping task history creation');
      return null;
    }
    
    try {
      const { data, error } = await supabase
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

  // Company Research Cache operations
  async getCompanyResearchCache(companyName: string) {
    if (!supabase) {
      console.warn('Supabase not configured - no cache available');
      return null;
    }
    
    try {
      const { data, error } = await supabase
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
  isConfigured: !!config,
  url: config?.url ? config.url.replace(/https:\/\/(.*)\.supabase\.co/, 'https://***.supabase.co') : null,
  hasAnonKey: !!config?.anonKey,
  hasServiceRoleKey: !!config?.serviceRoleKey,
  clientAvailable: !!supabase,
  adminClientAvailable: !!supabaseAdmin
};