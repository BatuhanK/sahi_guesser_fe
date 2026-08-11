import { Timer as TimerIcon } from "lucide-react";
import React from "react";

interface TimerProps {
  timeLeft: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-1.5 text-[var(--text-primary)] shadow-sm transition-colors">
      <TimerIcon className="text-[var(--accent-color)]" size={18} />
      <span className="font-semibold tabular-nums">{timeLeft}s</span>
    </div>
  );
};
