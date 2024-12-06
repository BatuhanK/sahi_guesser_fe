import { default as data } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  createLocalAudioTrack,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import {
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Send,
  Smile,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
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

import { authApi } from "../services/api";
import { soundService } from "../services/soundService";
import { useGameStore } from "../store/gameStore";
import type { ChatMention, ChatMessage } from "../types";
import type { User } from "../types/auth";
import { OnlinePlayer } from "../types/socket";

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

const maskNumbers = (text: string): string => {
  // Turkish number words (case-insensitive)
  const turkishNumbers =
    /\b(bir|iki|üç|uc|dort|dört|bes|beş|alti|altı|yedi|sekiz|dokuz)\b/gi;

  // First replace Turkish number words
  let maskedText = text.replace(turkishNumbers, (match) =>
    "*".repeat(match.length)
  );

  // Then replace numbers with k/K suffix (e.g., 300k, 500K)
  maskedText = maskedText.replace(/\b\d+[kK]\b/g, (match) =>
    "*".repeat(match.length)
  );

  // Replace numbers with e/E prefix (e.g., e250, E3500)
  maskedText = maskedText.replace(/\b[eE]\d+\b/g, (match) =>
    "*".repeat(match.length)
  );

  // Finally replace regular numbers
  return maskedText.replace(/\b\d+\b/g, (match) => "*".repeat(match.length));
};

const renderMessageWithMentions = (
  message: string,
  mentions?: ChatMention[],
  currentUsername?: string | null
) => {
  if (!mentions?.length) {
    // If there are no mentions, just mask the numbers and return
    return maskNumbers(message);
  }

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

      // Add masked text before mention
      if (start > lastIndex) {
        const textBeforeMention = message.slice(lastIndex, start);
        result.push(maskNumbers(textBeforeMention));
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

  // Add remaining masked text
  if (lastIndex < message.length) {
    const remainingText = message.slice(lastIndex);
    result.push(maskNumbers(remainingText));
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
  const isAdmin = message.username === "batuhan";

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
              isAdmin
                ? "text-red-600 font-bold"
                : isOwn
                ? "text-yellow-600"
                : "text-gray-700",
              "opacity-80 hover:opacity-100 transition-opacity",
              !isOwn && "group-hover:underline"
            )}
            onClick={() => onMentionClick?.(message.username)}
            role="button"
            tabIndex={0}
          >
            {isAdmin ? `${message.username} 👑` : message.username}
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
          isAdmin
            ? "bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 text-white rounded-tr-none animate-pulse-slow"
            : isOwn
            ? "bg-yellow-400 text-white rounded-tr-none"
            : isMentioned
            ? "bg-yellow-50 text-gray-800 rounded-tl-none border-2 border-yellow-200 animate-pulse-subtle"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        <p className={cn("break-words text-sm", isAdmin && "font-medium")}>
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
  setMentionHandler: (handler: (username: string) => void) => void;
}> = ({ onSubmit, setMentionHandler }) => {
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

  useEffect(() => {
    setMentionHandler((username: string) => {
      completeMention(username);
    });
  }, []);

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

interface AudioState {
  isConnected: boolean;
  isConnecting: boolean;
  room: Room | null;
  error: string | null;
  isMuted: boolean;
  isRoomMuted: boolean;
}

interface RemoteParticipantState {
  identity: string;
  audioTrack: RemoteTrack | null;
  isMuted: boolean;
  isSpeaking: boolean;
}

const SpeakingIndicator: React.FC = () => (
  <div className="flex gap-1">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-1 h-3 bg-green-500 rounded-full",
          "animate-sound-wave",
          i === 0 && "animation-delay-0",
          i === 1 && "animation-delay-150",
          i === 2 && "animation-delay-300"
        )}
      />
    ))}
  </div>
);

