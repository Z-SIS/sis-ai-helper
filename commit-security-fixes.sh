#!/bin/bash

# Commit Security Fixes Script
# This script prepares and commits all security fix files

echo "🔒 Preparing to commit Supabase security fixes..."

# Check if we're in a git repository
if ! git rev-parse --git-head > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Add all security-related files
echo "📁 Adding security fix files..."
git add supabase/migrations/20251030_fix_security.sql
git add scripts/simple-security-fix.js
git add src/lib/security-fix.ts
git add src/app/api/security/fix/route.ts
git add .github/workflows/supabase-security-fix.yml
git add SECURITY_FIX_GUIDE.md
git add SECURITY_FIX_SUMMARY.md

# Check git status
echo "📊 Git status:"
git status --porcelain

# Create commit
echo "📝 Creating commit..."
git commit -m "$(cat <<'EOF'
fix: Supabase security hardening (RLS, search_path, vector schema)

- Enable Row Level Security on company_research_cache table
- Add RLS policies for authenticated users
- Fix search_path for match_company_research and update_updated_at_column functions
- Move vector extension to dedicated extensions schema
- Create performance indexes for better query performance
- Add automated security fix script and GitHub Action
- Add comprehensive security documentation

Resolves Supabase security lint warnings:
- RLS Disabled in Public (ERROR)
- Function Search Path Mutable (WARN)
- Extension in Public (WARN)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

if [ $? -eq 0 ]; then
    echo "✅ Security fixes committed successfully!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Push to remote: git push origin main"
    echo "2. GitHub Action will auto-apply fixes (if configured)"
    echo "3. Or manually run: node scripts/simple-security-fix.js"
    echo "4. Verify with: supabase db lint"
else
    echo "❌ Failed to create commit"
    exit 1
fi