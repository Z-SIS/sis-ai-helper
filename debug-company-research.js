#!/usr/bin/env node

// Debug script to test company research specifically
async function testCompanyResearch() {
  console.log('🧪 Testing Company Research Agent...\n');
  
  try {
    // Import the agent system
    const { optimizedAgentSystem } = await import('./src/lib/ai/agent-system.ts');
    
    const testInput = {
      companyName: 'Apple Inc.',
      industry: 'Technology',
      location: 'Cupertino, CA'
    };
    
    console.log('Input:', testInput);
    console.log('\n1. Testing company research...');
    
    const result = await optimizedAgentSystem.executeAgentRequest('company-research', testInput);
    
    console.log('\n✅ Company research completed!');
    console.log('Result keys:', Object.keys(result));
    console.log('Company name:', result.companyName);
    console.log('Description:', result.description?.substring(0, 100) + '...');
    console.log('Warnings:', result.warnings);
    
    if (result.warnings && result.warnings.includes('This is a demo response while AI services are initializing')) {
      console.log('\n❌ Still getting demo response - ZAI SDK is not being used properly');
    } else {
      console.log('\n✅ Real AI response received!');
    }
    
  } catch (error) {
    console.error('❌ Company research test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCompanyResearch();