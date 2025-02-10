import { Question } from '../types/quiz';

export interface APIError {
  error: string;
  details?: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: APIError;
}

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<APIResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let error: APIError = { error: `API request failed with status ${response.status}`, details: response.statusText };
    try {
      if (isJson) {
        const errorData = await response.json();
        error = {
          error: errorData.error || error.error,
          details: errorData.details || JSON.stringify(errorData)
        };
      } else {
        const text = await response.text();
        error = { error: error.error, details: text };
      }
    } catch (e) {
      console.error("Failed to parse error response", e);
    }
    console.error('API Error:', error);
    return { error };
  }

  try {
    if (isJson) {
      const data = await response.json();
      return { data };
    }
    const text = await response.text();
    return { data: text as unknown as T };
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return {
      error: {
        error: 'Failed to parse response',
        details: e instanceof Error ? e.message : 'Unknown error'
      }
    };
  }
}

export async function generateQuestion(
  topic: string,
  previousQuestions: string[] = []
): Promise<APIResponse<Question>> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        topic,
        previousQuestions,
        systemPrompt: 'You are a JSON API that generates history quiz questions.',
        userPrompt: `Generate a history quiz question about ${topic}.`
      })
    });
    return await handleResponse(response);
  } catch (e) {
    console.error("API call failed", e);
    return {
      error: {
        error: 'Failed to generate question',
        details: e instanceof Error ? e.message : 'Unknown error occurred'
      }
    };
  }
}
