#!/usr/bin/env node

/**
 * Test script to verify local development setup
 * This script checks if the environment is properly configured
 */

const fs = require('fs');
const path = require('path');

function testLocalSetup() {
  console.log('🧪 Testing Local Development Setup');
  console.log('=' .repeat(60));

  // Test 1: Environment Variables
  console.log('\n🔧 Test 1: Environment Variables');
  
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasGoogleAI = envContent.includes('GOOGLE_GENERATIVE_AI_API_KEY=');
    const hasTavily = envContent.includes('TAVILY_API_KEY=');
    const hasZAI = envContent.includes('ZAI_API_KEY=');
    
    console.log(`🤖 Google AI API Key: ${hasGoogleAI ? '✅ Present' : '❌ Missing'}`);
    console.log(`🔍 Tavily API Key: ${hasTavily ? '✅ Present' : '❌ Missing'}`);
    console.log(`🧠 ZAI API Key: ${hasZAI ? '✅ Present' : '❌ Missing'}`);
    
    if (hasGoogleAI && envContent.includes('your_google_gemini_api_key_here')) {
      console.log('⚠️  Google AI API key is placeholder - needs real key');
    }
    
    if (hasTavily && envContent.includes('your_tavily_api_key_here')) {
      console.log('⚠️  Tavily API key is placeholder - needs real key');
    }
  } else {
    console.log('❌ .env file does not exist');
  }

  // Test 2: Package Dependencies
  console.log('\n📦 Test 2: Package Dependencies');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const hasGoogleAI = packageJson.dependencies['@google/generative-ai'];
    const hasZAI = packageJson.dependencies['z-ai-web-dev-sdk'];
    const hasTavily = packageJson.dependencies['tavily'];
    
    console.log(`🤖 Google AI SDK: ${hasGoogleAI ? '✅ Installed' : '❌ Missing'}`);
    console.log(`🧠 ZAI SDK: ${hasZAI ? '✅ Installed' : '❌ Missing'}`);
    console.log(`🔍 Tavily SDK: ${hasTavily ? '✅ Installed' : '❌ Missing'}`);
  } else {
    console.log('❌ package.json not found');
  }

  // Test 3: Agent System Configuration
  console.log('\n⚙️  Test 3: Agent System Configuration');
  
  const agentSystemPath = path.join(__dirname, 'src/lib/ai/agent-system.ts');
  if (fs.existsSync(agentSystemPath)) {
    const agentSystemContent = fs.readFileSync(agentSystemPath, 'utf8');
    
    const usesGoogleAI = agentSystemContent.includes('GoogleGenerativeAI');
    const usesZAI = agentSystemContent.includes('z-ai-web-dev-sdk');
    const hasAPIKeyCheck = agentSystemContent.includes('GOOGLE_GENERATIVE_AI_API_KEY');
    
    console.log(`🤖 Uses Google AI: ${usesGoogleAI ? '✅ Yes' : '❌ No'}`);
    console.log(`🧠 Uses ZAI SDK: ${usesZAI ? '⚠️  Yes (should be removed for Vercel)' : '✅ No'}`);
    console.log(`🔑 Has API Key Check: ${hasAPIKeyCheck ? '✅ Yes' : '❌ No'}`);
    
    if (usesZAI) {
      console.log('⚠️  Warning: ZAI SDK detected - this will not work on Vercel');
    }
  } else {
    console.log('❌ Agent system file not found');
  }

  // Test 4: API Routes
  console.log('\n🛣️  Test 4: API Routes');
  
  const apiRoutes = [
    'src/app/api/agent/health/route.ts',
    'src/app/api/agent/[slug]/route.ts'
  ];
  
  apiRoutes.forEach(route => {
    const routePath = path.join(__dirname, route);
    if (fs.existsSync(routePath)) {
      console.log(`✅ ${route}: Exists`);
    } else {
      console.log(`❌ ${route}: Missing`);
    }
  });

  // Test 5: Build Configuration
  console.log('\n🏗️  Test 5: Build Configuration');
  
  const nextConfigPath = path.join(__dirname, 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    console.log('✅ Next.js config exists');
    
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    const hasVercelConfig = nextConfig.includes('vercel') || nextConfig.includes('output');
    
    console.log(`🚀 Vercel Optimization: ${hasVercelConfig ? '✅ Configured' : '⚠️  Not configured'}`);
  } else {
    console.log('❌ Next.js config missing');
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Local Setup Test Complete');
  console.log('\n📋 Vercel Deployment Checklist:');
  console.log('□ Set GOOGLE_GENERATIVE_AI_API_KEY in Vercel environment variables');
  console.log('□ Set TAVILY_API_KEY in Vercel environment variables');
  console.log('□ Remove ZAI SDK dependencies for production');
  console.log('□ Test API endpoints after deployment');
  console.log('□ Monitor Vercel function logs for errors');
}

// Run the tests
testLocalSetup();