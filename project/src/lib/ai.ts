// src/lib/ai.ts
import type { Question } from '../types/quiz';

export async function generateQuestion(topic: string): Promise<Question> {
  try {
    const response = await fetch('/api/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const message = `Failed to generate question: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error generating question:', error);
    throw new Error(`Failed to generate question: ${error.message}`);
  }
}
