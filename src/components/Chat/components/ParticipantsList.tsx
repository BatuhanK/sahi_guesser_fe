import { Ban, Headphones, Mic, MicOff } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { cn } from "../../../lib/utils";
import { ParticipantsListProps } from "../types";
import { SpeakingIndicator } from "./SpeakingIndicator";

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  remoteParticipants,
  onToggleMute,
  listeners,
  onToggleBan,
}) => {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "moderator";
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleBanClick = (username: string) => {
    setSelectedUser(username);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onToggleBan(selectedUser);
      setSelectedUser(null);
    }
  };

  if (remoteParticipants.size === 0 && (!listeners || listeners.size === 0))
    return null;

  return (
    <>
      <div className="mt-2 max-h-[200px] overflow-y-auto scroll-enabled">
        <div className="space-y-1">
          {Array.from(remoteParticipants.values()).map((participant) => (
            <div
              key={participant.identity}
              className="flex items-center justify-between text-sm gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-primary)]">
                  {participant.identity}
                </span>
                {participant.isSpeaking && <SpeakingIndicator />}
              </div>
              <div className="flex items-center gap-2 ml-auto">
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

                {isStaff && (
                  <button
                    onClick={() => handleBanClick(participant.identity)}
                    className="p-1.5 rounded-full transition-colors hover:bg-red-100"
                  >
                    <Ban className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedUser} adlı kullanıcı banlanacak, onaylıyor musunuz?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
