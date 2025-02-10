import React, { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import { generateQuestion as generateQuestionFromApi } from '../lib/api';

const TopicChat = () => {
  const [input, setInput] = useState('');
  const { setTopic, setQuestion, setIsLoading } = useQuizStore();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const topic = input.trim();
      if (!topic) return;

      setIsLoading(true);
      setTopic(topic);

      try {
        const questionResponse = await generateQuestionFromApi(topic);
        if (questionResponse.data) {
          setQuestion(questionResponse.data);
        } else if (questionResponse.error) {
          throw new Error(questionResponse.error.error);
        }
        setInput('');
      } catch (error) {
        console.error('Failed to generate question:', error);
        alert(error instanceof Error ? error.message : 'Failed to generate question. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
    [input, setTopic, setQuestion, setIsLoading]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-200">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a history topic (e.g., 'Ancient Rome')"
          className="w-full px-4 py-3 pr-12 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transform hover:scale-110 transition-transform"
        >
          {setIsLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} className="animate-pulse" />
          )}
        </button>
      </div>
    </form>
  );
};

export default TopicChat;
export { TopicChat }
