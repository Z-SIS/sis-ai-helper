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
https://your-project.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
your_supabase_anon_key
```

```
SUPABASE_SERVICE_ROLE_KEY
your_supabase_service_role_key
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
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
```

## Get Your Values

1. **Supabase URL & Keys**: Go to your Supabase project → Settings → API
2. **Google AI Key**: Get from https://aistudio.google.com/app/apikey