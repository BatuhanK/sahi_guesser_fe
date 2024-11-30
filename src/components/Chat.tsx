import { default as data } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { MessageCircle, Send, Smile } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  return message.username === user?.username;
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
  currentUsername?: string | null
) => {
  if (!mentions?.length) return message;

  const result = [];
  let lastIndex = 0;
  const isCurrentUserMentioned = mentions.some(
    (mention) => mention.username === currentUsername
  );

  mentions
    .sort((a, b) => a.indices[0] - b.indices[0])
    .forEach((mention) => {
      const [start, end] = mention.indices;
      const isSelfMention = mention.username === currentUsername;

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

  return (
    <div className={cn(isCurrentUserMentioned && "animate-pulse-once")}>
      {result}
    </div>
  );
};

const ChatMessage: React.FC<{
  message: ChatMessage;
  isOwn: boolean;
  showTimestamp: boolean;
  currentUsername?: string | null;
  onMentionClick?: (username: string) => void;
}> = ({ message, isOwn, showTimestamp, currentUsername, onMentionClick }) => {
  const isMentioned = message.mentions?.some(
    (mention) => mention.username === currentUsername
  );

  return (
    <div
      className={cn(
        "flex flex-col mb-3",
        isOwn ? "items-end" : "items-start",
        "group"
      )}
    >
      {showTimestamp && (
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "font-medium text-sm cursor-pointer",
              isOwn ? "text-yellow-600" : "text-gray-700",
              "opacity-80 hover:opacity-100 transition-opacity",
              !isOwn && "group-hover:underline"
            )}
            onClick={() => onMentionClick?.(message.username)}
            role="button"
            tabIndex={0}
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
            currentUsername
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
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isDesktop) return null;

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

const fuzzySearch = (text: string, query: string): boolean => {
  const pattern = query
    .toLowerCase()
    .split("")
    .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  const regex = new RegExp(pattern);
  return regex.test(text.toLowerCase());
};

// Add new interfaces for mention handling
interface MentionState {
  isActive: boolean;
  startPosition: number;
  text: string;
}

// Update ChatInput component with improved mention handling
const ChatInput: React.FC<{
  onSubmit: (message: string) => void;
}> = ({ onSubmit }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    startPosition: 0,
    text: "",
  });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);

  const filteredPlayers = useMemo(() => {
    if (!mentionState.isActive) return [];
    return onlinePlayers.filter((player) =>
      fuzzySearch(player.username, mentionState.text)
    );
  }, [mentionState.text, mentionState.isActive, onlinePlayers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mentionState.isActive) return;

    switch (e.key) {
      case "Tab":
      case "Enter":
        if (filteredPlayers.length > 0) {
          e.preventDefault();
          completeMention(filteredPlayers[selectedMentionIndex].username);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          Math.min(prev + 1, filteredPlayers.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Escape":
        setMentionState({ isActive: false, startPosition: 0, text: "" });
        break;
    }
  };

  const completeMention = (username: string) => {
    const beforeMention = message.slice(0, mentionState.startPosition);
    const afterMention = message.slice(
      mentionState.startPosition + mentionState.text.length + 1
    );
    const newMessage = `${beforeMention}@${username} ${afterMention}`;

    setMessage(newMessage);
    setMentionState({ isActive: false, startPosition: 0, text: "" });
    setSelectedMentionIndex(0);

    // Set cursor position after the completed mention
    const newPosition = mentionState.startPosition + username.length + 2;
    setTimeout(() => {
      inputRef.current?.setSelectionRange(newPosition, newPosition);
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    const cursorPosition = e.target.selectionStart ?? 0;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");
    const lastSpaceBeforeAt = textBeforeCursor.lastIndexOf(" ", lastAtSymbol);

    if (
      lastAtSymbol !== -1 &&
      (lastSpaceBeforeAt === -1 || lastSpaceBeforeAt < lastAtSymbol) &&
      cursorPosition > lastAtSymbol
    ) {
      const mentionText = textBeforeCursor.slice(lastAtSymbol + 1);
      setMentionState({
        isActive: true,
        startPosition: lastAtSymbol,
        text: mentionText,
      });
      setSelectedMentionIndex(0);
    } else {
      setMentionState({ isActive: false, startPosition: 0, text: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Convert emoji shortcuts before sending
      const messageWithEmojis = convertEmojis(message.trim());
      onSubmit(messageWithEmojis);
      setMessage("");
      setMentionState({ isActive: false, startPosition: 0, text: "" });
      setSelectedMentionIndex(0);
      setShowEmojiPicker(false); // Also close emoji picker if open
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    const start = message.slice(0, mentionState.startPosition);
    const end = message.slice(mentionState.startPosition);
    const newMessage = start + (emoji?.native ?? "") + end;
    setMessage(newMessage);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2">
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
                onClick={() => completeMention(player.username)}
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
  const mentionHandlerRef = useRef<(username: string) => void>();

  const setMentionHandler = useCallback(
    (handler: (username: string) => void) => {
      mentionHandlerRef.current = handler;
    },
    []
  );

  const handleMentionClick = useCallback((username: string) => {
    mentionHandlerRef.current?.(username);
  }, []);

  const scrollToBottom = () => {
    if (isDesktop && messages.length > 0) {
      const chatContainer = messagesEndRef.current?.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isDesktop]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
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
      <ChatInput
        onSubmit={onSendMessage}
        setMentionHandler={setMentionHandler}
      
      />
    </div>
  );
};
