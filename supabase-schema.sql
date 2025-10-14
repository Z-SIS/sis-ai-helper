-- Task History Table
CREATE TABLE task_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Research Cache Table (for RAG pattern with 30-day cache)
CREATE TABLE company_research_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  industry TEXT,
  location TEXT,
  description TEXT,
  website TEXT,
  founded_year INTEGER,
  employee_count TEXT,
  revenue TEXT,
  key_executives JSONB,
  competitors JSONB,
  recent_news JSONB,
  research_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_task_history_user_id ON task_history(user_id);
CREATE INDEX idx_task_history_agent_type ON task_history(agent_type);
CREATE INDEX idx_task_history_created_at ON task_history(created_at);
CREATE INDEX idx_company_research_cache_name ON company_research_cache(company_name);
CREATE INDEX idx_company_research_cache_updated_at ON company_research_cache(updated_at);

-- Row Level Security (RLS) policies
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_research_cache ENABLE ROW LEVEL SECURITY;

-- Policy for task_history: Users can only access their own records
CREATE POLICY "Users can view own task history" ON task_history
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own task history" ON task_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own task history" ON task_history
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy for company_research_cache: Read access for all authenticated users
CREATE POLICY "Authenticated users can view company research cache" ON company_research_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company research cache" ON company_research_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company research cache" ON company_research_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_task_history_updated_at 
  BEFORE UPDATE ON task_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_research_cache_updated_at 
  BEFORE UPDATE ON company_research_cache 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();