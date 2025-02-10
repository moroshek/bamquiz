import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, ArrowRight, Share2, Users } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import { supabase } from '../lib/supabase';
import { ShareQuiz } from './ShareQuiz';

const QuizCard = () => {
  const currentQuestion = useQuizStore((state) => state.currentQuestion);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const currentTopic = useQuizStore((state) => state.currentTopic);
  const questionCount = useQuizStore((state) => state.questionCount);
  const isLoggedIn = useQuizStore((state) => state.isLoggedIn);
  const setShowAuth = useQuizStore((state) => state.setShowAuth);

  const {
    incrementAnswered,
    setQuestion,
    setNextQuestion,
    moveToNextQuestion,
    addPreviousQuestion,
    clearPreviousQuestions
  } = useQuizStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<'up' | 'down' | null>(null);
  const [showShareQuiz, setShowShareQuiz] = useState(false);

  const prefetchNextQuestion = useCallback(async () => {
    if (!nextQuestion && !loading && currentQuestion) {
      try {
        setLoading(true);
        // const next = await generateQuestion(currentTopic, [currentQuestion.question]);
        // setNextQuestion(next);
      } catch (error) {
        console.error('Failed to prefetch next question:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [currentQuestion, nextQuestion, loading, setNextQuestion, currentTopic]);

  useEffect(() => {
    prefetchNextQuestion();
  }, [prefetchNextQuestion]);

  useEffect(() => {
    clearPreviousQuestions();
  }, [currentTopic, clearPreviousQuestions]);

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    setShowExplanation(true);
    incrementAnswered();
  };

  const handleShareClick = () => {
    if (!isLoggedIn) {
      alert('Sign in to share quizzes with friends!');
      setShowAuth(true);
      return;
    }
    setShowShareQuiz(true);
  };

  const handleRating = async (isPositive: boolean) => {
    setRatingSubmitted(isPositive ? 'up' : 'down');
  };

  const handleNextQuestion = async () => {
    setLoading(true);
    try {
      if (currentQuestion) {
        addPreviousQuestion(currentQuestion.question);

        if (questionCount >= 5) {
          alert('You might want to try a different topic to get more diverse questions!');
          return;
        }

        moveToNextQuestion();
        setSelectedAnswer(null);
        setShowExplanation(false);
        setRatingSubmitted(null);
      }
    } catch (error) {
      console.error('Failed to move to next question:', error);
      alert('Failed to load the next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-2xl w-full transform hover:scale-[1.01] transition-transform duration-200" key={currentQuestion.question}>
      <div className="relative">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 pr-8">{currentQuestion.question}</h2>
        <div className="absolute top-0 right-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-sm font-medium">{questionCount + 1}</span>
        </div>
      </div>

      <div className="space-y-3">
        {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={showExplanation}
            className={`w-full p-3 sm:p-4 text-left rounded-lg transition-all transform hover:translate-x-1 ${
              selectedAnswer === option
                ? option === currentQuestion.correctAnswer
                  ? 'bg-green-100 border-green-500 shadow-green-100'
                  : 'bg-red-100 border-red-500 shadow-red-100'
                : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
            } border-2 ${
              showExplanation ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className="mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg shadow-inner">
            <h3 className="font-semibold text-blue-900">Explanation:</h3>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
            {currentQuestion?.funFact && (
              <div className="mt-4 border-t border-blue-200/50 pt-4">
                <h4 className="font-semibold text-blue-900">Fun Fact:</h4>
                <p className="text-blue-800">{currentQuestion.funFact}</p>
              </div>
            )}
            {currentQuestion?.learnMore && (
              <div className="mt-4 border-t border-blue-200/50 pt-4">
                <h4 className="font-semibold text-blue-900">Want to Learn More?</h4>
                <p className="text-blue-800">Research: {currentQuestion.learnMore}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleRating(true)}
                disabled={ratingSubmitted !== null}
                className={`p-2 rounded-full hover:bg-green-50 transform hover:scale-110 transition-transform ${
                  ratingSubmitted === 'up' ? 'text-green-600 bg-green-50' : 'text-green-500'
                }`}
              >
                <ThumbsUp size={20} className="animate-bounce" />
              </button>
              <button
                onClick={() => handleRating(false)}
                disabled={ratingSubmitted !== null}
                className={`p-2 rounded-full hover:bg-red-50 transform hover:scale-110 transition-transform ${
                  ratingSubmitted === 'down' ? 'text-red-600 bg-red-50' : 'text-red-500'
                }`}
              >
                <ThumbsDown size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={handleShareClick}
                  className="p-2 rounded-full hover:bg-blue-50 transform hover:scale-110 transition-transform text-blue-500"
                >
                  <Share2 size={20} className="animate-pulse" />
                </button>
              </div>
            </div>
            {showExplanation && (
              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
              >
                <span>Next Question</span>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={20} className="animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>
      )}
      {showShareQuiz && (
        <ShareQuiz
          onClose={() => setShowShareQuiz(false)}
          topic={currentTopic}
        />
      )}
    </div>
  );
};

export default QuizCard;

export { QuizCard }
