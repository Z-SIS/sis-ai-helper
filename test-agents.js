#!/usr/bin/env node

// Test script to verify all AI agent endpoints work without console errors
const http = require('http');

const testData = {
  'company-research': {
    companyName: 'Test Company',
    industry: 'Technology',
    location: 'USA'
  },
  'generate-sop': {
    processName: 'Test Process',
    department: 'IT',
    purpose: 'To test the system',
    scope: 'Testing only'
  },
  'compose-email': {
    recipient: 'test@example.com',
    subject: 'Test Email',
    tone: 'professional',
    purpose: 'Testing',
    keyPoints: ['Test point 1', 'Test point 2'],
    callToAction: 'Please test'
  },
  'excel-helper': {
    question: 'How do I sum cells in Excel?',
    context: 'Basic Excel task',
    excelVersion: '365'
  },
  'feasibility-check': {
    projectName: 'Test Project',
    description: 'A test project for verification',
    budget: '$1000',
    timeline: '1 week',
    resources: ['Developer', 'Designer'],
    constraints: ['Time limit']
  },
  'deployment-plan': {
    projectName: 'Test Deployment',
    projectType: 'Web Application',
    environment: 'production',
    teamSize: 3,
    timeline: '2 days'
  },
  'usps-battlecard': {
    companyName: 'Our Company',
    competitor: 'Competitor Corp',
    productCategory: 'Software',
    targetMarket: 'Enterprise'
  },
  'disbandment-plan': {
    projectName: 'Test Project',
    reason: 'Project completion',
    timeline: '1 week',
    stakeholders: ['Team', 'Management']
  },
  'slide-template': {
    topic: 'Test Presentation',
    audience: 'Technical Team',
    purpose: 'informative',
    slideCount: 5,
    keyPoints: ['Point 1', 'Point 2', 'Point 3']
  }
};

function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/agent/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing all AI Agent endpoints...\n');
  
  const results = {};
  
  for (const [endpoint, data] of Object.entries(testData)) {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await makeRequest(endpoint, data);
      
      if (result.status === 200 && result.data.success) {
        console.log(`✅ ${endpoint}: SUCCESS`);
        results[endpoint] = 'PASS';
      } else {
        console.log(`❌ ${endpoint}: FAILED - Status: ${result.status}`);
        console.log(`   Response:`, result.data);
        results[endpoint] = 'FAIL';
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
      results[endpoint] = 'ERROR';
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = Object.values(results).filter(r => r === 'PASS').length;
  const failed = Object.values(results).filter(r => r === 'FAIL').length;
  const errors = Object.values(results).filter(r => r === 'ERROR').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`💥 Errors: ${errors}`);
  console.log(`📈 Success Rate: ${((passed / 9) * 100).toFixed(1)}%`);
  
  if (passed === 9) {
    console.log('\n🎉 All tests passed! The system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Check if server is running
console.log('🔍 Checking if development server is running...');
http.get('http://localhost:3000', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Development server is running\n');
    runTests().catch(console.error);
  } else {
    console.log('❌ Development server returned unexpected status:', res.statusCode);
  }
}).on('error', () => {
  console.log('❌ Development server is not running on localhost:3000');
  console.log('Please start the server with: npm run dev');
});