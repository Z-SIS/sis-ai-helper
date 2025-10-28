#!/bin/bash
# Code Update Script for Environment Variable Migration
# =====================================================
# This script updates all references to old namespaced variables

echo "🔄 Updating code to use clean environment variable names..."

echo "📝 Updating src/lib/supabase.ts..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/lib/supabase.ts
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/lib/supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/lib/supabase.ts
echo "✅ src/lib/supabase.ts updated"

echo "📝 Updating src/lib/check-supabase.ts..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/lib/check-supabase.ts
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/lib/check-supabase.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/lib/check-supabase.ts
echo "✅ src/lib/check-supabase.ts updated"

echo "📝 Updating src/app/api/supabase/check/route.ts..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/app/api/supabase/check/route.ts
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/app/api/supabase/check/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/app/api/supabase/check/route.ts
echo "✅ src/app/api/supabase/check/route.ts updated"

echo "📝 Updating src/app/api/connection-status/route.ts..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/app/api/connection-status/route.ts
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/app/api/connection-status/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/app/api/connection-status/route.ts
echo "✅ src/app/api/connection-status/route.ts updated"

echo "📝 Updating src/app/api/debug/env/route.ts..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/app/api/debug/env/route.ts
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/app/api/debug/env/route.ts
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/app/api/debug/env/route.ts
echo "✅ src/app/api/debug/env/route.ts updated"

echo "📝 Updating src/components/dashboard/history-sidebar.tsx..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/components/dashboard/history-sidebar.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/components/dashboard/history-sidebar.tsx
echo "✅ src/components/dashboard/history-sidebar.tsx updated"

echo "📝 Updating src/components/dashboard/forms/SettingsForm.tsx..."
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' src/components/dashboard/forms/SettingsForm.tsx
sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' src/components/dashboard/forms/SettingsForm.tsx
echo "✅ src/components/dashboard/forms/SettingsForm.tsx updated"

echo "🎉 Code update completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test the application locally"
echo "3. Commit the changes"
echo "4. Deploy to Vercel"
