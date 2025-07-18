import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    console.log('API Key exists:', !!process.env.GROQ_API_KEY);
    console.log('API Key starts with gsk_:', process.env.GROQ_API_KEY?.startsWith('gsk_'));
    console.log('API Key length:', process.env.GROQ_API_KEY?.length);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say hello",
        },
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 10
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', completion.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ FAILED:');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
  }
}

main();