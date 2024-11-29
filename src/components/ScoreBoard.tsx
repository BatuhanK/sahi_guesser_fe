import { Trophy } from "lucide-react";
import React, { useState } from "react";
import { Modal } from "./ui/Modal";
import { LeaderboardTable } from "./LeaderboardTable";

interface ScoreBoardProps {
  totalScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ totalScore }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <>
      <button 
        className="flex items-center gap-6 bg-white p-4 rounded-xl hover:bg-gray-50 transition-all relative shine-button" 
        onClick={() => setShowLeaderboard(true)}
      >
        <div className="flex items-center gap-2 z-10">
          <Trophy className="text-yellow-400" size={24} />
          <span className="text-xl font-bold">{totalScore}</span>
        </div>
      </button>

      <Modal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        title="Lider Tablosu"
      >
        <LeaderboardTable />
      </Modal>
    </>
  );
};
