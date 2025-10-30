#!/usr/bin/env node

/**
 * Direct Security Fix Execution
 * 
 * This script executes the SQL security fixes directly
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read the SQL file
const sqlFile = path.join(__dirname, 'fix-security-issues.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log('🔒 Executing security fixes for Supabase database...\n');

// Split SQL content into individual statements
const statements = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

// For now, let's create a simplified version that can be executed via the API
async function executeViaAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    console.log('🚀 Executing security fixes via API...');
    
    const response = await fetch(`${baseUrl}/api/security/fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'fix' })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Security fixes completed successfully!');
      console.log('\n📊 Summary:');
      result.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    } else {
      console.error('❌ Failed to apply security fixes:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
    }

  } catch (error) {
    console.error('❌ Error executing via API:', error.message);
    console.log('\n💡 Alternative: You can execute the SQL manually using the fix-security-issues.sql file');
  }
}

// Check status function
async function checkStatus() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    console.log('🔍 Checking security status...');
    
    const response = await fetch(`${baseUrl}/api/security/fix`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Security status retrieved successfully!');
      console.log('\n📊 Current RLS Status:');
      result.data.forEach(table => {
        const status = table.rls_enabled ? '✅ Enabled' : '❌ Disabled';
        console.log(`  ${table.tablename}: ${status}`);
      });
    } else {
      console.error('❌ Failed to check security status:', result.message);
    }

  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'check';

  if (action === 'check') {
    await checkStatus();
  } else if (action === 'fix') {
    await executeViaAPI();
  } else if (action === 'sql') {
    console.log('📄 SQL Content for manual execution:');
    console.log('=' .repeat(50));
    console.log(sqlContent);
    console.log('=' .repeat(50));
    console.log('\n💡 Copy this SQL and execute it in your Supabase SQL editor');
  } else {
    console.log('Usage: node execute-security-fix.js [check|fix|sql]');
    console.log('  check - Check current security status');
    console.log('  fix   - Apply security fixes via API');
    console.log('  sql   - Show SQL for manual execution');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}