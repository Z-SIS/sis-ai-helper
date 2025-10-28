#!/usr/bin/env node

/**
 * Environment Variable Management Script
 * 
 * This script creates a comprehensive environment variable setup for Vercel
 * It handles both clean variable names and aliases from auto-generated Supabase integration vars
 */

const fs = require('fs');
const path = require('path');

// Environment variable mapping from auto-generated to clean names
const ENV_MAPPING = {
  // Supabase - Clean Names (Target)
  'NEXT_PUBLIC_SUPABASE_URL': {
    source: 'NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL',
    description: 'Supabase Project URL',
    required: true,
    category: 'supabase'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    source: 'NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY',
    description: 'Supabase Anonymous Key',
    required: true,
    category: 'supabase'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    source: 'mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase Service Role Key',
    required: true,
    category: 'supabase'
  },
  'SUPABASE_JWT_SECRET': {
    source: 'mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET',
    description: 'Supabase JWT Secret',
    required: true,
    category: 'supabase'
  },
  
  // PostgreSQL - Clean Names (Target)
  'DATABASE_URL': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL',
    description: 'Database Connection URL (for Prisma)',
    required: true,
    category: 'database',
    transform: (value) => {
      // Ensure postgresql:// format for Prisma
      if (value && value.startsWith('postgres://')) {
        return value.replace('postgres://', 'postgresql://');
      }
      return value;
    }
  },
  'POSTGRES_URL': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL',
    description: 'PostgreSQL Connection URL',
    required: true,
    category: 'database'
  },
  'POSTGRES_PRISMA_URL': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL',
    description: 'PostgreSQL Prisma URL',
    required: false,
    category: 'database'
  },
  'POSTGRES_URL_NON_POOLING': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING',
    description: 'PostgreSQL Non-Pooling URL',
    required: false,
    category: 'database'
  },
  'POSTGRES_USER': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_USER',
    description: 'PostgreSQL Username',
    required: true,
    category: 'database'
  },
  'POSTGRES_PASSWORD': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD',
    description: 'PostgreSQL Password',
    required: true,
    category: 'database'
  },
  'POSTGRES_DATABASE': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_DATABASE',
    description: 'PostgreSQL Database Name',
    required: true,
    category: 'database'
  },
  'POSTGRES_HOST': {
    source: 'mrofgjydvwjqbnhxrits_POSTGRES_HOST',
    description: 'PostgreSQL Host',
    required: true,
    category: 'database'
  },
  
  // Clerk Authentication
  'CLERK_SECRET_KEY': {
    source: null,
    description: 'Clerk Secret Key',
    required: false,
    category: 'auth'
  },
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': {
    source: null,
    description: 'Clerk Publishable Key',
    required: false,
    category: 'auth'
  },
  
  // AI Services
  'GOOGLE_GENERATIVE_AI_API_KEY': {
    source: null,
    description: 'Google Generative AI API Key',
    required: false,
    category: 'ai'
  },
  'TAVILY_API_KEY': {
    source: null,
    description: 'Tavily Search API Key',
    required: false,
    category: 'ai'
  },
  'ZAI_API_KEY': {
    source: null,
    description: 'ZAI API Key',
    required: false,
    category: 'ai'
  }
};

console.log('🔧 Environment Variable Management');
console.log('=================================\n');

// Generate Vercel environment setup commands
function generateVercelCommands() {
  console.log('📋 Vercel Environment Variable Setup Commands:');
  console.log('==============================================\n');
  
  const commands = [];
  
  // Group by category
  const categories = {
    supabase: [],
    database: [],
    auth: [],
    ai: []
  };
  
  Object.entries(ENV_MAPPING).forEach(([targetVar, config]) => {
    if (config.category) {
      categories[config.category].push({ var: targetVar, config });
    }
  });
  
  // Generate commands for each category
  Object.entries(categories).forEach(([category, vars]) => {
    if (vars.length > 0) {
      console.log(`# ${category.toUpperCase()} VARIABLES`);
      console.log('# ================================\n');
      
      vars.forEach(({ var: targetVar, config }) => {
        console.log(`# ${config.description}`);
        if (config.source) {
          console.log(`# Source: ${config.source}`);
          console.log(`# Command: vercel env add ${targetVar} production`);
          console.log(`# When prompted, copy the value from ${config.source}`);
        } else {
          console.log(`# Command: vercel env add ${targetVar} production`);
          console.log(`# When prompted, provide the value manually`);
        }
        console.log(`# Required: ${config.required ? 'YES' : 'NO'}`);
        console.log('');
        
        commands.push({
          var: targetVar,
          source: config.source,
          description: config.description,
          required: config.required,
          category: config.category,
          transform: config.transform
        });
      });
      
      console.log('\n');
    }
  });
  
  return commands;
}

