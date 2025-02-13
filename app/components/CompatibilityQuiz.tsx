import { motion } from 'framer-motion';
import { useState } from 'react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your ideal date?",
    options: ["Romantic dinner", "Adventure activity", "Netflix & Chill", "Cultural event"]
  },
  {
    id: 2,
    question: "What's your love language?",
    options: ["Words of Affirmation", "Physical Touch", "Acts of Service", "Quality Time", "Gifts"]
  },
  {
    id: 3,
    question: "Your zodiac sign?",
    options: ["Fire (Aries, Leo, Sagittarius)", "Earth (Taurus, Virgo, Capricorn)", 
              "Air (Gemini, Libra, Aquarius)", "Water (Cancer, Scorpio, Pisces)"]
  },
  {
    id: 4,
    question: "Favorite way to show affection?",
    options: ["Surprise gifts", "Physical affection", "Verbal expression", "Thoughtful actions"]
  }
];

interface CompatibilityQuizProps {
  onComplete: (score: number) => void;
}

export default function CompatibilityQuiz({ onComplete }: CompatibilityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate compatibility score (0-100)
      const score = Math.floor(Math.random() * 31) + 70; // For demo, replace with actual algorithm
      onComplete(score);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-pink-950/30 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20"
    >
      <h3 className="text-xl font-bold text-pink-200 mb-4">
        Compatibility Quiz ({currentQuestion + 1}/{QUIZ_QUESTIONS.length})
      </h3>
      
      <div className="space-y-4">
        <p className="text-pink-100 text-lg mb-4">
          {QUIZ_QUESTIONS[currentQuestion].question}
        </p>
        
        <div className="grid gap-3">
          {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(QUIZ_QUESTIONS[currentQuestion].id, index)}
              className="p-3 text-left rounded-lg bg-pink-950/50 hover:bg-pink-900/50 
                       border border-pink-500/30 hover:border-pink-500/50 
                       transition-all duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 