# Vercel Environment Variables Setup Guide

## 🚨 Critical: Supabase Configuration Required

Your application is currently showing "Supabase admin not configured" errors. This means the required environment variables are not set in your Vercel deployment.

## 📋 Required Environment Variables

### 1. Supabase Configuration (REQUIRED)
Go to your Supabase project dashboard → Settings → API to get these values:

```bash
# Client-side (Public) - Required for frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side (Private) - Required for backend API routes
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://your-project-id.supabase.co
```

### 2. Google AI Configuration (REQUIRED for AI features)
Get your free API key from: https://aistudio.google.com/app/apikey

```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

### 3. Optional Services
```bash
# For web search functionality
TAVILY_API_KEY=your_tavily_key_here

# For Z.ai integration
ZAI_API_KEY=your_zai_key_here
```

## 🔧 How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable using the "Add" button:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environments**: Production, Preview, Development
5. Repeat for all required variables
6. Click "Save"

### Method 2: Vercel CLI
```bash
# Set each environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_GENERATIVE_AI_API_KEY

# Pull environment variables locally
vercel env pull .env.local
```

## 🎯 Quick Setup Steps

### Step 1: Get Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL (for `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`)
   - anon/public key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role key (for `SUPABASE_SERVICE_ROLE_KEY`)

### Step 2: Get Google AI Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

### Step 3: Add to Vercel
1. Go to your Vercel project: https://vercel.com/your-username/sis-ai-helper
2. Settings → Environment Variables
3. Add all the variables from Step 1 & 2
4. Save and redeploy

## 🔍 Verification

After setting up the variables, you should see:
- ✅ No more "Supabase admin not configured" errors
- ✅ AI features working properly
- ✅ Task history saving correctly

## 🚨 Common Issues

### Issue: "Supabase admin not configured"
**Solution**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables.

### Issue: "Invalid API key"
**Solution**: Double-check that you copied the complete API keys without extra spaces.

### Issue: Build fails
**Solution**: Ensure all required variables are set for Production environment.

## 📞 Support

If you need help:
1. Check your Supabase project settings
2. Verify API keys are correctly copied
3. Ensure variables are set for all environments (Production, Preview, Development)
4. Redeploy after adding variables

## 🔄 Redeployment

After setting environment variables:
1. Go to your Vercel project
2. Click on "Deployments"
3. Click "Redeploy" or push a new commit to trigger deployment

The application should work correctly once all environment variables are properly configured.