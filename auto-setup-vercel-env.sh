#!/bin/bash
# Auto-generated Vercel environment variable setup script
# Generated on: 2025-10-30T06:32:25.251Z

echo "🚀 Setting up Vercel environment variables..."
echo ""

echo "1. Setting up NEXT_PUBLIC_SUPABASE_URL..."
echo "   Source: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL"
echo "   Description: Supabase Project URL"

# Try to get value from environment
if [ -n "${NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL}" ]; then
    echo "${NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL}" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
    echo "   ✅ Added NEXT_PUBLIC_SUPABASE_URL"
else
    echo "   ⚠️  Environment variable NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL not found locally"
    echo "   📋 Please run manually: npx vercel env add NEXT_PUBLIC_SUPABASE_URL production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "2. Setting up NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "   Source: NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY"
echo "   Description: Supabase Anonymous Key"

# Try to get value from environment
if [ -n "${NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY}" ]; then
    echo "${NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY}" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
    echo "   ✅ Added NEXT_PUBLIC_SUPABASE_ANON_KEY"
else
    echo "   ⚠️  Environment variable NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY not found locally"
    echo "   📋 Please run manually: npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "3. Setting up SUPABASE_SERVICE_ROLE_KEY..."
echo "   Source: mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY"
echo "   Description: Supabase Service Role Key"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY}" ]; then
    echo "${mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY}" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
    echo "   ✅ Added SUPABASE_SERVICE_ROLE_KEY"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY not found locally"
    echo "   📋 Please run manually: npx vercel env add SUPABASE_SERVICE_ROLE_KEY production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "4. Setting up SUPABASE_JWT_SECRET..."
echo "   Source: mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET"
echo "   Description: Supabase JWT Secret"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET}" ]; then
    echo "${mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET}" | npx vercel env add SUPABASE_JWT_SECRET production
    echo "   ✅ Added SUPABASE_JWT_SECRET"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET not found locally"
    echo "   📋 Please run manually: npx vercel env add SUPABASE_JWT_SECRET production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "5. Setting up POSTGRES_URL..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_URL"
echo "   Description: PostgreSQL Connection URL"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_URL}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_URL}" | npx vercel env add POSTGRES_URL production
    echo "   ✅ Added POSTGRES_URL"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_URL not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_URL production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "6. Setting up POSTGRES_PRISMA_URL..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL"
echo "   Description: PostgreSQL Prisma URL"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL}" | npx vercel env add POSTGRES_PRISMA_URL production
    echo "   ✅ Added POSTGRES_PRISMA_URL"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_PRISMA_URL production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "7. Setting up POSTGRES_URL_NON_POOLING..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING"
echo "   Description: PostgreSQL Non-Pooling URL"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING}" | npx vercel env add POSTGRES_URL_NON_POOLING production
    echo "   ✅ Added POSTGRES_URL_NON_POOLING"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_URL_NON_POOLING production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "8. Setting up POSTGRES_USER..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_USER"
echo "   Description: PostgreSQL Username"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_USER}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_USER}" | npx vercel env add POSTGRES_USER production
    echo "   ✅ Added POSTGRES_USER"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_USER not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_USER production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "9. Setting up POSTGRES_PASSWORD..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD"
echo "   Description: PostgreSQL Password"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD}" | npx vercel env add POSTGRES_PASSWORD production
    echo "   ✅ Added POSTGRES_PASSWORD"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_PASSWORD production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "10. Setting up POSTGRES_DATABASE..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_DATABASE"
echo "   Description: PostgreSQL Database Name"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_DATABASE}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_DATABASE}" | npx vercel env add POSTGRES_DATABASE production
    echo "   ✅ Added POSTGRES_DATABASE"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_DATABASE not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_DATABASE production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "11. Setting up POSTGRES_HOST..."
echo "   Source: mrofgjydvwjqbnhxrits_POSTGRES_HOST"
echo "   Description: PostgreSQL Host"

# Try to get value from environment
if [ -n "${mrofgjydvwjqbnhxrits_POSTGRES_HOST}" ]; then
    echo "${mrofgjydvwjqbnhxrits_POSTGRES_HOST}" | npx vercel env add POSTGRES_HOST production
    echo "   ✅ Added POSTGRES_HOST"
else
    echo "   ⚠️  Environment variable mrofgjydvwjqbnhxrits_POSTGRES_HOST not found locally"
    echo "   📋 Please run manually: npx vercel env add POSTGRES_HOST production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: vercel env ls (to verify variables were added)"
echo "2. Run: vercel --prod (to redeploy with new variables)"
echo "3. Test your application"
echo ""
echo "🌐 Check your deployed application to ensure everything works!"
