#!/usr/bin/env node

// Simple test to debug API connection issues
async function testAPIEndpoint() {
  console.log('🧪 Testing API endpoint directly...\n');
  
  try {
    // Test the health endpoint first
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/api/agent/health');
    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health data:', healthData);
    
    // Test the company research endpoint with a simple request
    console.log('\n2. Testing company research endpoint...');
    const startTime = Date.now();
    
    const companyResponse = await fetch('http://localhost:3000/api/agent/company-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: 'SIS Limited',
        industry: 'Security Services',
        location: 'Mumbai, India'
      })
    });
    
    const endTime = Date.now();
    console.log(`Response time: ${endTime - startTime}ms`);
    console.log('Response status:', companyResponse.status);
    
    if (!companyResponse.ok) {
      const errorText = await companyResponse.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const result = await companyResponse.json();
    console.log('✅ API call successful!');
    console.log('Response structure:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : [],
    });
    
    if (result.data) {
      console.log('\n📊 Company Data:');
      console.log('Company Name:', result.data.companyName);
      console.log('Industry:', result.data.industry);
      console.log('Location:', result.data.location);
      console.log('Website:', result.data.website);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Full error:', error);
  }
}

testAPIEndpoint();