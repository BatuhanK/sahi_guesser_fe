import React from 'react';
import { motion } from 'framer-motion';
import { GuessStatus } from '../../GuessStatus';

export const GuessProgressBar: React.FC<{
  current: number;
  max: number;
}> = ({ current, max }) => (
  <div className="w-full flex items-center gap-1">
    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${(current / max) * 100}%`,
          backgroundColor: current >= max ? "#EF4444" : "#FBBF24",
        }}
      />
    </div>
    <span className="text-sm font-medium text-gray-600 min-w-[60px] text-right">
      {current} / {max}
    </span>
  </div>
);

export const GuessMessage: React.FC<{
  isAuthenticated: boolean;
  maxGuessExceeded: boolean;
}> = ({ isAuthenticated, maxGuessExceeded }) => {
  if (!isAuthenticated) {
    return (
      <p className="text-center text-red-500 text-sm lg:text-base bg-red-50 p-1.5 lg:p-2 rounded-lg w-full">
        Tahmin yapabilmek için giriş yapmalısınız
      </p>
    );
  }
  
  if (maxGuessExceeded) {
    return (
      <p className="text-center text-red-500 text-sm lg:text-base bg-red-50 p-1.5 lg:p-2 rounded-lg w-full">
        Bu tur için maksimum tahmin hakkınızı kullandınız
      </p>
    );
  }
  
  return null;
};

type FeedbackType = "correct" | "go_higher" | "go_lower";

export const FeedbackMessage: React.FC<{
  feedback: FeedbackType | null;
  showResults: boolean;
}> = ({ feedback, showResults }) => {
  if (!feedback || showResults) return null;

  return (
    <motion.div
      className="w-full flex justify-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
    >
      <GuessStatus
        feedback={feedback}
        type={feedback === "correct" ? "success" : "error"}
      />
    </motion.div>
  );
}; 