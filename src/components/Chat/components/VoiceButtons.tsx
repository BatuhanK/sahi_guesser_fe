import React from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AudioState } from '../types';

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
        onClick={() => audioState.isConnected ? onDisconnect() : onConnect()}
        disabled={audioState.isConnecting}
        className={cn(
          "rounded-full transition-colors",
          isCompact 
            ? "p-1.5" 
            : "flex items-center gap-2 px-3 py-1.5 text-sm font-medium",
          audioState.isConnected
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : isCompact 
              ? "hover:bg-gray-100" 
              : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
        )}
      >
        {audioState.isConnecting ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
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
                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            )}
          >
            {audioState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleRoomMute}
            className={cn(
              "rounded-full transition-colors",
              isCompact ? "p-1.5" : "p-2",
              audioState.isRoomMuted
                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            )}
          >
            {audioState.isRoomMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </>
      )}
    </div>
  );
}; 