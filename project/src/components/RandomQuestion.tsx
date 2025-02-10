import React, { useState, useCallback } from 'react';
import { useQuizStore } from '../store/quizStore';
import { generateQuestion } from '../lib/ai';

export const MAX_RETRIES = 3;
export const TOPICS = [
  'Ancient Civilizations',
  'Renaissance Art',
  'Age of Exploration',
  'Industrial Revolution',
  'Scientific Discoveries',
  'Cultural Exchange',
  'Maritime History',
  'Ancient Trade Routes',
  'Historical Inventions',
  'Medieval Life',
  'Ancient Architecture',
  'Historical Figures'
];

export const RandomQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setQuestion, setNextQuestion, setTopic, currentQuestion } = useQuizStore();

  const handleRandomQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      setTopic(randomTopic);

      const question = await generateQuestion(randomTopic);
      setQuestion(question);

      const nextQuestion = await generateQuestion(randomTopic);
      setNextQuestion(nextQuestion);
    } catch (error: any) {
      console.error('Failed to generate random question:', error);
      setError(`Unable to load a question. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [setQuestion, setNextQuestion, setTopic]);

  React.useEffect(() => {
    if (!currentQuestion) {
      handleRandomQuestion();
    }
  }, [currentQuestion, handleRandomQuestion]);

  if (currentQuestion) return null;

  return (
    <div className="w-full max-w-2xl bg-blue-50 rounded-lg p-6 mt-6 relative">
      {loading ? (
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={handleRandomQuestion}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      ) : null}
    </div>
  );
};
