import { Trophy } from "lucide-react";
import React, { useState } from "react";
import { LeaderboardTable } from "./LeaderboardTable";
import { Modal } from "./ui/Modal";

interface ScoreBoardProps {
  totalScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ totalScore }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  return (
    <>
      <button
        className="shine-button relative flex items-center gap-2 rounded-full border border-[var(--border-color)] px-3.5 py-1.5 transition-all hover:border-[var(--accent-color)]"
        onClick={() => setShowLeaderboard(true)}
      >
        <div className="flex items-center gap-1.5 z-10">
          <Trophy className="text-[var(--accent-color)]" size={18} />
          <span className="text-base font-bold tabular-nums text-[var(--text-primary)]">
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
