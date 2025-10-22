#!/usr/bin/env node

// Test script to verify ZAI SDK functionality
async function testZAI() {
  console.log('🧪 Testing ZAI SDK...\n');
  
  try {
    // Try to import ZAI SDK
    console.log('1. Importing ZAI SDK...');
    const ZAI = await import('z-ai-web-dev-sdk');
    console.log('✅ ZAI SDK imported successfully');
    
    // Try to create ZAI instance
    console.log('\n2. Creating ZAI instance...');
    const zai = await ZAI.default.create();
    console.log('✅ ZAI instance created successfully');
    
    // Try to generate a simple completion
    console.log('\n3. Testing chat completion...');
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Hello, can you tell me what 2+2 equals?'
        }
      ]
    });
    
    console.log('✅ Chat completion successful');
    console.log('Response:', completion.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('❌ ZAI SDK test failed:', error.message);
    console.error('Full error:', error);
  }
}

testZAI();