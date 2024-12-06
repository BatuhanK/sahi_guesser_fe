import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useGameStore } from "../../store/gameStore";
import { ChatProps } from "./types";
import { isOwnMessage, shouldShowTimestamp } from "./utils";
import { useAudioChat } from "./hooks/useAudioChat";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { ParticipantsList } from "./components/ParticipantsList";
import { VoiceButtons } from "./components/VoiceButtons";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mentionHandlerRef = useRef<(username: string) => void>();
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);
  const roomId = useGameStore((state) => state.roomId);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVoiceControlsMinimized, setIsVoiceControlsMinimized] = useState(false);

  const {
    audioState,
    remoteParticipants,
    connectToLiveKit,
    disconnectFromLiveKit,
    toggleMute,
    toggleRoomMute,
    toggleParticipantMute,
  } = useAudioChat(roomId != null ? roomId.toString() : null, user?.id?.toString() ?? null);

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
      setUnreadCount(prev => prev + 1);
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

  return (
    <div className={cn(
      "fixed bottom-0 right-4 z-50 bg-white rounded-t-xl shadow-xl border border-gray-200",
      "transition-all duration-300 ease-in-out",
      isMinimized ? "h-[52px]" : "h-[calc(100vh-6rem)]",
      "w-[360px] max-w-[calc(100vw-2rem)]"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div onClick={() => setIsMinimized(!isMinimized)} className="cursor-pointer">
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
              <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
            <div className="border-t border-gray-100">
              <div className="px-4 py-2 bg-gray-50/80">
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
                      onClick={() => setIsVoiceControlsMinimized(!isVoiceControlsMinimized)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      {isVoiceControlsMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                {!isVoiceControlsMinimized && audioState.isConnected && remoteParticipants.size > 0 && (
                  <ParticipantsList
                    remoteParticipants={remoteParticipants}
                    onToggleMute={toggleParticipantMute}
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
} 