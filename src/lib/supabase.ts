import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database helper functions
export const supabaseDb = {
  // Task History operations
  async getTaskHistory(userId: string, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('task_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  async saveTaskHistory(userId: string, agentType: string, inputData: any, outputData: any, status = 'completed') {
    const { data, error } = await supabaseAdmin
      .from('task_history')
      .insert({
        user_id: userId,
        agent_type: agentType,
        input_data: inputData,
        output_data: outputData,
        status
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Company Research Cache operations
  async getCompanyResearch(companyName: string) {
    const { data, error } = await supabaseAdmin
      .from('company_research_cache')
      .select('*')
      .eq('company_name', companyName.toLowerCase())
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async saveCompanyResearch(companyName: string, researchData: any) {
    const { data, error } = await supabaseAdmin
      .from('company_research_cache')
      .upsert({
        company_name: companyName.toLowerCase(),
        ...researchData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async isCompanyResearchCached(companyName: string, maxAgeHours = 24) {
    const cached = await this.getCompanyResearch(companyName)
    if (!cached) return false
    
    const cacheAge = Date.now() - new Date(cached.updated_at).getTime()
    const maxAge = maxAgeHours * 60 * 60 * 1000
    
    return cacheAge < maxAge
  }
}

export default supabase