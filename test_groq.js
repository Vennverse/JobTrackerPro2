import { Groq } from 'groq-sdk';

async function testGroqAPI() {
  console.log('Testing GROQ API...');
  
  const apiKey = process.env.GROQ_API_KEY;
  console.log('API Key exists:', !!apiKey);
  console.log('API Key starts with gsk_:', apiKey?.startsWith('gsk_'));
  console.log('API Key length:', apiKey?.length);
  console.log('First 15 chars:', apiKey?.substring(0, 15));
  
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not found');
    return;
  }
  
  try {
    const client = new Groq({
      apiKey: apiKey,
    });
    
    console.log('✅ Groq client created successfully');
    
    // Test with a simple request
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say hello"
        }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 10
    });
    
    console.log('✅ API call successful!');
    console.log('Response:', completion.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Error message:', error.message);
    console.error('Status code:', error.status);
    console.error('Error details:', error.error);
  }
}

testGroqAPI();