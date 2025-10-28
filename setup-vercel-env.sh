#!/bin/bash
# Environment Variable Migration Script for Vercel
# ================================================
# This script sets up clean environment variable names
# by copying values from auto-generated Supabase integration vars

echo "🚀 Starting environment variable migration..."
echo "This script will set up clean environment variable names"
echo "by copying values from auto-generated Supabase integration vars"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    echo "   vercel login"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel CLI found and logged in"

echo "📝 Setting NEXT_PUBLIC_SUPABASE_URL..."
echo "   Source: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL"
echo "   Description: Supabase Project URL"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo ""
echo "When prompted, paste the value from: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "   Source: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY"
echo "   Description: Supabase Anonymous Key"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo ""
echo "When prompted, paste the value from: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "   Source: mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY"
echo "   Description: Supabase Service Role Key"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting SUPABASE_JWT_SECRET..."
echo "   Source: mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET"
echo "   Description: Supabase JWT Secret"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add SUPABASE_JWT_SECRET production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting DATABASE_URL..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_URL"
echo "   Description: Database Connection URL (for Prisma)"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add DATABASE_URL production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_URL"
echo "Note: This value will be automatically transformed for compatibility"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_URL..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_URL"
echo "   Description: PostgreSQL Connection URL"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_URL production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_URL"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_PRISMA_URL..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL"
echo "   Description: PostgreSQL Prisma URL"
echo "   Required: NO"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_PRISMA_URL production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_URL_NON_POOLING..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING"
echo "   Description: PostgreSQL Non-Pooling URL"
echo "   Required: NO"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_URL_NON_POOLING production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_USER..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_USER"
echo "   Description: PostgreSQL Username"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_USER production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_USER"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_PASSWORD..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD"
echo "   Description: PostgreSQL Password"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_PASSWORD production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_DATABASE..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_DATABASE"
echo "   Description: PostgreSQL Database Name"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_DATABASE production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_DATABASE"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "📝 Setting POSTGRES_HOST..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_HOST"
echo "   Description: PostgreSQL Host"
echo "   Required: YES"
echo ""
echo "Please run the following command manually:"
echo "vercel env add POSTGRES_HOST production"
echo ""
echo "When prompted, paste the value from: mrofgjydvwjqbnhxrits_POSTGRES_HOST"
echo ""
echo "Press Enter to continue to the next variable..."
read -r

echo "🎉 Migration script completed!"
echo ""
echo "📋 Summary of actions needed:"
echo "1. Run all the vercel env add commands shown above"
echo "2. Redeploy your Vercel project: vercel --prod"
echo "3. Test the application to ensure everything works"
echo ""
echo "✨ Good luck!"
