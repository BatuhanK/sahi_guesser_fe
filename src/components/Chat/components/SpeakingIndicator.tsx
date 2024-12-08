import React from "react";
import { cn } from "../../../lib/utils";

export const SpeakingIndicator: React.FC = () => (
  <div className="flex gap-1">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-1 h-3 bg-[var(--success-text)] rounded-full",
          "animate-sound-wave",
          i === 0 && "animation-delay-0",
          i === 1 && "animation-delay-150",
          i === 2 && "animation-delay-300"
        )}
      />
    ))}
  </div>
);
