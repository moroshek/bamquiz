import type { Question } from '../types/quiz';

const questions: Question[] = [
  {
    question: "Which ancient civilization built the Great Pyramid of Giza?",
    options: ["Ancient Egyptians", "Mesopotamians", "Greeks", "Romans"],
    correctAnswer: "Ancient Egyptians",
    explanation: "The Great Pyramid of Giza was built by the Ancient Egyptians during the Old Kingdom period, around 2560 BCE, during the reign of Pharaoh Khufu.",
    funFact: "The Great Pyramid was the tallest man-made structure in the world for over 3,800 years until the completion of Lincoln Cathedral in England in 1311 CE.",
    learnMore: "Research the ancient Egyptian pyramid-building techniques and the role of pyramids in ancient Egyptian culture."
  },
  {
    question: "Who was the first Emperor of Rome?",
    options: ["Julius Caesar", "Augustus", "Nero", "Marcus Aurelius"],
    correctAnswer: "Augustus",
    explanation: "Augustus, born Octavian, became the first Roman Emperor after defeating Mark Antony and Cleopatra. He established the Roman Empire in 27 BCE.",
    funFact: "Augustus' reign marked the beginning of the Pax Romana, a period of relative peace that lasted about 200 years.",
    learnMore: "Study the transition from Roman Republic to Empire and Augustus' political reforms."
  },
  {
    question: "Which civilization developed the first known system of writing?",
    options: ["Sumerians", "Egyptians", "Chinese", "Indus Valley"],
    correctAnswer: "Sumerians",
    explanation: "The Sumerians developed cuneiform writing around 3200 BCE in Mesopotamia, making it the earliest known writing system.",
    funFact: "Cuneiform was written by pressing a wedge-shaped stylus into soft clay tablets, which were then dried or baked.",
    learnMore: "Explore the development of early writing systems and their impact on civilization."
  },
  {
    question: "What was the primary purpose of the Silk Road?",
    options: ["Trade and Cultural Exchange", "Military Conquest", "Religious Pilgrimage", "Scientific Research"],
    correctAnswer: "Trade and Cultural Exchange",
    explanation: "The Silk Road was a network of trade routes connecting East Asia and the Mediterranean, facilitating the exchange of goods, ideas, and cultures.",
    funFact: "Despite its name, the Silk Road wasn't a single road but a network of routes, and silk wasn't the only commodity traded.",
    learnMore: "Study the impact of the Silk Road on cultural diffusion and technological advancement."
  },
  {
    question: "Which event marked the beginning of the Renaissance?",
    options: ["Fall of Constantinople", "Black Death", "Invention of Printing Press", "Discovery of America"],
    correctAnswer: "Fall of Constantinople",
    explanation: "The Fall of Constantinople in 1453 led many Greek scholars to flee to Italy, bringing with them ancient texts that helped spark the Renaissance.",
    funFact: "The word 'Renaissance' means 'rebirth' in French, referring to the revival of classical learning and arts.",
    learnMore: "Explore how the Renaissance changed European art, science, and philosophy."
  }
];

const usedQuestions = new Set<number>();

export function getNextQuestion(_topic: string): Question {
  // Reset if all questions have been used
  if (usedQuestions.size === questions.length) {
    usedQuestions.clear();
  }

  // Find an unused question index
  let selectedIndex;
  do {
    selectedIndex = Math.floor(Math.random() * questions.length);
  } while (usedQuestions.has(selectedIndex));

  // Mark this question as used
  usedQuestions.add(selectedIndex);

  return questions[selectedIndex];
}
