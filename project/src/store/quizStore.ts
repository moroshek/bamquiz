import { create } from 'zustand';

interface QuizState {
  currentQuestion: Question | null;
  nextQuestion: Question | null;
  answeredCount: number;
  previousQuestions: string[];
  isLoggedIn: boolean;
  currentTopic: string;
  sessionId: string;
  questionCount: number;
  showAuth: boolean;
  setQuestion: (question: Question) => void;
  setNextQuestion: (question: Question) => void;
  incrementAnswered: () => void;
  setLoggedIn: (status: boolean) => void;
  setTopic: (topic: string) => void;
  setShowAuth: (show: boolean) => void;
  addPreviousQuestion: (question: string) => void;
  clearPreviousQuestions: () => void;
  moveToNextQuestion: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  funFact: string;
  learnMore: string;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuestion: null,
  nextQuestion: null,
  answeredCount: 0,
  previousQuestions: [],
  isLoggedIn: false,
  sessionId: crypto.randomUUID(),
  showAuth: false,
  questionCount: 0,
  currentTopic: 'general history',
  setQuestion: (question) => set({ currentQuestion: question }),
  setNextQuestion: (question) => set({ nextQuestion: question }),
  incrementAnswered: () => set((state) => ({ answeredCount: state.answeredCount + 1 })),
  setLoggedIn: (status) => set({ isLoggedIn: status }),
  setTopic: (topic) => set({ 
    currentTopic: topic,
    questionCount: 0,
    previousQuestions: []
  }),
  setShowAuth: (show) => set({ showAuth: show }),
  addPreviousQuestion: (question) => 
    set((state) => ({ 
      previousQuestions: [...state.previousQuestions, question],
      questionCount: state.questionCount + 1
    })),
  clearPreviousQuestions: () => 
    set({ 
      previousQuestions: [],
      questionCount: 0
    }),
  moveToNextQuestion: () => set((state) => ({
    currentQuestion: state.nextQuestion,
    nextQuestion: null
  }))
}));
