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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
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

    const { topic } = JSON.parse(event.body || '{}');

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

    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: 'system', content: 'You are a JSON API that generates history quiz questions.' },
        { role: 'user', content: `Generate a history quiz question about ${topic}.` }
      ],
      temperature: 0.3,
      max_tokens: 500,
      top_p: 0.9
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response');
    }

    const rawContent = response.choices[0].message.content;
    let parsedQuestion;
    try {
      parsedQuestion = JSON.parse(rawContent);
    } catch (err) {
      console.error('JSON parse error:', err);
      throw new Error('Invalid JSON response from AI');
    }

    const sanitizedQuestion = {
      question: parsedQuestion.question.trim(),
      options: parsedQuestion.options.map(opt => opt.trim()),
      correctAnswer: parsedQuestion.correctAnswer.trim(),
      explanation: parsedQuestion.explanation.trim(),
      ...(parsedQuestion.funFact && { funFact: parsedQuestion.funFact.trim() }),
      ...(parsedQuestion.learnMore && { learnMore: parsedQuestion.learnMore.trim() })
    };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedQuestion)
    };
  } catch (error) {
    console.error('Question generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to generate question',
        details: error.message
      })
    };
  }
}
