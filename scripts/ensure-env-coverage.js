#!/usr/bin/env node

/**
 * Environment Variable Coverage Script
 * 
 * This script ensures full Vercel environment variable coverage for Supabase + Prisma stack
 * It checks for missing variables and creates aliases from auto-generated Supabase integration vars
 */

const fs = require('fs');
const path = require('path');

// Critical environment variables that must be present
const CRITICAL_VARS = {
  // Supabase (clean names)
  'NEXT_PUBLIC_SUPABASE_URL': {
    source: 'NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL',
    description: 'Supabase Project URL',
    required: true
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    source: 'NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY',
    description: 'Supabase Anonymous Key',
    required: true
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    source: 'mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase Service Role Key',
    required: true
  },
  'SUPABASE_JWT_SECRET': {
    source: 'mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET',
    description: 'Supabase JWT Secret',
    required: true
  },
  
  // Database/PostgreSQL
  'DATABASE_URL': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL',
    description: 'Database Connection URL (for Prisma)',
    required: true,
    transform: (value) => {
      // Ensure the URL is in the correct format for Prisma
      if (value && !value.startsWith('postgresql://')) {
        // Convert if needed
        return value.replace('postgres://', 'postgresql://');
      }
      return value;
    }
  },
  'POSTGRES_URL': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL',
    description: 'PostgreSQL Connection URL',
    required: true
  },
  'POSTGRES_PRISMA_URL': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL',
    description: 'PostgreSQL Prisma URL',
    required: false
  },
  'POSTGRES_URL_NON_POOLING': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING',
    description: 'PostgreSQL Non-Pooling URL',
    required: false
  },
  'POSTGRES_USER': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_USER',
    description: 'PostgreSQL Username',
    required: true
  },
  'POSTGRES_PASSWORD': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD',
    description: 'PostgreSQL Password',
    required: true
  },
  'POSTGRES_DATABASE': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_DATABASE',
    description: 'PostgreSQL Database Name',
    required: true
  },
  'POSTGRES_HOST': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_HOST',
    description: 'PostgreSQL Host',
    required: true
  },
  
  // Clerk Authentication
  'CLERK_SECRET_KEY': {
    source: null,
    description: 'Clerk Secret Key',
    required: false
  },
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': {
    source: null,
    description: 'Clerk Publishable Key',
    required: false
  }
};

// AI Services (not critical for basic functionality)
const AI_VARS = {
  'GOOGLE_GENERATIVE_AI_API_KEY': {
    description: 'Google Generative AI API Key',
    required: false
  },
  'TAVILY_API_KEY': {
    description: 'Tavily Search API Key',
    required: false
  },
  'ZAI_API_KEY': {
    description: 'ZAI API Key',
    required: false
  }
};

console.log('🔍 Environment Variable Coverage Check');
console.log('=====================================\n');

// Check current environment
function checkCurrentEnvironment() {
  console.log('📋 Current Environment Status:');
  console.log('==============================\n');
  
  const results = {
    critical: { present: [], missing: [], aliased: [] },
    optional: { present: [], missing: [] },
    issues: []
  };

  // Check critical variables
  Object.entries(CRITICAL_VARS).forEach(([targetVar, config]) => {
    const targetValue = process.env[targetVar];
    const sourceValue = config.source ? process.env[config.source] : null;
    
    if (targetValue) {
      results.critical.present.push({
        var: targetVar,
        value: maskValue(targetValue),
        source: 'direct'
      });
      console.log(`✅ ${targetVar}: PRESENT (${maskValue(targetValue)})`);
    } else if (sourceValue) {
      const transformedValue = config.transform ? config.transform(sourceValue) : sourceValue;
      results.critical.aliased.push({
        var: targetVar,
        source: config.source,
        sourceValue: maskValue(sourceValue),
        transformedValue: maskValue(transformedValue)
      });
      console.log(`🔄 ${targetVar}: CAN BE ALIASED from ${config.source}`);
      console.log(`   Source: ${maskValue(sourceValue)}`);
      if (config.transform) {
        console.log(`   Transformed: ${maskValue(transformedValue)}`);
      }
    } else {
      results.critical.missing.push({
        var: targetVar,
        description: config.description,
        required: config.required
      });
      console.log(`❌ ${targetVar}: MISSING ${config.required ? '(REQUIRED)' : '(OPTIONAL)'}`);
      if (config.description) {
        console.log(`   Description: ${config.description}`);
      }
    }
    console.log('');
  });

  // Check AI variables
  Object.entries(AI_VARS).forEach(([varName, config]) => {
    const value = process.env[varName];
    if (value) {
      results.optional.present.push({
        var: varName,
        value: maskValue(value)
      });
      console.log(`✅ ${varName}: PRESENT (${maskValue(value)})`);
    } else {
      results.optional.missing.push({
        var: varName,
        description: config.description
      });
      console.log(`⚠️  ${varName}: MISSING (${config.description})`);
    }
    console.log('');
  });

  return results;
}

// Mask sensitive values for display
function maskValue(value) {
  if (!value) return 'null';
  if (value.length <= 8) return '••••••••';
  return value.substring(0, 8) + '••••••••';
}

