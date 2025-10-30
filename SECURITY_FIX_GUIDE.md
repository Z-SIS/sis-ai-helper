# Supabase Security Hardening Guide

## Purpose
Fix Supabase lint errors for:
- RLS not enabled
- Function search_path mutable
- Extension in public schema

## 🔒 Enhanced Security Features

### 1. Audit Logging
- **Table**: `extensions.security_fix_audit`
- **Purpose**: Records every security fix execution
- **Fields**: ID, executed_by, executed_at, details (JSONB)
- **Access**: Service role insert, admin select only

### 2. Enhanced RLS Policies
- **Before**: `USING (true)` (insecure)
- **After**: Role-based access control
- **Roles**: `admin`, `service_role` only
- **Operations**: Separate policies for SELECT, INSERT, UPDATE, DELETE

### 3. Automated Security Audits
- **Schedule**: Monthly (first day at 2 AM UTC)
- **Checks**: RLS status, function security, extension placement
- **Alerts**: Auto-creates GitHub issues on failure
- **Reports**: Uploads detailed audit reports

## How to Apply

### Option 1: Direct Execution (Recommended)
```bash
# Set environment variables
export DATABASE_URL="postgres://service_role:secret@db.host:5432/postgres"

# Run the fix (includes automatic audit logging)
node scripts/simple-security-fix.js

# Verify the fix
supabase db lint
```

### Option 2: API Endpoint
```bash
# Set your secret
export SECURITY_FIX_SECRET="your-secret-key"

# Call the API
curl -X POST http://localhost:3000/api/security/fix \
  -H "Content-Type: application/json" \
  -H "x-security-fix-secret: your-secret-key" \
  -d '{"action":"fix"}'
```

### Option 3: Manual SQL
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251030_fix_security.sql`
3. Execute the SQL

## 📊 Verification

### Check RLS Status
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Audit Logs
```sql
SELECT 
    executed_by,
    executed_at,
    details->>'status' as status,
    details->>'runBy' as run_by
FROM extensions.security_fix_audit
ORDER BY executed_at DESC;
```

### Check Function Security
```sql
SELECT 
    proname,
    proconfig
FROM pg_proc 
JOIN pg_namespace n ON n.oid = pronamespace
WHERE n.nspname = 'public' 
AND proname IN ('match_company_research', 'update_updated_at_column');
```

## 🔄 CI/CD Integration

### GitHub Actions
- **Apply Fix**: `.github/workflows/supabase-security-fix.yml`
  - Triggers on migration file changes
  - Auto-applies security fixes
  
- **Monthly Audit**: `.github/workflows/monthly-security-audit.yml`
  - Runs monthly security audit
  - Creates issues on failure
  - Generates audit reports

### Required Secrets
- `SUPABASE_DB_URL`: Database connection string
- `SUPABASE_ACCESS_TOKEN`: Supabase access token
- `SUPABASE_PROJECT_ID`: Project identifier

## 🛡️ Security Improvements

### Before Fix
- ❌ Public table access without authentication
- ❌ Functions with mutable search_path
- ❌ Extension in public schema
- ❌ No audit trail
- ❌ No automated monitoring

### After Fix
- ✅ Row Level Security with role-based access
- ✅ Fixed function search paths
- ✅ Extension in isolated schema
- ✅ Comprehensive audit logging
- ✅ Automated monthly security audits
- ✅ Performance indexes added
- ✅ Proper permissions granted

## 📝 Audit Log Details

Each execution logs:
```json
{
  "runBy": "z.ai",
  "status": "success",
  "scriptVersion": "20251030",
  "executedAt": "2025-10-30T12:00:00.000Z",
  "duration": 1234,
  "environment": "production",
  "sqlFile": "20251030_fix_security.sql"
}
```

## 🚨 Security Monitoring

### Immediate Alerts
- Failed security fix executions
- RLS disabled on any table
- Functions with mutable search_path
- Extensions in public schema

### Monthly Reports
- Comprehensive security status
- Historical audit logs
- Trend analysis
- Recommendations

Expected output: ✅ No RLS or extension warnings, all security checks passing.