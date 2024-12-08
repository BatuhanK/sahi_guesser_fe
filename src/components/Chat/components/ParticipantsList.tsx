import { Headphones, Mic, MicOff } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { ParticipantsListProps } from "../types";
import { SpeakingIndicator } from "./SpeakingIndicator";

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  remoteParticipants,
  onToggleMute,
  listeners,
}) => {
  if (remoteParticipants.size === 0 && (!listeners || listeners.size === 0))
    return null;

  return (
    <div className="mt-2 max-h-[200px] overflow-y-auto scroll-enabled">
      <div className="space-y-1">
        {Array.from(remoteParticipants.values()).map((participant) => (
          <div
            key={participant.identity}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)]">
                {participant.identity}
              </span>
              {participant.isSpeaking && <SpeakingIndicator />}
            </div>
            <button
              onClick={() => onToggleMute(participant.identity)}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                participant.isMuted
                  ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                  : "bg-[var(--accent-muted)] text-[var(--accent-color)]"
              )}
            >
              {participant.isMuted ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}

        {listeners && listeners.size > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Dinleyeciler ({listeners.size})
              </span>
            </div>
            {Array.from(listeners).map((listener) => (
              <div
                key={listener}
                className="flex items-center text-sm pl-6 py-1"
              >
                <span className="text-gray-600">{listener}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