// Generate Vercel CLI commands
function generateVercelCommands(results) {
  console.log('🔧 Vercel CLI Commands to Execute:');
  console.log('==================================\n');
  
  const commands = [];
  
  // Generate commands for missing critical variables that can be aliased
  results.critical.aliased.forEach(item => {
    const config = CRITICAL_VARS[item.var];
    const sourceValue = process.env[item.source];
    const finalValue = config.transform ? config.transform(sourceValue) : sourceValue;
    
    console.log(`# Set ${item.var}`);
    console.log(`vercel env add ${item.var} production`);
    console.log(`# When prompted, paste: ${finalValue}`);
    console.log('');
    
    commands.push({
      var: item.var,
      command: `vercel env add ${item.var} production`,
      value: finalValue,
      description: config.description
    });
  });
  
  // Generate commands for missing required variables
  results.critical.missing.filter(item => item.required).forEach(item => {
    console.log(`# Set ${item.var} (REQUIRED)`);
    console.log(`vercel env add ${item.var} production`);
    console.log(`# You'll need to provide this value manually`);
    console.log(`# Description: ${item.description}`);
    console.log('');
    
    commands.push({
      var: item.var,
      command: `vercel env add ${item.var} production`,
      value: null,
      description: item.description,
      required: true
    });
  });
  
  return commands;
}

// Generate .env.example file
function generateEnvExample(results) {
  console.log('📝 Generating .env.example file...');
  
  let content = '# Environment Variables Example\n';
  content += '# Copy this file to .env.local and fill in the values\n\n';
  
  content += '# ============================================\n';
  content += '# Supabase Configuration (REQUIRED)\n';
  content += '# ============================================\n\n';
  
  Object.entries(CRITICAL_VARS).forEach(([varName, config]) => {
    if (varName.includes('SUPABASE')) {
      content += `# ${config.description}\n`;
      content += `${varName}=\n\n`;
    }
  });
  
  content += '# ============================================\n';
  content += '# Database Configuration (REQUIRED)\n';
  content += '# ============================================\n\n';
  
  Object.entries(CRITICAL_VARS).forEach(([varName, config]) => {
    if (varName.includes('POSTGRES') || varName === 'DATABASE_URL') {
      content += `# ${config.description}\n`;
      content += `${varName}=\n\n`;
    }
  });
  
  content += '# ============================================\n';
  content += '# Authentication (Optional)\n';
  content += '# ============================================\n\n';
  
  Object.entries(CRITICAL_VARS).forEach(([varName, config]) => {
    if (varName.includes('CLERK')) {
      content += `# ${config.description}\n`;
      content += `${varName}=\n\n`;
    }
  });
  
  content += '# ============================================\n';
  content += '# AI Services (Optional)\n';
  content += '# ============================================\n\n';
  
  Object.entries(AI_VARS).forEach(([varName, config]) => {
    content += `# ${config.description}\n`;
    content += `${varName}=\n\n`;
  });
  
  content += '# ============================================\n';
  content += '# Platform Configuration\n';
  content += '# ============================================\n\n';
  content += 'NODE_ENV=development\n';
  content += 'VERCEL_ENV=development\n\n';
  
  try {
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), content);
    console.log('✅ .env.example generated successfully');
  } catch (error) {
    console.log('❌ Failed to generate .env.example:', error.message);
  }
}

// Generate migration script
function generateMigrationScript(results) {
  console.log('🔄 Generating migration script...');
  
  let script = '#!/bin/bash\n';
  script += '# Environment Variable Migration Script\n';
  script += '# Generated automatically to ensure full coverage\n\n';
  
  script += 'echo "🚀 Starting environment variable migration..."\n\n';
  
  results.critical.aliased.forEach(item => {
    const config = CRITICAL_VARS[item.var];
    const sourceValue = process.env[item.source];
    const finalValue = config.transform ? config.transform(sourceValue) : sourceValue;
    
    script += `echo "📝 Setting ${item.var}..."\n`;
    script += `echo "${finalValue}" | vercel env add ${item.var} production\n`;
    script += `echo "✅ ${item.var} set"\n\n`;
  });
  
  script += 'echo "🎉 Migration complete!"\n';
  script += 'echo "🔄 Please redeploy your Vercel project to apply changes"\n';
  
  try {
    fs.writeFileSync(path.join(process.cwd(), 'migrate-env-vars.sh'), script);
    fs.chmodSync(path.join(process.cwd(), 'migrate-env-vars.sh'), '755');
    console.log('✅ Migration script generated: migrate-env-vars.sh');
  } catch (error) {
    console.log('❌ Failed to generate migration script:', error.message);
  }
}

// Main execution
function main() {
  const results = checkCurrentEnvironment();
  
  console.log('📊 Summary:');
  console.log('==========');
  console.log(`Critical Variables: ${results.critical.present.length} present, ${results.critical.aliased.length} can be aliased, ${results.critical.missing.length} missing`);
  console.log(`Optional Variables: ${results.optional.present.length} present, ${results.optional.missing.length} missing`);
  console.log('');
  
  if (results.critical.aliased.length > 0 || results.critical.missing.length > 0) {
    console.log('🔧 Action Required:');
    console.log('==================');
    generateVercelCommands(results);
    generateMigrationScript(results);
  } else {
    console.log('✅ All critical environment variables are present!');
  }
  
  generateEnvExample(results);
  
  console.log('\n🎯 Next Steps:');
  console.log('==============');
  if (results.critical.aliased.length > 0) {
    console.log('1. Run the migration script: ./migrate-env-vars.sh');
    console.log('2. Or execute the Vercel CLI commands manually');
  }
  if (results.critical.missing.filter(item => item.required).length > 0) {
    console.log('3. Manually add the missing required variables');
  }
  console.log('4. Redeploy your Vercel project');
  console.log('5. Test the application');
  
  console.log('\n✨ Environment variable coverage analysis complete!');
}

// Run the script
main();