// Generate comprehensive .env.example
function generateEnvExample() {
  console.log('📝 Generating comprehensive .env.example...');
  
  let content = '# Environment Variables Example\n';
  content += '# ======================================\n';
  content += '# Copy this file to .env.local and fill in the values\n';
  content += '# These are the clean variable names that should be used in production\n\n';
  
  // Group by category
  const categories = {
    supabase: 'Supabase Configuration (REQUIRED)',
    database: 'Database Configuration (REQUIRED)',
    auth: 'Authentication (Optional)',
    ai: 'AI Services (Optional)'
  };
  
  Object.entries(categories).forEach(([category, title]) => {
    content += `# ${title}\n`;
    content += '# '.padEnd(title.length + 4, '=') + '\n\n';
    
    Object.entries(ENV_MAPPING)
      .filter(([_, config]) => config.category === category)
      .forEach(([varName, config]) => {
        content += `# ${config.description}\n`;
        if (config.source) {
          content += `# Source: ${config.source}\n`;
        }
        content += `${varName}=\n\n`;
      });
    
    content += '\n';
  });
  
  // Add platform variables
  content += '# Platform Configuration\n';
  content += '# ========================\n\n';
  content += 'NODE_ENV=development\n';
  content += 'VERCEL_ENV=development\n';
  content += 'VERCEL_URL=localhost:3000\n\n';
  
  // Add notes
  content += '# NOTES\n';
  content += '# =====\n';
  content += '# 1. For Vercel deployment, use the Vercel CLI to set environment variables\n';
  content += '# 2. The clean variable names above should be used instead of the auto-generated ones\n';
  content += '# 3. DATABASE_URL should be in postgresql:// format for Prisma compatibility\n';
  content += '# 4. AI service keys are optional but recommended for full functionality\n\n';
  
  try {
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), content);
    console.log('✅ .env.example generated successfully');
  } catch (error) {
    console.log('❌ Failed to generate .env.example:', error.message);
  }
}

// Generate migration script for Vercel CLI
function generateMigrationScript() {
  console.log('🔄 Generating Vercel migration script...');
  
  let script = '#!/bin/bash\n';
  script += '# Environment Variable Migration Script for Vercel\n';
  script += '# ================================================\n';
  script += '# This script sets up clean environment variable names\n';
  script += '# by copying values from auto-generated Supabase integration vars\n\n';
  
  script += 'echo "🚀 Starting environment variable migration..."\n';
  script += 'echo "This script will set up clean environment variable names"\n';
  script += 'echo "by copying values from auto-generated Supabase integration vars"\n\n';
  
  script += '# Check if Vercel CLI is installed\n';
  script += 'if ! command -v vercel &> /dev/null; then\n';
  script += '    echo "❌ Vercel CLI not found. Please install it first:"\n';
  script += '    echo "   npm install -g vercel"\n';
  script += '    echo "   vercel login"\n';
  script += '    exit 1\n';
  script += 'fi\n\n';
  
  script += '# Check if logged in to Vercel\n';
  script += 'if ! vercel whoami &> /dev/null; then\n';
  script += '    echo "❌ Not logged in to Vercel. Please run:"\n';
  script += '    echo "   vercel login"\n';
  script += '    exit 1\n';
  script += 'fi\n\n';
  
  script += 'echo "✅ Vercel CLI found and logged in"\n\n';
  
  // Add commands for each variable
  Object.entries(ENV_MAPPING).forEach(([targetVar, config]) => {
    if (config.source) {
      script += `echo "📝 Setting ${targetVar}..."\n`;
      script += `echo "   Source: ${config.source}"\n`;
      script += `echo "   Description: ${config.description}"\n`;
      script += `echo "   Required: ${config.required ? 'YES' : 'NO'}"\n`;
      script += `echo ""\n`;
      script += `echo "Please run the following command manually:"\n`;
      script += `echo "vercel env add ${targetVar} production"\n`;
      script += `echo ""\n`;
      script += `echo "When prompted, paste the value from: ${config.source}"\n`;
      if (config.transform) {
        script += `echo "Note: This value will be automatically transformed for compatibility"\n`;
      }
      script += `echo ""\n`;
      script += `echo "Press Enter to continue to the next variable..."\n`;
      script += `read -r\n\n`;
    }
  });
  
  script += 'echo "🎉 Migration script completed!"\n';
  script += 'echo ""\n';
  script += 'echo "📋 Summary of actions needed:"\n';
  script += 'echo "1. Run all the vercel env add commands shown above"\n';
  script += 'echo "2. Redeploy your Vercel project: vercel --prod"\n';
  script += 'echo "3. Test the application to ensure everything works"\n';
  script += 'echo ""\n';
  script += 'echo "✨ Good luck!"\n';
  
  try {
    fs.writeFileSync(path.join(process.cwd(), 'setup-vercel-env.sh'), script);
    fs.chmodSync(path.join(process.cwd(), 'setup-vercel-env.sh'), '755');
    console.log('✅ Migration script generated: setup-vercel-env.sh');
  } catch (error) {
    console.log('❌ Failed to generate migration script:', error.message);
  }
}

