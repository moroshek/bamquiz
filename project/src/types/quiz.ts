export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  funFact?: string;
  learnMore?: string;
}

export interface QuestionHistory {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  wasCorrect: boolean;
  topic: string;
  answeredAt: string;
}
