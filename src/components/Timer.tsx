import { Timer as TimerIcon } from "lucide-react";
import React from "react";

interface TimerProps {
  timeLeft: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  return (
    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded-lg shadow transition-colors">
      <TimerIcon className="text-[var(--accent-color)]" size={20} />
      <span className="font-medium">{timeLeft}s</span>
    </div>
  );
};