// Generate code update script
function generateCodeUpdateScript() {
  console.log('🔄 Generating code update script...');
  
  let script = '#!/bin/bash\n';
  script += '# Code Update Script for Environment Variable Migration\n';
  script += '# =====================================================\n';
  script += '# This script updates all references to old namespaced variables\n\n';
  
  script += 'echo "🔄 Updating code to use clean environment variable names..."\n\n';
  
  // Files to update
  const filesToUpdate = [
    'src/lib/supabase.ts',
    'src/lib/check-supabase.ts',
    'src/app/api/supabase/check/route.ts',
    'src/app/api/connection-status/route.ts',
    'src/app/api/debug/env/route.ts',
    'src/components/dashboard/history-sidebar.tsx',
    'src/components/dashboard/forms/SettingsForm.tsx'
  ];
  
  filesToUpdate.forEach(file => {
    script += `echo "📝 Updating ${file}..."\n`;
    
    // Supabase variables
    script += `sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/g' ${file}\n`;
    script += `sed -i 's/NEXT_PUBLIC_mrofgjydvwjqbnhxrits_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_SUPABASE_JWT_SECRET/SUPABASE_JWT_SECRET/g' ${file}\n`;
    
    // PostgreSQL variables
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL/POSTGRES_URL/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_URL_NON_POOLING/POSTGRES_URL_NON_POOLING/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_USER/POSTGRES_USER/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_PASSWORD/POSTGRES_PASSWORD/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_DATABASE/POSTGRES_DATABASE/g' ${file}\n`;
    script += `sed -i 's/mrofgjydvwjqbnhxrits_POSTGRES_HOST/POSTGRES_HOST/g' ${file}\n`;
    
    script += `echo "✅ ${file} updated"\n\n`;
  });
  
  script += 'echo "🎉 Code update completed!"\n';
  script += 'echo ""\n';
  script += 'echo "📋 Next steps:"\n';
  script += 'echo "1. Review the changes with: git diff"\n';
  script += 'echo "2. Test the application locally"\n';
  script += 'echo "3. Commit the changes"\n';
  script += 'echo "4. Deploy to Vercel"\n';
  
  try {
    fs.writeFileSync(path.join(process.cwd(), 'update-code-vars.sh'), script);
    fs.chmodSync(path.join(process.cwd(), 'update-code-vars.sh'), '755');
    console.log('✅ Code update script generated: update-code-vars.sh');
  } catch (error) {
    console.log('❌ Failed to generate code update script:', error.message);
  }
}

// Main execution
function main() {
  console.log('🎯 Environment Variable Management for Supabase + Prisma Stack\n');
  
  generateVercelCommands();
  generateEnvExample();
  generateMigrationScript();
  generateCodeUpdateScript();
  
  console.log('📊 Summary:');
  console.log('==========');
  console.log('✅ Generated Vercel CLI commands');
  console.log('✅ Generated .env.example file');
  console.log('✅ Generated setup-vercel-env.sh migration script');
  console.log('✅ Generated update-code-vars.sh code update script');
  
  console.log('\n🎯 Next Steps:');
  console.log('==============');
  console.log('1. Run: ./setup-vercel-env.sh to set up environment variables');
  console.log('2. Run: ./update-code-vars.sh to update code references');
  console.log('3. Test the application locally');
  console.log('4. Commit changes: git add . && git commit -m "chore: ensure full env var coverage for Supabase + Prisma + Clerk"');
  console.log('5. Deploy: git push origin master or vercel --prod');
  
  console.log('\n✨ Environment variable management setup complete!');
}

// Run the script
main();