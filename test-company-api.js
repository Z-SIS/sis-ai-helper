#!/usr/bin/env node

// Test script to verify company research functionality
async function testCompanyResearch() {
  console.log('🧪 Testing Company Research Agent...\n');
  
  try {
    // Test the API directly
    const response = await fetch('http://localhost:3000/api/agent/company-research', {
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
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Company research API call successful!');
    console.log('Response structure:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : [],
      meta: result.meta
    });
    
    if (result.data) {
      console.log('\n📊 Company Research Results:');
      console.log('Company Name:', result.data.companyName);
      console.log('Industry:', result.data.industry);
      console.log('Location:', result.data.location);
      console.log('Website:', result.data.website);
      console.log('Founded:', result.data.foundedYear);
      console.log('Employees:', result.data.employeeCount?.count || result.data.employeeCount);
      console.log('Revenue:', result.data.revenue?.amount || result.data.revenue);
      console.log('Description:', result.data.description?.substring(0, 150) + '...');
      console.log('Key Executives:', result.data.keyExecutives?.length || 0);
      console.log('Competitors:', result.data.competitors?.length || 0);
      console.log('Recent News:', result.data.recentNews?.length || 0);
      console.log('Confidence Score:', result.data.confidenceScore);
      console.log('Last Updated:', result.data.lastUpdated);
    }
    
  } catch (error) {
    console.error('❌ Company research test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCompanyResearch();