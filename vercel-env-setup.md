# Vercel Environment Variables Setup

## Required Environment Variables

To fix the Supabase connection errors, you need to add these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Navigate to your project: `sis-ai-helper`
- Go to Settings → Environment Variables

### 2. Add the following variables:

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL
https://mrofgjydvwjqbnhxrits.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb2ZnanlkdndqcWJuaHhyaXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODk4NjYsImV4cCI6MjA3NTc2NTg2Nn0.XyIsNS_N4TA4ai5R1B0QESuxQaEIXgxCE7NMPGe6hHU
```

#### Google AI Configuration
```
GOOGLE_GENERATIVE_AI_API_KEY
your_google_ai_api_key_here
```

### 3. Environment Selection
- Add these to **Production**, **Preview**, and **Development** environments
- Make sure to include all relevant environments

### 4. Redeploy
- After adding environment variables, trigger a new deployment
- Go to Deployments → Redeploy or push a new commit

## Verification

After deployment, test these endpoints:
- `/api/supabase/check` - Should show "connected" status
- `/api/agent/compose-email` - Should work without Supabase errors

## Error Resolution

The current errors:
- `Invalid API key` - Will be fixed by adding correct Supabase keys
- `identitytoolkit.googleapis.com` error - Will be resolved when Supabase auth works
- `Failed to save task history` - Will work once Supabase is connected

## Alternative: Vercel CLI Setup

If you prefer CLI, run:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
```