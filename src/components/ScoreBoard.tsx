import { Trophy } from "lucide-react";
import React from "react";

interface ScoreBoardProps {
  totalScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ totalScore }) => {
  return (
    <div className="flex items-center gap-6 bg-white p-4 rounded-xl shadow-lg">
      <div className="flex items-center gap-2">
        <Trophy className="text-yellow-400" size={24} />
        <span className="text-xl font-bold">{totalScore}</span>
      </div>
    </div>
  );
};
