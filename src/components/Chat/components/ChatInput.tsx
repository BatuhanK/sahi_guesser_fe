import React, { useRef, useState } from "react";
import { default as data } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Send, Smile } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ChatInputProps } from "../types";
import { convertEmojis } from "../utils";
import { useMentions } from "../hooks/useMentions";
import { useGameStore } from "../../../store/gameStore";
import { EmojiHelp } from ".";

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
        <div className="absolute bottom-[calc(100%+0.5rem)] left-4 w-72 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50/80 sticky top-0 backdrop-blur-sm">
            Kullanıcılar • Tab veya Enter ile seçin
          </div>
          <div className="py-1">
            {filteredPlayers.map((player, index) => (
              <button
                key={player.userId}
                className={cn(
                  "w-full px-3 py-2 text-left transition-colors flex items-center gap-2",
                  index === selectedMentionIndex
                    ? "bg-yellow-50"
                    : "hover:bg-gray-50"
                )}
                onClick={() =>
                  completeMention(player.username, message, setMessage, inputRef)
                }
              >
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-medium text-sm">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1">{player.username}</span>
                {index === selectedMentionIndex && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
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
        className="flex-none sticky bottom-0 p-3 lg:p-3 border-t border-gray-100 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80"
      >
        <div className="flex gap-2 items-center max-w-full">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex-none p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          <EmojiHelp />
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın... (@ile kullanıcı etiketleyin)"
            className={cn(
              "flex-1 rounded-full bg-white",
              "border border-gray-200 hover:border-gray-300",
              "focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50",
              "px-4 py-3 lg:py-2 text-base lg:text-sm transition-colors",
              "placeholder:text-gray-400"
            )}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={cn(
              "flex-none",
              "bg-yellow-400 text-white p-3.5 lg:p-2.5 rounded-full",
              "hover:bg-yellow-500 active:bg-yellow-600 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
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