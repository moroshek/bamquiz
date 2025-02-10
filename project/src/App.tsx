import React from 'react';
import QuizCard from './components/QuizCard';
import TopicChat from './components/TopicChat';
import { ProgressBar } from './components/ProgressBar';
import { RandomQuestion } from './components/RandomQuestion';
import Auth from './components/Auth';
import { useQuizStore } from './store/quizStore';
import { Brain, LogIn, Sparkles } from 'lucide-react';

function App() {
  const isLoggedIn = useQuizStore((state) => state.isLoggedIn);
  const showAuth = useQuizStore((state) => state.showAuth);
  const setShowAuth = useQuizStore((state) => state.setShowAuth);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Bam Quiz
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600">
                Lifetime Questions: {useQuizStore((state) => state.answeredCount)}
              </span>
              {!isLoggedIn && (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          {showAuth ? (
            <Auth />
          ) : (
            <>
              <div className="w-full space-y-4 sm:space-y-6">
                <TopicChat />
                <RandomQuestion />
              </div>
              <QuizCard />
              <ProgressBar />
            </>
          )}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </div>
  );
}

export default App;
