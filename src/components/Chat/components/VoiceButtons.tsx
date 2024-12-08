import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { AudioState } from "../types";

interface VoiceButtonsProps {
  isCompact?: boolean;
  audioState: AudioState;
  onToggleMute: () => void;
  onToggleRoomMute: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const VoiceButtons: React.FC<VoiceButtonsProps> = ({
  isCompact = false,
  audioState,
  onToggleMute,
  onToggleRoomMute,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className={cn("flex items-center", isCompact ? "gap-1" : "gap-2")}>
      <button
        type="button"
        onClick={() => (audioState.isConnected ? onDisconnect() : onConnect())}
        disabled={audioState.isConnecting}
        className={cn(
          "rounded-full transition-colors",
          isCompact
            ? "p-1.5"
            : "flex items-center gap-2 px-3 py-1.5 text-sm font-medium",
          audioState.isConnected
            ? "bg-[var(--error-bg)] text-[var(--error-text)] hover:opacity-80"
            : isCompact
            ? "hover:bg-[var(--hover-color)]"
            : "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]"
        )}
      >
        {audioState.isConnecting ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-[var(--accent-color)] border-t-transparent" />
        ) : audioState.isConnected ? (
          <>
            <PhoneOff className="w-4 h-4" />
            {!isCompact && <span>Sesli Sohbetten Ayrıl</span>}
          </>
        ) : (
          <>
            <Phone className="w-4 h-4" />
            {!isCompact && <span>Sesli Sohbete Katıl</span>}
          </>
        )}
      </button>
      {audioState.isConnected && (
        <>
          <button
            type="button"
            onClick={onToggleMute}
            className={cn(
              "rounded-full transition-colors",
              isCompact ? "p-1.5" : "p-2",
              audioState.isMuted
                ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--hover-color)]"
                : "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]"
            )}
          >
            {audioState.isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onToggleRoomMute}
            className={cn(
              "rounded-full transition-colors",
              isCompact ? "p-1.5" : "p-2",
              audioState.isRoomMuted
                ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--hover-color)]"
                : "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]"
            )}
          >
            {audioState.isRoomMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </>
      )}
    </div>
  );
};
