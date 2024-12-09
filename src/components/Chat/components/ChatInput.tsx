import { default as data } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Send, Smile } from "lucide-react";
import React, { useRef, useState } from "react";
import { EmojiHelp } from ".";
import { cn } from "../../../lib/utils";
import { useGameStore } from "../../../store/gameStore";
import { useMentions } from "../hooks/useMentions";
import { ChatInputProps } from "../types";
import { convertEmojis } from "../utils";

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  setMentionHandler,
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);

  const {
    mentionState,
    selectedMentionIndex,
    filteredPlayers,
    handleMentionKeyDown,
    handleMentionInput,
    completeMention,
  } = useMentions(onlinePlayers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const messageWithEmojis = convertEmojis(message.trim());
      onSubmit(messageWithEmojis);
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    const start = message.slice(0, mentionState.startPosition);
    const end = message.slice(mentionState.startPosition);
    const newMessage = start + (emoji?.native ?? "") + end;
    setMessage(newMessage);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    handleMentionInput(newValue, e.target.selectionStart ?? 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleMentionKeyDown(e, message, setMessage, inputRef);
  };

  React.useEffect(() => {
    setMentionHandler((username: string) => {
      completeMention(username, message, setMessage, inputRef);
    });
  }, [message, setMentionHandler]);

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 scroll-enabled">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {mentionState.isActive && filteredPlayers.length > 0 && (
        <div className="absolute bottom-[calc(100%+0.5rem)] left-4 w-72 bg-[var(--bg-secondary)] rounded-lg shadow-xl border border-[var(--border-color)] max-h-48 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/80 sticky top-0 backdrop-blur-sm">
            Kullanıcılar • Tab veya Enter ile seçin
          </div>
          <div className="py-1">
            {filteredPlayers.map((player, index) => (
              <button
                key={player.userId}
                className={cn(
                  "w-full px-3 py-2 text-left transition-colors flex items-center gap-2",
                  index === selectedMentionIndex
                    ? "bg-[var(--warning-bg)]"
                    : "hover:bg-[var(--hover-color)]"
                )}
                onClick={() =>
                  completeMention(
                    player.username,
                    message,
                    setMessage,
                    inputRef
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-color)] font-medium text-sm">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-[var(--text-primary)]">
                  {player.username}
                </span>
                {index === selectedMentionIndex && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded">
                    Tab
                  </kbd>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex-none sticky bottom-0 p-3 lg:p-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-tertiary)]/80"
      >
        <div className="flex gap-2 items-center max-w-full">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex-none p-2 rounded-full hover:bg-[var(--hover-color)] transition-colors"
          >
            <Smile className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <EmojiHelp />
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className={cn(
              "flex-1 rounded-full bg-[var(--bg-secondary)]",
              "border border-[var(--border-color)] hover:border-[var(--text-tertiary)]",
              "focus:border-[var(--accent-color)] focus:ring focus:ring-[var(--accent-muted)] focus:ring-opacity-50",
              "px-4 py-3 lg:py-2 text-base lg:text-sm transition-colors",
              "placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
            )}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={cn(
              "flex-none",
              "bg-[var(--accent-color)] text-[var(--bg-secondary)] p-3.5 lg:p-2.5 rounded-full",
              "hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)] transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2",
              "shadow-sm touch-manipulation"
            )}
          >
            <Send size={22} className="lg:w-5 lg:h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
