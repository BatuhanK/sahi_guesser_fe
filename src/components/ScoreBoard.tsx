import { Trophy } from "lucide-react";
import React, { useState } from "react";
import { LeaderboardTable } from "./LeaderboardTable";
import { Modal } from "./ui/Modal";

interface ScoreBoardProps {
  totalScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ totalScore }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  console.log("21");
  return (
    <>
      <button
        className="flex items-center gap-6 bg-[var(--bg-secondary)] p-4 rounded-xl hover:bg-[var(--hover-color)] transition-all relative shine-button"
        onClick={() => setShowLeaderboard(true)}
      >
        <div className="flex items-center gap-2 z-10">
          <Trophy className="text-yellow-400" size={24} />
          <span className="text-xl font-bold text-[var(--text-primary)]">
            {totalScore}
          </span>
        </div>
      </button>

      <Modal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        title="Lider Tablosu"
        childrenClassName="!overflow-hidden !max-h-[100vh]"
      >
        <LeaderboardTable />
      </Modal>
    </>
  );
};
