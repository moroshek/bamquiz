import React, { useState } from 'react';
import { Share2, Trophy, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShareQuizProps {
  onClose: () => void;
  topic: string;
}

export const ShareQuiz: React.FC<ShareQuizProps> = ({ onClose, topic }) => {
  const [loading, setLoading] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('create_shared_quiz', {
          p_question_count: questionCount,
          p_topic: topic
        });

      if (error) throw error;
      setShareCode(data);

      // Copy to clipboard
      const shareUrl = `${window.location.origin}/quiz/${data}`;
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error('Error sharing quiz:', error);
      alert('Failed to share quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-blue-600" />
            Share Your Quiz
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {!shareCode ? (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                Challenge Your Friends!
              </h4>
              <p className="text-blue-800 text-sm">
                Share your last {questionCount} questions about {topic} and see who can beat your score!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={10}>Last 10 Questions</option>
                  <option value={15}>Last 15 Questions</option>
                  <option value={20}>Last 20 Questions</option>
                </select>
              </div>

              <button
                onClick={handleShare}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>Share with Friends</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-green-900 mb-2">Quiz Shared!</h4>
              <p className="text-green-800">Share Code: {shareCode}</p>
              <p className="text-sm text-green-700 mt-2">
                Link copied to clipboard
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
