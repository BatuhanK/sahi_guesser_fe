import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/gameStore";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ParticipantsList } from "./components/ParticipantsList";
import { VoiceButtons } from "./components/VoiceButtons";
import { useAudioChat } from "./hooks/useAudioChat";
import { ChatProps } from "./types";
import { isOwnMessage, shouldShowTimestamp } from "./utils";

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mentionHandlerRef = useRef<(username: string) => void>();
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);
  const roomId = useGameStore((state) => state.roomId);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVoiceControlsMinimized, setIsVoiceControlsMinimized] =
    useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setIsMinimized(isMobile);
  }, []);

  const {
    audioState,
    remoteParticipants,
    connectToLiveKit,
    disconnectFromLiveKit,
    toggleMute,
    toggleRoomMute,
    toggleParticipantMute,
  } = useAudioChat(
    roomId != null ? roomId.toString() : null,
    user?.id?.toString() ?? null
  );

  const setMentionHandler = useCallback(
    (handler: (username: string) => void) => {
      mentionHandlerRef.current = handler;
    },
    []
  );

  const handleMentionClick = useCallback((username: string) => {
    mentionHandlerRef.current?.(username);
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const chatContainer = messagesEndRef.current?.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (isMinimized) {
      setUnreadCount((prev) => prev + 1);
    } else {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [messages, isMinimized, scrollToBottom]);

  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isMinimized, scrollToBottom]);

  const toggleBan = (username: string) => {
    onSendMessage(`/ban ${username}`);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 z-50 bg-[var(--bg-secondary)] rounded-t-xl shadow-xl border border-[var(--border-color)]",
        "transition-all duration-300 ease-in-out",
        "left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0",
        isMinimized ? "h-[52px]" : "h-[75vh] md:h-[calc(100vh-4rem)]",
        "w-[420px] md:w-[450px] max-w-[95vw]"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setIsMinimized(!isMinimized)}
              className="cursor-pointer"
            >
              <ChatHeader onlinePlayers={onlinePlayers} />
            </div>
            {isMinimized && user && (
              <VoiceButtons
                isCompact
                audioState={audioState}
                onToggleMute={toggleMute}
                onToggleRoomMute={toggleRoomMute}
                onConnect={connectToLiveKit}
                onDisconnect={disconnectFromLiveKit}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isMinimized && unreadCount > 0 && (
              <span className="bg-[var(--accent-color)] text-[var(--bg-secondary)] text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-[var(--hover-color)] rounded-full text-[var(--text-primary)]"
            >
              {isMinimized ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              {messages?.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwn={isOwnMessage(msg, user)}
                  showTimestamp={shouldShowTimestamp(messages, index)}
                  currentUsername={user?.username}
                  onMentionClick={handleMentionClick}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-[var(--border-color)]">
              <div className="px-4 py-2 bg-[var(--bg-tertiary)]">
                <div className="flex items-center justify-between">
                  {user && (
                    <VoiceButtons
                      audioState={audioState}
                      onToggleMute={toggleMute}
                      onToggleRoomMute={toggleRoomMute}
                      onConnect={connectToLiveKit}
                      onDisconnect={disconnectFromLiveKit}
                    />
                  )}
                  {audioState.isConnected && (
                    <button
                      type="button"
                      onClick={() =>
                        setIsVoiceControlsMinimized(!isVoiceControlsMinimized)
                      }
                      className="p-1 hover:bg-[var(--hover-color)] rounded-full text-[var(--text-primary)]"
                    >
                      {isVoiceControlsMinimized ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
                {!isVoiceControlsMinimized &&
                  audioState.isConnected &&
                  remoteParticipants.size > 0 && (
                    <ParticipantsList
                      remoteParticipants={remoteParticipants}
                      onToggleMute={toggleParticipantMute}
                      onToggleBan={toggleBan}
                      listeners={audioState.listeners}
                    />
                  )}
              </div>
            </div>
            <ChatInput
              onSubmit={onSendMessage}
              setMentionHandler={setMentionHandler}
            />
          </>
        )}
      </div>
    </div>
  );
};
