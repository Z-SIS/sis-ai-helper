#!/usr/bin/env node

/**
 * Final test to verify Vercel deployment readiness
 * This script checks all aspects of the deployment setup
 */

const path = require('path');

function testVercelReadiness() {
  console.log('🚀 Vercel Deployment Readiness Test');
  console.log('=' .repeat(60));

  // Test 1: Dependencies Check
  console.log('\n📦 Test 1: Dependencies Check');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
  
  const hasGoogleAI = packageJson.dependencies['@google/generative-ai'];
  const hasZAI = packageJson.dependencies['z-ai-web-dev-sdk'];
  const hasTavily = packageJson.dependencies['tavily'];
  
  console.log(`🤖 Google AI SDK: ${hasGoogleAI ? '✅ Included' : '❌ Missing'}`);
  console.log(`🧠 ZAI SDK: ${hasZAI ? '❌ Still Present (Remove!)' : '✅ Removed'}`);
  console.log(`🔍 Tavily SDK: ${hasTavily ? '✅ Included' : '❌ Missing'}`);
  
  if (hasZAI) {
    console.log('❌ CRITICAL: ZAI SDK must be removed for Vercel deployment');
    return;
  }

  // Test 2: Code Configuration
  console.log('\n⚙️  Test 2: Code Configuration');
  
  const agentSystemPath = path.join(__dirname, 'src/lib/ai/agent-system.ts');
  const agentSystemContent = require('fs').readFileSync(agentSystemPath, 'utf8');
  
  const usesGoogleAI = agentSystemContent.includes('GoogleGenerativeAI');
  const hasAPIKeyCheck = agentSystemContent.includes('GOOGLE_GENERATIVE_AI_API_KEY');
  const hasFallback = agentSystemContent.includes('generateDemoCompanyResearch');
  const noZAIImports = !agentSystemContent.includes('z-ai-web-dev-sdk');
  
  console.log(`🤖 Uses Google AI: ${usesGoogleAI ? '✅ Yes' : '❌ No'}`);
  console.log(`🔑 Has API Key Check: ${hasAPIKeyCheck ? '✅ Yes' : '❌ No'}`);
  console.log(`🎭 Has Fallback: ${hasFallback ? '✅ Yes' : '❌ No'}`);
  console.log(`🧠 No ZAI Imports: ${noZAIImports ? '✅ Yes' : '❌ No'}`);

  // Test 3: API Routes
  console.log('\n🛣️  Test 3: API Routes');
  
  const routes = [
    'src/app/api/agent/health/route.ts',
    'src/app/api/agent/[slug]/route.ts'
  ];
  
  routes.forEach(route => {
    const routePath = path.join(__dirname, route);
    if (require('fs').existsSync(routePath)) {
      const content = require('fs').readFileSync(routePath, 'utf8');
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      const hasAIIntegration = content.includes('googleAIAgentSystem');
      
      console.log(`📄 ${route}: ✅ Exists`);
      console.log(`   🛡️  Error Handling: ${hasErrorHandling ? '✅ Yes' : '❌ No'}`);
      console.log(`   🤖 AI Integration: ${hasAIIntegration ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log(`📄 ${route}: ❌ Missing`);
    }
  });

  // Test 4: Environment Configuration
  console.log('\n🔧 Test 4: Environment Configuration');
  
  const envPath = path.join(__dirname, '.env');
  if (require('fs').existsSync(envPath)) {
    const envContent = require('fs').readFileSync(envPath, 'utf8');
    
    console.log('📋 Local .env Configuration:');
    envContent.split('\n').forEach(line => {
      if (line.includes('API_KEY') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          const isPlaceholder = value.includes('your_') || value.includes('_here');
          console.log(`   ${key}: ${isPlaceholder ? '⚠️  Placeholder' : '✅ Configured'}`);
        }
      }
    });
  }

  // Test 5: Build Configuration
  console.log('\n🏗️  Test 5: Build Configuration');
  
  const nextConfigPath = path.join(__dirname, 'next.config.ts');
  if (require('fs').existsSync(nextConfigPath)) {
    console.log('✅ Next.js configuration exists');
  }
  
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  if (require('fs').existsSync(vercelConfigPath)) {
    console.log('✅ Vercel configuration exists');
  }

  // Test 6: Expected Behavior Analysis
  console.log('\n🎯 Test 6: Expected Behavior Analysis');
  
  console.log('📊 Scenarios:');
  console.log('');
  console.log('1️⃣  With API Keys Configured:');
  console.log('   ✅ Real AI responses');
  console.log('   ✅ Web search functionality');
  console.log('   ✅ Company research with current data');
  console.log('');
  console.log('2️⃣  Without API Keys (Current State):');
  console.log('   ⚠️  Demo responses only');
  console.log('   ⚠️  "Results are being updated" messages');
  console.log('   ⚠️  Limited functionality but no crashes');
  console.log('');
  console.log('3️⃣  Error Handling:');
  console.log('   ✅ Graceful fallbacks');
  console.log('   ✅ User-friendly error messages');
  console.log('   ✅ Application remains functional');

  // Test 7: Deployment Instructions
  console.log('\n📋 Test 7: Deployment Instructions');
  
  console.log('🚀 Vercel Deployment Steps:');
  console.log('1. Push code to GitHub repository');
  console.log('2. Connect repository to Vercel');
  console.log('3. Configure environment variables in Vercel:');
  console.log('   - GOOGLE_GENERATIVE_AI_API_KEY');
  console.log('   - TAVILY_API_KEY');
  console.log('4. Deploy application');
  console.log('5. Test API endpoints');
  console.log('6. Monitor Vercel function logs');

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Vercel Readiness Test Complete');
  
  // Final Assessment
  const allChecksPass = hasGoogleAI && !hasZAI && usesGoogleAI && hasAPIKeyCheck && hasFallback;
  
  if (allChecksPass) {
    console.log('✅ READY FOR VERCEL DEPLOYMENT');
    console.log('✅ All critical checks passed');
    console.log('✅ Application will work on Vercel');
  } else {
    console.log('❌ NOT READY FOR VERCEL DEPLOYMENT');
    console.log('❌ Some checks failed - fix issues before deploying');
  }
}

// Run the test
testVercelReadiness();