import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SharedQuizLeaderboard } from './SharedQuizLeaderboard';
import { Play, Users } from 'lucide-react';

interface SharedQuiz {
  quiz_id: string;
  creator_name: string;
  topic: string;
  question_count: number;
  questions: any[];
  attempts: any[];
}

export const SharedQuizView: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [quiz, setQuiz] = useState<SharedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const { data, error } = await supabase.rpc('get_shared_quiz', {
          p_share_code: shareCode
        });

        if (error) throw error;
        if (!data) throw new Error('Quiz not found');

        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }

    if (shareCode) {
      loadQuiz();
    }
  }, [shareCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600">{error || 'This quiz may have expired'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bam Quiz Challenge
              </h1>
              <p className="text-gray-600">
                Created by {quiz.creator_name} • {quiz.question_count} questions about {quiz.topic}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Users className="w-5 h-5" />
              <span>{quiz.attempts.length} attempts</span>
            </div>
          </div>

          <button
            onClick={() => {/* TODO: Implement quiz start */}}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Start Quiz</span>
          </button>
        </div>

        <SharedQuizLeaderboard
          attempts={quiz.attempts}
          totalQuestions={quiz.question_count}
        />
      </div>
    </div>
  );
};
