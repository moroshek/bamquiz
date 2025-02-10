import OpenAI from 'openai';

// Get environment variables with fallbacks to VITE_ prefixed versions for development
export async function handler(event) {
  const envVars = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SITE_URL: process.env.SITE_URL || 'https://bamquiz.com',
    SITE_NAME: process.env.SITE_NAME || 'bamquiz'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!envVars.OPENROUTER_API_KEY || !envVars.OPENROUTER_API_KEY.trim()) {
      throw new Error('OpenRouter API key is not configured');
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: envVars.OPENROUTER_API_KEY.trim(),
      headers: {
        "HTTP-Referer": envVars.SITE_URL,
        "X-Title": envVars.SITE_NAME
      },
      defaultHeaders: {
        "HTTP-Referer": envVars.SITE_URL,
        "X-Title": envVars.SITE_NAME
      }
    });

    // Use a simple connection test with the free model
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: 'system', content: 'You are a connection test assistant. Respond with exactly: Connection successful!' },
        { role: 'user', content: 'Test the connection' }
      ],
      max_tokens: 10,
      temperature: 0.3,
      top_p: 0.9
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || !content.includes('Connection successful')) {
      throw new Error('Unexpected response from AI service');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ success: true, message: content })
    };
  } catch (error) {
    console.error('OpenRouter connection test failed:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Connection test failed'
      })
    };
  }
}
