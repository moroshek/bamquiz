import React from 'react';
import { useQuizStore } from '../store/quizStore';
import { Trophy } from 'lucide-react';

export const ProgressBar = () => {
  const answeredCount = useQuizStore((state) => state.answeredCount);
  const isLoggedIn = useQuizStore((state) => state.isLoggedIn);
  const maxQuestions = isLoggedIn ? Infinity : 15;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">
          Questions Answered: {answeredCount}
          </span>
        </div>
        {!isLoggedIn && (
          <button
            onClick={() => useQuizStore.getState().setShowAuth(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in to unlock unlimited questions!
          </button>
        )}
      </div>
      {!isLoggedIn && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${(answeredCount / 15) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
