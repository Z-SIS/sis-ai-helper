# Database Connection Setup Guide

## Issue Identified
The GitHub workflow is failing because:
1. The `DATABASE_URL` format is incorrect
2. The `SUPABASE_DB_URL` secret is not configured in GitHub

## Correct Database URL Formats

### Option 1: Direct Connection (Recommended for migrations)
```
postgres://postgres.zzrlwewjigmffjzwklll:62eav0ls319TKR4i@aws-1-us-east-1.supabase.co:5432/postgres?sslmode=require
```

### Option 2: Pooler Connection (For applications)
```
postgres://postgres.zzrlwewjigmffjzwklll:62eav0ls319TKR4i@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

## Steps to Fix

### 1. Get Your Correct Supabase URL
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the "Connection string" for either:
   - Direct connection (use for migrations/admin tasks)
   - Pooler connection (use for applications)

### 2. Set GitHub Secrets
1. Go to your GitHub repository: https://github.com/Z-SIS/sis-ai-helper/
2. Navigate to Settings → Secrets and variables → Actions
3. Add these secrets:
   - **Name:** `SUPABASE_DB_URL`
   - **Value:** Your correct database connection string

### 3. Update Local Environment (Optional)
If you want to run locally, add this to your `.env.local` file:
```
DATABASE_URL=postgres://postgres.zzrlwewjigmffjzwklll:62eav0ls319TKR4i@aws-1-us-east-1.supabase.co:5432/postgres?sslmode=require
```

## URL Format Validation

Your current URL has issues:
```
❌ postgres://postgres.zzrlwewjigmffjzwklll:62eav0ls319TKR4i@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

Should be:
```
✅ postgres://postgres.zzrlwewjigmffjzwklll:62eav0ls319TKR4i@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

## Testing the Connection

After setting up the secret, you can test the connection by:
1. Going to Actions tab in GitHub
2. Running the "Supabase Security Auto-Fix" workflow manually
3. Or pushing a change to trigger the workflow

## Security Notes

- Never commit database URLs to your repository
- Use GitHub Secrets for sensitive information
- The service-role key has admin privileges - keep it secure
- Consider using connection pooling for production applications