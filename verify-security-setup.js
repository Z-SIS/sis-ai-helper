#!/usr/bin/env node

/**
 * Verify Security Setup Files
 * This script checks that all security fix files are properly created
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Supabase Security Fix Setup\n');

const requiredFiles = [
  'supabase/migrations/20251030_fix_security.sql',
  'scripts/simple-security-fix.js',
  'src/lib/security-fix.ts',
  'src/app/api/security/fix/route.ts',
  '.github/workflows/supabase-security-fix.yml',
  'SECURITY_FIX_GUIDE.md',
  'SECURITY_FIX_SUMMARY.md'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) {
    allFilesExist = false;
  }
});

console.log('\n📊 File Details:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  📄 ${file} (${sizeKB} KB)`);
  }
});

console.log('\n🔧 Setup Status:');
if (allFilesExist) {
  console.log('✅ All security fix files are in place!');
  console.log('\n🚀 Ready to apply fixes:');
  console.log('1. Set DATABASE_URL environment variable');
  console.log('2. Run: node scripts/simple-security-fix.js');
  console.log('3. Verify with: supabase db lint');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}

console.log('\n📋 Next Steps:');
console.log('1. Configure DATABASE_URL with service-role permissions');
console.log('2. Execute the security fix script');
console.log('3. Verify the fixes are applied');
console.log('4. Test your application functionality');

console.log('\n🛡️ Security Issues Addressed:');
console.log('• RLS enabled on company_research_cache');
console.log('• Function search_path fixed');
console.log('• Vector extension moved to secure schema');
console.log('• Performance indexes created');
console.log('• Proper permissions granted');