const ParticipantsList: React.FC<{
  remoteParticipants: Map<string, RemoteParticipantState>;
  onToggleMute: (participantId: string) => void;
}> = ({ remoteParticipants, onToggleMute }) => {
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

const OnlinePlayersList: React.FC<{
  players: OnlinePlayer[];
  isOpen: boolean;
  onClose: () => void;
}> = ({ players, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Online Oyuncular ({players.length})</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto scroll-enabled">
          {players.map((player) => (
            <div
              key={player.username}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-medium">
                {player.username.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1">{player.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatHeader: React.FC<{
  audioState: AudioState;
  onToggleAudio: () => void;
  onToggleMute: () => void;
  onToggleRoomMute: () => void;
  remoteParticipants: Map<string, RemoteParticipantState>;
  onToggleParticipantMute: (participantId: string) => void;
  onlinePlayers: OnlinePlayer[];
}> = ({
  audioState,
  onToggleAudio,
  onToggleMute,
  onToggleRoomMute,
  remoteParticipants,
  onToggleParticipantMute,
  onlinePlayers,
}) => {
  const [showOnlinePlayers, setShowOnlinePlayers] = useState(false);

  return (
    <>
      <div className="flex-none border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-yellow-500" />
            <h2 className="font-medium text-gray-900">
              Sohbet
              <span
                className="text-gray-500 block md:hidden mobileOnlinePlayersCount cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => setShowOnlinePlayers(true)}
              >
                {" "}
                ({onlinePlayers.length} kişi online)
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {audioState.isConnected && (
              <>
                <button
                  onClick={onToggleRoomMute}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    audioState.isRoomMuted
                      ? "bg-gray-100 text-gray-500"
                      : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                  )}
                  title={
                    audioState.isRoomMuted
                      ? "Odanın Sesini Aç"
                      : "Odanın Sesini Kapat"
                  }
                >
                  {audioState.isRoomMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={onToggleMute}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    audioState.isMuted
                      ? "bg-gray-100 text-gray-500"
                      : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                  )}
                  title={
                    audioState.isMuted ? "Mikrofonunu Aç" : "Mikrofonunu Kapat"
                  }
                >
                  {audioState.isMuted ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
            <button
              onClick={onToggleAudio}
              disabled={audioState.isConnecting}
              className={cn(
                "p-2 rounded-full transition-colors",
                audioState.isConnected
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "hover:bg-gray-100"
              )}
              title={
                audioState.isConnected
                  ? "Sesli Sohbetten Ayrıl"
                  : "Sesli Sohbete Katıl"
              }
            >
              {audioState.isConnecting ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
              ) : audioState.isConnected ? (
                <PhoneOff className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {audioState.error && (
          <div className="mt-2 text-sm text-red-500">{audioState.error}</div>
        )}
        {audioState.isConnected && (
          <ParticipantsList
            remoteParticipants={remoteParticipants}
            onToggleMute={onToggleParticipantMute}
          />
        )}
      </div>
      <OnlinePlayersList
        players={onlinePlayers}
        isOpen={showOnlinePlayers}
        onClose={() => setShowOnlinePlayers(false)}
      />
    </>
  );
};

// Add this helper at the top of the file
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Add this function to handle iOS audio initialization
const initializeIOSAudio = () => {
  // Create a silent audio context
  const audioContext = new (window.AudioContext ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitAudioContext)();

  // Create and play a silent buffer
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();

  // Resume audio context
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
};

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const mentionHandlerRef = useRef<(username: string) => void>();
  const [audioState, setAudioState] = useState<AudioState>({
    isConnected: false,
    isConnecting: false,
    room: null,
    error: null,
    isMuted: false,
    isRoomMuted: false,
  });
  const [remoteParticipants, setRemoteParticipants] = useState<
    Map<string, RemoteParticipantState>
  >(new Map());

  const onlinePlayers = useGameStore((state) => state.onlinePlayers);

  let livekitRoom: Room | null = null;

  const roomId = useGameStore((state) => state.roomId);

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

  const connectToLiveKit = async () => {
    try {
      if (!user) {
        alert("Lütfen giriş yapınız.");
        return;
      }
      if (!roomId) {
        alert("Oda bulunamadı.");
        return;
      }

      try {
        window.sa_event("audio_chat_connect", {
          user_id: user?.id,
          room_id: roomId,
        });
      } catch (e) {
        console.error(e);
      }

      // Initialize iOS audio before connecting
      if (isIOS) {
        initializeIOSAudio();
      }

      setAudioState((prev) => ({ ...prev, isConnecting: true, error: null }));

      const token = await authApi.getLiveKitToken(roomId.toString());

      livekitRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      livekitRoom.on(RoomEvent.Disconnected, () => {
        setAudioState((prev) => ({
          ...prev,
          isConnected: false,
          room: null,
        }));
      });

      livekitRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log("Participant connected:", participant.identity);
      });

      livekitRoom.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            const mediaTrack = track.mediaStreamTrack;
            const audioElement = new Audio();

            // For iOS, we need to play on user interaction
            if (isIOS) {
              audioElement.setAttribute("playsinline", "true");
              audioElement.muted = false;
            }

            const mediaStream = new MediaStream([mediaTrack]);
            audioElement.srcObject = mediaStream;
            audioElement.play().catch(console.error);

            // Set up audio level monitoring
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(mediaStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let speakingTimeout: NodeJS.Timeout;

            const checkAudioLevel = () => {
              analyser.getByteFrequencyData(dataArray);
              const average =
                dataArray.reduce((a, b) => a + b) / dataArray.length;

              setRemoteParticipants((prev) => {
                const updated = new Map(prev);
                const participantIdentity = participant.identity;
                const currentParticipant = updated.get(participantIdentity);
                if (currentParticipant) {
                  const isSpeaking = average > 30;
                  if (isSpeaking !== currentParticipant.isSpeaking) {
                    clearTimeout(speakingTimeout);
                    if (isSpeaking) {
                      speakingTimeout = setTimeout(() => {
                        setRemoteParticipants((prev) => {
                          const updated = new Map(prev);
                          const currentParticipant =
                            updated.get(participantIdentity);
                          if (currentParticipant) {
                            updated.set(participantIdentity, {
                              ...currentParticipant,
                              isSpeaking: false,
                            });
                          }
                          return updated;
                        });
                      }, 500);
                    }
                    updated.set(participantIdentity, {
                      ...currentParticipant,
                      isSpeaking,
                    });
                  }
                }
                return updated;
              });

              requestAnimationFrame(checkAudioLevel);
            };

            checkAudioLevel();

            setRemoteParticipants((prev) => {
              const updated = new Map(prev);
              updated.set(participant.identity, {
                identity: participant.identity,
                audioTrack: track,
                isMuted: false,
                isSpeaking: false,
              });
              return updated;
            });
          }
        }
      );

      livekitRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach();
        }
      });

      await livekitRoom.connect("https://aws-livekit.sahikaca.com", token);

      const audioTrack = await createLocalAudioTrack();
      await livekitRoom.localParticipant.publishTrack(audioTrack);

      // Lower game sounds when voice chat is active
      soundService.setVolume(0.1);

      setAudioState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        room: livekitRoom,
      }));
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error);
      setAudioState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "Ses bağlantısı kurulamadı",
      }));
    }
  };

  const disconnectFromLiveKit = async () => {
    console.log("disconnectFromLiveKit");

    if (audioState.room) {
      const localParticipant = audioState.room.localParticipant;
      const tracks = Array.from(localParticipant.trackPublications.values());

      tracks.forEach((publication) => {
        if (publication.track) {
          publication.track.stop();
        }
      });

      // Restore normal volume when voice chat ends
      soundService.setVolume(1);

      await audioState.room.disconnect(true);
      setAudioState((prev) => ({
        ...prev,
        isConnected: false,
        room: null,
      }));
    } else if (livekitRoom) {
      await livekitRoom.disconnect(true);
    }
  };

  const handleToggleAudio = () => {
    if (audioState.isConnected) {
      disconnectFromLiveKit();
    } else {
      connectToLiveKit();
    }
  };

  const handleToggleParticipantMute = (participantId: string) => {
    setRemoteParticipants((prev) => {
      const updated = new Map(prev);
      const participant = updated.get(participantId);
      if (participant && participant.audioTrack) {
        // Directly mute the track instead of the audio element
        participant.audioTrack.mediaStreamTrack.enabled = participant.isMuted;
        updated.set(participantId, {
          ...participant,
          isMuted: !participant.isMuted,
        });
      }
      return updated;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromLiveKit();
    };
  }, []);

  // Add this useEffect after the cleanup useEffect
  useEffect(() => {
    // Disconnect when roomId changes
    if (audioState.isConnected) {
      disconnectFromLiveKit();
    }
  }, [roomId]);

  // Handle participant disconnection
  audioState.room?.on(RoomEvent.ParticipantDisconnected, (participant) => {
    setRemoteParticipants((prev) => {
      const updated = new Map(prev);
      updated.delete(participant.identity);
      return updated;
    });
  });

  // Add this function to handle self-mute
  const handleToggleMute = useCallback(() => {
    if (audioState.room) {
      const localParticipant = audioState.room.localParticipant;
      const audioTracks = Array.from(
        localParticipant.trackPublications.values()
      ).filter((pub) => pub.kind === Track.Kind.Audio);

      audioTracks.forEach((publication) => {
        if (publication.track) {
          publication.track.mediaStreamTrack.enabled = audioState.isMuted;
        }
      });

      setAudioState((prev) => ({
        ...prev,
        isMuted: !prev.isMuted,
      }));
    }
  }, [audioState.room, audioState.isMuted]);

  // Add room mute handler
  const handleToggleRoomMute = useCallback(() => {
    setAudioState((prev) => ({
      ...prev,
      isRoomMuted: !prev.isRoomMuted,
    }));

    setRemoteParticipants((prev) => {
      const updated = new Map(prev);
      prev.forEach((participant, id) => {
        if (participant.audioTrack) {
          participant.audioTrack.mediaStreamTrack.enabled =
            audioState.isRoomMuted;
          updated.set(id, {
            ...participant,
            isMuted: !audioState.isRoomMuted,
          });
        }
      });
      return updated;
    });
  }, [audioState.isRoomMuted]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        audioState={audioState}
        onToggleAudio={handleToggleAudio}
        onToggleMute={handleToggleMute}
        onToggleRoomMute={handleToggleRoomMute}
        remoteParticipants={remoteParticipants}
        onToggleParticipantMute={handleToggleParticipantMute}
        onlinePlayers={onlinePlayers}
      />
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
