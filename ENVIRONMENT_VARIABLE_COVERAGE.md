# Environment Variable Coverage for Supabase + Prisma + Clerk

This document outlines the complete environment variable setup for the SIS AI Helper project using Supabase, Prisma, and Clerk integration on Vercel.

## Overview

The project has been updated to use clean environment variable names instead of the auto-generated prefixed variables from Vercel's Supabase integration. This improves maintainability and makes the codebase more portable.

## Critical Environment Variables

### Supabase Configuration (REQUIRED)

| Variable Name | Source Variable | Description | Required |
|---------------|-----------------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL` | Supabase Project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY` | Supabase Anonymous Key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | `mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | ✅ |
| `SUPABASE_JWT_SECRET` | `mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET` | Supabase JWT Secret | ✅ |

### Database Configuration (REQUIRED)

| Variable Name | Source Variable | Description | Required |
|---------------|-----------------|-------------|----------|
| `DATABASE_URL` | `mrofgjydvwjqbnhxrits_POSTGRES_URL` | Database Connection URL (for Prisma) | ✅ |
| `POSTGRES_URL` | `mrofgjydvwjqbnhxrits_POSTGRES_URL` | PostgreSQL Connection URL | ✅ |
| `POSTGRES_PRISMA_URL` | `mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL` | PostgreSQL Prisma URL | ❌ |
| `POSTGRES_URL_NON_POOLING` | `mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING` | PostgreSQL Non-Pooling URL | ❌ |
| `POSTGRES_USER` | `mrofgjydvwjqbnhxrits_POSTGRES_USER` | PostgreSQL Username | ✅ |
| `POSTGRES_PASSWORD` | `mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD` | PostgreSQL Password | ✅ |
| `POSTGRES_DATABASE` | `mrofgjydvwjqbnhxrits_POSTGRES_DATABASE` | PostgreSQL Database Name | ✅ |
| `POSTGRES_HOST` | `mrofgjydvwjqbnhxrits_POSTGRES_HOST` | PostgreSQL Host | ✅ |

### Authentication (Optional)

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `CLERK_SECRET_KEY` | Clerk Secret Key | ❌ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | ❌ |

### AI Services (Optional)

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API Key | ❌ |
| `TAVILY_API_KEY` | Tavily Search API Key | ❌ |
| `ZAI_API_KEY` | ZAI API Key | ❌ |

## Setup Instructions

### 1. Automatic Setup (Recommended)

Run the provided setup script:

```bash
./setup-vercel-env.sh
```

This script will:
- Check if Vercel CLI is installed and you're logged in
- Guide you through setting up each environment variable
- Provide clear instructions for copying values from source variables

### 2. Manual Setup

If you prefer to set up manually, use these commands:

```bash
# Supabase Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_JWT_SECRET production

# Database Variables
vercel env add DATABASE_URL production
vercel env add POSTGRES_URL production
vercel env add POSTGRES_USER production
vercel env add POSTGRES_PASSWORD production
vercel env add POSTGRES_DATABASE production
vercel env add POSTGRES_HOST production

# Optional Variables
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
vercel env add TAVILY_API_KEY production
```

### 3. Getting Source Values

To get the values from your existing Vercel Supabase integration:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Look for variables with the prefix `mrofgjydvwjqbnhxrits_`
4. Copy their values to the new clean variable names

## Important Notes

### DATABASE_URL Format
The `DATABASE_URL` should be in `postgresql://` format for Prisma compatibility. The setup script automatically converts `postgres://` to `postgresql://`.

### Prisma Configuration
The `prisma/schema.prisma` has been updated to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Code Updates
All references to old namespaced variables have been updated to use clean names:

- `NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`
- And all other variables...

## Verification

### 1. Check Environment Variables
Use the debug endpoint to verify all variables are set:
```
https://your-app.vercel.app/api/debug/env
```

### 2. Check API Connection Status
Visit the Settings page in your application and check the "API Connection Status" section.

### 3. Test Database Connection
The connection status will show if Prisma can connect to your PostgreSQL database.

## Troubleshooting

### Variables Not Working
1. Ensure you've redeployed after setting environment variables
2. Check variable names match exactly (no typos)
3. Verify values are copied correctly from source variables

### Database Connection Issues
1. Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
2. Ensure PostgreSQL credentials are correct
3. Verify the database is accessible from Vercel

### Supabase Connection Issues
1. Verify Supabase URL and keys are correct
2. Check Supabase project settings
3. Ensure RLS policies allow access

## Files Modified

- `prisma/schema.prisma` - Updated to use PostgreSQL
- `src/lib/supabase.ts` - Updated to use clean variable names
- `src/lib/check-supabase.ts` - Updated variable references
- `src/app/api/supabase/check/route.ts` - Updated variable references
- `src/app/api/connection-status/route.ts` - Updated variable references
- `src/app/api/debug/env/route.ts` - Updated variable references
- `src/components/dashboard/history-sidebar.tsx` - Updated variable references
- `src/components/dashboard/forms/SettingsForm.tsx` - Updated variable references
- `.env.example` - Added comprehensive environment variable template

## Scripts Provided

- `scripts/manage-env-vars.js` - Main environment variable management script
- `setup-vercel-env.sh` - Interactive Vercel setup script
- `update-code-vars.sh` - Code update script (already executed)
- `migrate-env-vars.sh` - Legacy migration script

## Next Steps

1. ✅ Environment variable scripts created
2. ✅ Code updated to use clean variable names
3. ✅ Prisma schema updated for PostgreSQL
4. ✅ .env.example generated
5. 🔄 Set up environment variables in Vercel
6. 🔄 Test the application
7. 🔄 Deploy to production

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Use the `/api/debug/env` endpoint to verify variables
3. Check the API Connection Status in the Settings page
4. Review the environment variable mapping in this document

---

**Status**: ✅ Environment variable coverage setup complete
**Next Action**: Run `./setup-vercel-env.sh` to configure Vercel environment variables