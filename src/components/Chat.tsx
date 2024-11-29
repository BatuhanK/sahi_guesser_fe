import { default as data } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { MessageCircle, Send, Smile } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/gameStore";
import type { ChatMention, ChatMessage } from "../types";
import type { User } from "../types/auth";

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const isOwnMessage = (message: ChatMessage, user: User | null) => {
  return String(message.userId) === String(user?.id);
};

const shouldShowTimestamp = (messages: ChatMessage[], index: number) => {
  if (index === 0) return true;
  const currentMsg = messages[index];
  const prevMsg = messages[index - 1];

  return (
    prevMsg.userId !== currentMsg.userId ||
    currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() > 5 * 60 * 1000
  );
};

const renderMessageWithMentions = (
  message: string,
  mentions?: ChatMention[],
  currentUserId?: string | null
) => {
  if (!mentions?.length) return message;

  const result = [];
  let lastIndex = 0;
  const isCurrentUserMentioned = mentions.some(
    (mention) => String(mention.userId) === String(currentUserId)
  );

  mentions
    .sort((a, b) => a.indices[0] - b.indices[0])
    .forEach((mention) => {
      const [start, end] = mention.indices;
      const isSelfMention = String(mention.userId) === String(currentUserId);

      // Add text before mention
      if (start > lastIndex) {
        result.push(message.slice(lastIndex, start));
      }

      // Add mention with enhanced styling
      result.push(
        <span
          key={`mention-${mention.userId}`}
          className={cn(
            "px-1 rounded font-medium",
            isSelfMention
              ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/50 dark:text-yellow-300",
            "animate-highlight"
          )}
        >
          @{mention.username}
        </span>
      );

      lastIndex = end;
    });

  // Add remaining text
  if (lastIndex < message.length) {
    result.push(message.slice(lastIndex));
  }

  return result;
};

const ChatMessage: React.FC<{
  message: ChatMessage;
  isOwn: boolean;
  showTimestamp: boolean;
  currentUserId?: string | null;
}> = ({ message, isOwn, showTimestamp, currentUserId }) => {
  const isMentioned = message.mentions?.some(
    (mention) => String(mention.userId) === String(currentUserId)
  );

  return (
    <div
      className={cn("flex flex-col mb-3", isOwn ? "items-end" : "items-start")}
    >
      {showTimestamp && (
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "font-medium text-sm",
              isOwn ? "text-yellow-600" : "text-gray-700"
            )}
          >
            {message.username}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(message.timestamp, {
              addSuffix: true,
              locale: tr,
            })}
          </span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm transition-colors",
          isOwn
            ? "bg-yellow-400 text-white rounded-tr-none"
            : isMentioned
            ? "bg-yellow-50 text-gray-800 rounded-tl-none border-2 border-yellow-200 animate-pulse-subtle"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        <p className="break-words text-sm">
          {renderMessageWithMentions(
            message.message,
            message.mentions,
            currentUserId
          )}
        </p>
      </div>
    </div>
  );
};

const EMOJI_MAP: Record<string, string> = {
  ":)": "😊",
  ":D": "😃",
  ":(": "😞",
  ":P": "😛",
  ":p": "😛",
  "<3": "❤️",
  ":heart:": "❤️",
  ":+1:": "👍",
  ":-1:": "👎",
  ":thumbsup:": "👍",
  ":thumbsdown:": "👎",
  ":fire:": "🔥",
  ":smile:": "😊",
  ":sad:": "😢",
  ":laugh:": "😂",
  ":wink:": "😉",
  ":ok:": "👌",
  ":wave:": "👋",
  ":clap:": "👏",
  ":rocket:": "🚀",
  ":star:": "⭐",
  ":100:": "💯",
  ":check:": "✅",
  ":x:": "❌",
};

const convertEmojis = (message: string): string => {
  let result = message;

  // Replace emoji shortcuts with actual emojis
  Object.entries(EMOJI_MAP).forEach(([shortcut, emoji]) => {
    result = result.replace(
      new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      emoji
    );
  });

  return result;
};

const EmojiHelp: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowHelp(!showHelp)}
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        ?
      </button>

      {showHelp && (
        <div className="absolute bottom-full left-0 mb-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-64">
          <h4 className="font-medium mb-2">Emoji Kısayolları</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(EMOJI_MAP).map(([shortcut, emoji]) => (
              <div key={shortcut} className="flex items-center gap-2">
                <code className="bg-gray-100 px-1 rounded">{shortcut}</code>
                <span>{emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatInput: React.FC<{
  onSubmit: (message: string) => void;
}> = ({ onSubmit }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Convert emoji shortcuts before sending
      const messageWithEmojis = convertEmojis(message.trim());
      onSubmit(messageWithEmojis);
      setMessage("");
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    const start = message.slice(0, cursorPosition);
    const end = message.slice(cursorPosition);
    const newMessage = start + (emoji?.native ?? "") + end;
    setMessage(newMessage);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    setCursorPosition(e.currentTarget.selectionStart ?? 0);

    // Check for @ symbol for mentions
    const lastAtSymbol = newValue.lastIndexOf("@");
    if (lastAtSymbol !== -1 && lastAtSymbol >= newValue.lastIndexOf(" ")) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (player: { username: string }) => {
    const lastAtSymbol = message.lastIndexOf("@");
    const newMessage =
      message.slice(0, lastAtSymbol) +
      `@${player.username} ` +
      message.slice(cursorPosition);

    setMessage(newMessage);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {showMentions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
          {onlinePlayers.map((player) => (
            <button
              key={player.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
              onClick={() => handleMentionSelect(player)}
            >
              {player.username}
            </button>
          ))}
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
            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            placeholder="Mesajınızı yazın..."
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

const ChatHeader: React.FC = () => (
  <div className="flex-none border-b border-gray-100 p-4">
    <div className="flex items-center gap-2">
      <MessageCircle className="w-5 h-5 text-yellow-500" />
      <h2 className="font-medium text-gray-900">Sohbet</h2>
    </div>
  </div>
);

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const scrollToBottom = () => {
    if (isDesktop && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isDesktop]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {messages?.map((msg, index) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={isOwnMessage(msg, user)}
            showTimestamp={shouldShowTimestamp(messages, index)}
            currentUserId={user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSubmit={onSendMessage} />
    </div>
  );
};
