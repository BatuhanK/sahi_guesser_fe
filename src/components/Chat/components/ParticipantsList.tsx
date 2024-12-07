import React from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ParticipantsListProps } from "../types";
import { SpeakingIndicator } from ".";

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  remoteParticipants,
  onToggleMute,
}) => {
  if (remoteParticipants.size === 0) return null;

  return (
    <div className="mt-2 max-h-[200px] overflow-y-auto scroll-enabled">
      <div className="space-y-1">
        {Array.from(remoteParticipants.values()).map((participant) => (
          <div
            key={participant.identity}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-700">{participant.identity}</span>
              {participant.isSpeaking && <SpeakingIndicator />}
            </div>
            <button
              onClick={() => onToggleMute(participant.identity)}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                participant.isMuted
                  ? "bg-gray-100 text-gray-500"
                  : "bg-yellow-100 text-yellow-600"
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
      </div>
    </div>
  );
}; 