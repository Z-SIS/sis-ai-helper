#!/usr/bin/env node

/**
 * Test script to verify Vercel API functionality
 * This script tests the agent API endpoints to ensure they work properly on Vercel
 */

const API_BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Vercel API Functionality');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log('=' .repeat(60));

  // Test 1: Health Check
  console.log('\n📋 Test 1: Health Check');
  try {
    const response = await fetch(`${API_BASE_URL}/api/agent/health`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 System: ${data.system}`);
    console.log(`🔧 Version: ${data.version}`);
    console.log(`🤖 Agents Available: ${data.agents?.length || 0}`);
    console.log(`⏰ Timestamp: ${data.timestamp}`);
    
    if (data.status === 'healthy') {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  // Test 2: Company Research API
  console.log('\n🔍 Test 2: Company Research API');
  try {
    const testPayload = {
      companyName: 'G4S',
      industry: 'security',
      location: 'India'
    };

    console.log(`📤 Sending request for: ${testPayload.companyName}`);
    
    const response = await fetch(`${API_BASE_URL}/api/agent/company-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📦 Success: ${data.success}`);
    console.log(`🤖 Agent Type: ${data.meta?.agentType}`);
    console.log(`⏰ Response Time: ${data.meta?.timestamp}`);
    
    if (data.meta?.demo) {
      console.log('⚠️  Demo Response: True');
      console.log(`📝 Reason: ${data.meta?.fallback ? 'AI failed, using fallback' : 'Development mode'}`);
    } else {
      console.log('✅ Real AI Response: True');
    }
    
    if (data.data) {
      console.log(`🏢 Company: ${data.data.companyName}`);
      console.log(`🏭 Industry: ${data.data.industry}`);
      console.log(`📍 Location: ${data.data.location}`);
      console.log(`🌐 Website: ${data.data.website}`);
      console.log(`📅 Founded: ${data.data.foundedYear || 'N/A'}`);
      console.log(`👥 Employees: ${data.data.employeeCount || 'N/A'}`);
      console.log(`💰 Revenue: ${data.data.revenue || 'N/A'}`);
      console.log(`📊 Confidence: ${data.data.confidenceScore || 'N/A'}`);
      console.log(`🔍 Needs Review: ${data.data.needsReview || 'N/A'}`);
      
      if (data.data.recentNews && data.data.recentNews.length > 0) {
        console.log(`📰 Recent News: ${data.data.recentNews.length} items`);
        data.data.recentNews.forEach((news, i) => {
          console.log(`   ${i + 1}. ${news.title} (${news.date})`);
        });
      }
      
      if (data.data.competitors && data.data.competitors.length > 0) {
        console.log(`🏆 Competitors: ${data.data.competitors.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Company Research API error:', error.message);
  }

  // Test 3: Different Company
  console.log('\n🔍 Test 3: Different Company (Microsoft)');
  try {
    const testPayload = {
      companyName: 'Microsoft',
      industry: 'technology',
      location: 'Redmond, Washington'
    };

    console.log(`📤 Sending request for: ${testPayload.companyName}`);
    
    const response = await fetch(`${API_BASE_URL}/api/agent/company-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📦 Success: ${data.success}`);
    console.log(`🏢 Company: ${data.data?.companyName}`);
    console.log(`🏭 Industry: ${data.data?.industry}`);
    console.log(`📊 Demo: ${data.meta?.demo ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.log('❌ Microsoft Research API error:', error.message);
  }

  // Test 4: Test Error Handling
  console.log('\n💥 Test 4: Error Handling (Invalid Agent)');
  try {
    const response = await fetch(`${API_BASE_URL}/api/agent/invalid-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });

    const data = await response.json();
    
    console.log(`✅ Error Status: ${response.status}`);
    console.log(`📦 Error Message: ${data.error}`);
    console.log(`🔧 Available Agents: ${data.availableAgents?.join(', ') || 'N/A'}`);
    
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 API Testing Complete');
  console.log('\n📋 Summary:');
  console.log('• If responses show "Demo Response: True", API keys are not configured');
  console.log('• If responses show "Real AI Response: True", API is working correctly');
  console.log('• Check Vercel environment variables for API keys');
  console.log('• GOOGLE_GENERATIVE_AI_API_KEY should be set in Vercel');
  console.log('• TAVILY_API_KEY should be set for web search functionality');
}

// Run the tests
testAPI().catch(console.error);