import React from 'react';
import { Trophy, Medal, Clock } from 'lucide-react';

interface Attempt {
  player_name: string;
  score: number;
  completed_at: string;
}

interface SharedQuizLeaderboardProps {
  attempts: Attempt[];
  totalQuestions: number;
}

export const SharedQuizLeaderboard: React.FC<SharedQuizLeaderboardProps> = ({ attempts, totalQuestions }) => {
  const sortedAttempts = [...attempts].sort((a, b) => b.score - a.score);
  const topScore = sortedAttempts[0]?.score || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
        </div>
        <div className="text-sm text-gray-500">
          {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'}
        </div>
      </div>

      {attempts.length > 0 ? (
        <div className="space-y-4">
          {sortedAttempts.map((attempt, index) => (
            <div
              key={`${attempt.player_name}-${attempt.completed_at}`}
              className={`flex items-center justify-between p-4 rounded-lg ${
                attempt.score === topScore
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 text-center">
                  {index === 0 ? (
                    <Medal className="w-6 h-6 text-yellow-500 mx-auto" />
                  ) : index === 1 ? (
                    <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                  ) : index === 2 ? (
                    <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                  ) : (
                    <span className="text-gray-500 font-medium">{index + 1}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{attempt.player_name}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(attempt.completed_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {attempt.score}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round((attempt.score / totalQuestions) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Be the first to take this quiz!</p>
          <p className="text-sm">Set the score to beat</p>
        </div>
      )}
    </div>
  );
};
