import React from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
      <TimerIcon className="text-yellow-400" size={20} />
      <span className="font-medium">{timeLeft}s</span>
    </div>
  );
};