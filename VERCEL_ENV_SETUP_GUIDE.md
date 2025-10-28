# Vercel Environment Variable Setup Guide

## 🎯 Overview
This guide helps you add clean environment variable names to your Vercel project, copying values from the auto-generated Supabase integration variables.

## 📋 Environment Variables to Add

| Clean Name | Source Variable | Description |
|------------|----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `SUPABASE_JWT_SECRET` | `mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET` | Supabase JWT Secret |
| `POSTGRES_URL` | `mrofgjydvwjqbnhxrits_POSTGRES_URL` | PostgreSQL Connection URL |
| `POSTGRES_PRISMA_URL` | `mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL` | PostgreSQL Prisma URL |
| `POSTGRES_URL_NON_POOLING` | `mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING` | PostgreSQL Non-Pooling URL |
| `POSTGRES_USER` | `mrofgjydvwjqbnhxrits_POSTGRES_USER` | PostgreSQL Username |
| `POSTGRES_PASSWORD` | `mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD` | PostgreSQL Password |
| `POSTGRES_DATABASE` | `mrofgjydvwjqbnhxrits_POSTGRES_DATABASE` | PostgreSQL Database Name |
| `POSTGRES_HOST` | `mrofgjydvwjqbnhxrits_POSTGRES_HOST` | PostgreSQL Host |

## 🚀 Quick Setup Commands

### Prerequisites
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login
```

### Method 1: Manual Setup (Recommended)
Run these commands one by one. When prompted for the value, copy the value from the source variable:

```bash
# 1. Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# When prompted, paste the value of: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL

# 2. Supabase Anonymous Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# When prompted, paste the value of: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY

# 3. Supabase Service Role Key
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY

# 4. Supabase JWT Secret
vercel env add SUPABASE_JWT_SECRET production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET

# 5. PostgreSQL URL
vercel env add POSTGRES_URL production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_URL

# 6. PostgreSQL Prisma URL
vercel env add POSTGRES_PRISMA_URL production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL

# 7. PostgreSQL Non-Pooling URL
vercel env add POSTGRES_URL_NON_POOLING production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING

# 8. PostgreSQL User
vercel env add POSTGRES_USER production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_USER

# 9. PostgreSQL Password
vercel env add POSTGRES_PASSWORD production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD

# 10. PostgreSQL Database
vercel env add POSTGRES_DATABASE production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_DATABASE

# 11. PostgreSQL Host
vercel env add POSTGRES_HOST production
# When prompted, paste the value of: mrofgjydvwjqbnhxrits_POSTGRES_HOST
```

### Method 2: Using Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New** for each variable:
   - **Name**: Use the "Clean Name" from the table above
   - **Value**: Copy from the corresponding "Source Variable"
   - **Environment**: Select **Production**
4. Click **Save** for each variable

## 🔍 How to Get Source Variable Values

### Option 1: From Vercel Dashboard
1. Go to your project's **Settings** → **Environment Variables**
2. Look for variables with the prefix `mrofgjydvwjqbnhxrits_`
3. Copy their values to the new clean variable names

### Option 2: From Local Environment (if available)
If you have these variables set locally, you can check them:
```bash
echo $NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL
echo $NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY
# ... etc for other variables
```

## ✅ Verification

### Check Added Variables
```bash
# List all environment variables
vercel env ls

# Check specific variable
vercel env pull .env.production
```

### Test the Application
1. **Redeploy your project**:
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from the Vercel dashboard

2. **Test the connection**:
   - Visit your deployed application
   - Check the Supabase connection status in the dashboard
   - Verify all features are working

## 🔄 After Setup

### Update Code (Optional)
Once the clean environment variables are set up, you can optionally update your code to use them instead of the prefixed versions:

```typescript
// Before (current)
const supabaseUrl = process.env.NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL

// After (optional)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
```

### Benefits of Clean Variables
- ✅ Better readability
- ✅ Easier maintenance
- ✅ Portability between projects
- ✅ Cleaner code

## 🚨 Important Notes

1. **Don't remove the original variables** until you've confirmed the clean ones work
2. **Redeploy after adding variables** to apply changes
3. **Test thoroughly** to ensure all functionality works
4. **Keep secrets secure** - never commit environment variables to git

## 🎯 Expected Result

After setup, your application should:
- ✅ Connect to Supabase successfully
- ✅ Use clean environment variable names
- ✅ Maintain all existing functionality
- ✅ Be easier to maintain and debug

## 🆘 Troubleshooting

### Variables Not Working
1. Check variable names are exact (no typos)
2. Ensure values are copied correctly
3. Verify redeployment completed
4. Check Vercel function logs for errors

### Connection Issues
1. Verify Supabase URL is correct
2. Check API keys have proper permissions
3. Ensure service role key is set for server operations
4. Test with the Supabase connection checker

### Need Help?
- Check Vercel deployment logs
- Review Supabase project settings
- Verify environment variable values
- Test API endpoints individually