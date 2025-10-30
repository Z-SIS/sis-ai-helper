#!/usr/bin/env node

/**
 * Local Vercel Environment Variable Setup Helper
 * 
 * Run this script locally to set up clean environment variable names in Vercel
 * by copying values from the auto-generated Supabase integration variables.
 * 
 * Usage: node vercel-env-setup-local.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment variables to set up
const environmentVariables = [
  {
    clean: 'NEXT_PUBLIC_SUPABASE_URL',
    source: 'NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL',
    description: 'Supabase Project URL'
  },
  {
    clean: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    source: 'NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY',
    description: 'Supabase Anonymous Key'
  },
  {
    clean: 'SUPABASE_SERVICE_ROLE_KEY',
    source: 'mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase Service Role Key'
  },
  {
    clean: 'SUPABASE_JWT_SECRET',
    source: 'mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET',
    description: 'Supabase JWT Secret'
  },
  {
    clean: 'POSTGRES_URL',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL',
    description: 'PostgreSQL Connection URL'
  },
  {
    clean: 'POSTGRES_PRISMA_URL',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL',
    description: 'PostgreSQL Prisma URL'
  },
  {
    clean: 'POSTGRES_URL_NON_POOLING',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING',
    description: 'PostgreSQL Non-Pooling URL'
  },
  {
    clean: 'POSTGRES_USER',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_USER',
    description: 'PostgreSQL Username'
  },
  {
    clean: 'POSTGRES_PASSWORD',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD',
    description: 'PostgreSQL Password'
  },
  {
    clean: 'POSTGRES_DATABASE',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_DATABASE',
    description: 'PostgreSQL Database Name'
  },
  {
    clean: 'POSTGRES_HOST',
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_HOST',
    description: 'PostgreSQL Host'
  }
];

console.log('🚀 Vercel Environment Variable Setup Helper');
console.log('============================================\n');

// Check prerequisites
function checkPrerequisites() {
  try {
    execSync('npx vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI found');
  } catch (error) {
    console.log('❌ Vercel CLI not found. Please install it first:');
    console.log('   npm install vercel');
    console.log('   Then run this script again');
    return false;
  }

  try {
    execSync('npx vercel whoami', { stdio: 'pipe' });
    console.log('✅ Logged in to Vercel\n');
    return true;
  } catch (error) {
    console.log('⚠️  Not logged in to Vercel, but continuing with setup generation...');
    console.log('   You can log in later with: npx vercel login\n');
    return false;
  }
}

// Generate commands for manual execution
function generateCommands() {
  console.log('📋 Commands to execute manually:\n');
  
  environmentVariables.forEach((envVar, index) => {
    console.log(`${index + 1}. ${envVar.clean}`);
    console.log(`   npx vercel env add ${envVar.clean} production`);
    console.log(`   When prompted, paste the value of: ${envVar.source}`);
    console.log(`   Description: ${envVar.description}\n`);
  });
}

// Check which variables are already set
function checkExistingVariables() {
  console.log('🔍 Checking existing environment variables...\n');
  
  try {
    const result = execSync('npx vercel env ls', { encoding: 'utf8' });
    const existingVars = result.split('\n')
      .filter(line => line.trim())
      .filter(line => !line.includes('No environment variables found'));
    
    if (existingVars.length > 0) {
      console.log('✅ Existing environment variables:');
      existingVars.forEach(line => console.log(`   ${line}`));
    } else {
      console.log('ℹ️  No environment variables found yet');
    }
  } catch (error) {
    console.log('ℹ️  Could not retrieve existing variables');
  }
  
  console.log('\n');
}

// Generate a setup script
function generateSetupScript() {
  let scriptContent = `#!/bin/bash
# Auto-generated Vercel environment variable setup script
# Generated on: ${new Date().toISOString()}

echo "🚀 Setting up Vercel environment variables..."
echo ""

`;

  environmentVariables.forEach((envVar, index) => {
    scriptContent += `echo "${index + 1}. Setting up ${envVar.clean}..."
echo "   Source: ${envVar.source}"
echo "   Description: ${envVar.description}"

# Try to get value from environment
if [ -n "${'$'}{${envVar.source}}" ]; then
    echo "${'$'}{${envVar.source}}" | npx vercel env add ${envVar.clean} production
    echo "   ✅ Added ${envVar.clean}"
else
    echo "   ⚠️  Environment variable ${envVar.source} not found locally"
    echo "   📋 Please run manually: npx vercel env add ${envVar.clean} production"
    echo "   💡 Get the value from Vercel dashboard → Settings → Environment Variables"
fi
echo ""

`;
  });

  scriptContent += `echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: vercel env ls (to verify variables were added)"
echo "2. Run: vercel --prod (to redeploy with new variables)"
echo "3. Test your application"
echo ""
echo "🌐 Check your deployed application to ensure everything works!"
`;

  const scriptPath = path.join(__dirname, 'auto-setup-vercel-env.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  
  try {
    fs.chmodSync(scriptPath, '755');
    console.log(`✅ Generated setup script: ${scriptPath}`);
    console.log('   You can run: ./auto-setup-vercel-env.sh\n');
  } catch (error) {
    console.log(`✅ Generated setup script: ${scriptPath}`);
    console.log('   Make it executable with: chmod +x auto-setup-vercel-env.sh\n');
  }
}

// Main execution
function main() {
  const isLoggedIn = checkPrerequisites();

  if (isLoggedIn) {
    checkExistingVariables();
  } else {
    console.log('🔍 Skipping environment variable check (not logged in)\n');
  }

  generateCommands();
  generateSetupScript();

  console.log('🎯 Setup Instructions:');
  console.log('====================');
  console.log('');
  console.log('Option 1: Manual Setup (Recommended)');
  console.log('  - Run the commands listed above one by one');
  console.log('  - When prompted, paste the values from your existing variables');
  console.log('');
  console.log('Option 2: Use Generated Script');
  console.log('  - Run: ./auto-setup-vercel-env.sh');
  console.log('  - This will attempt to set variables automatically');
  console.log('');
  console.log('Option 3: Vercel Dashboard');
  console.log('  - Go to your Vercel project → Settings → Environment Variables');
  console.log('  - Add each variable manually using the clean names');
  console.log('');
  
  if (!isLoggedIn) {
    console.log('🔑 First, login to Vercel:');
    console.log('  npx vercel login');
    console.log('');
  }
  
  console.log('🔍 After Setup:');
  console.log('  1. Verify: npx vercel env ls');
  console.log('  2. Redeploy: npx vercel --prod');
  console.log('  3. Test your application');
  console.log('');
  console.log('✨ Good luck with your environment variable setup!');
}

// Run the script
main();