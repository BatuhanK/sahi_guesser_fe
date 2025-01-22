import { Ban } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { cn } from "../../../lib/utils";
import { useGameStore } from "../../../store/gameStore";
import { ChatMention, ChatMessageProps } from "../types";
import { maskNumbers } from "../utils";

const renderMessageWithMentions = (
  message: string,
  mentions?: ChatMention[],
  currentUsername?: string | null
) => {
  if (!mentions?.length) {
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

      if (start > lastIndex) {
        const textBeforeMention = message.slice(lastIndex, start);
        result.push(maskNumbers(textBeforeMention));
      }

      result.push(
        <span
          key={`mention-${mention.userId}`}
          className={cn(
            "px-1 rounded font-medium",
            isSelfMention
              ? "bg-[var(--warning-bg)] text-[var(--warning-text)]"
              : "bg-[var(--warning-muted)] text-[var(--warning-text)]",
            "animate-highlight"
          )}
        >
          @{mention.username}
        </span>
      );

      lastIndex = end;
    });

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

// Function to get score-based effects for username
const getScoreBasedEffects = (score: number) => {
  if (score >= 1_000_000) {
    return {
      className: cn(
        "font-black text-transparent bg-clip-text",
        "bg-[linear-gradient(45deg,#FF0000,#FF4500,#FF8C00,#FFD700,#FF0000)]",
        "bg-[length:200%_auto] animate-flow-fast",
        "hover:scale-110 transform transition-transform",
        "drop-shadow-[0_0_10px_rgba(255,69,0,0.5)]"
      ),
      prefix: "🔥",
      suffix: "🔥",
    };
  }
  if (score >= 500_000) {
    return {
      className:
        "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 animate-shimmer hover:scale-105 transform transition-transform",
      prefix: "⭐",
      suffix: "⭐",
    };
  }
  if (score >= 100_000) {
    return {
      className:
        "font-bold text-transparent bg-clip-text animate-pulse bg-gradient-to-r from-emerald-400 to-cyan-400 hover:scale-105 transform transition-transform",
      prefix: "💎",
      suffix: "💎",
    };
  }
  if (score >= 30_000) {
    return {
      className:
        "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 hover:scale-105 transform transition-transform",
      prefix: "🌟",
      suffix: "🌟",
    };
  }
  if (score > 0) {
    return {
      className:
        "font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700 hover:scale-105 transform transition-transform",
      prefix: "⚡",
      suffix: "",
    };
  }
  return {
    className: "text-[#F1C40F] hover:scale-105 transform transition-transform",
    prefix: "🎮",
    suffix: "",
  };
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUsername,
  onMentionClick,
  onBanClick,
}) => {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "moderator";
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);
  const isAdmin = message.username === "batuhan";
  const isTucik = message.username === "Tucik";
  const isSystem = message.username === "system";
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [banDuration, setBanDuration] = useState<number | 'perma'>(5);

  const handleBanClick = (username: string) => {
    setSelectedUser(username);
    setBanDuration(5);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      if (banDuration === 'perma') {
        onBanClick?.(`${selectedUser} --minutes=-1`);
      } else {
        onBanClick?.(`${selectedUser} --minutes=${banDuration}`);
      }
      setSelectedUser(null);
    }
  };

  const playerScore =
    onlinePlayers.find((player) => player.username === message.username)
      ?.totalScore || 0;

  const scoreEffects = getScoreBasedEffects(playerScore);

  if (isSystem) {
    return (
      <div className="my-2">
        <div
          className={cn(
            "w-full rounded-lg px-4 py-2 text-sm",
            "bg-[var(--warning-bg)]",
            "border-2 border-[var(--warning-text)]",
            "text-[var(--text-primary)] font-medium text-center"
          )}
        >
          {renderMessageWithMentions(
            message.message,
            message.mentions,
            currentUsername
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col mb-1">
        <div className="flex items-center gap-2">
          {isStaff && message.username !== user?.username && !isSystem && (
            <button
              onClick={() => handleBanClick(message.username)}
              className="inline-flex items-center justify-center p-1 rounded-full transition-colors hover:bg-red-100 -ml-1"
            >
              <Ban className="w-3.5 h-3.5 text-red-500" />
            </button>
          )}
          <span
            className={cn(
              "font-medium text-sm cursor-pointer break-all",
              isAdmin
                ? "text-[var(--error-text)] font-bold text-base"
                : isTucik
                ? "text-[var(--accent-color)] font-bold text-base"
                : scoreEffects.className,
              "hover:opacity-80 transition-opacity"
            )}
            onClick={() => onMentionClick?.(message.username)}
            role="button"
            tabIndex={0}
            title={`${message.username} (${playerScore.toLocaleString()} puan)`}
          >
            {isAdmin
              ? `👑👑 ${message.username}`
              : isTucik
              ? `💜 ${message.username} 💜`
              : `${scoreEffects.prefix} ${message.username} ${scoreEffects.suffix}`}
          </span>
          <span
            className={cn(
              "text-[var(--text-primary)] break-words flex-1",
              isAdmin || isTucik ? "text-base font-medium" : "text-sm",
              message.isRejected && "line-through opacity-50"
            )}
          >
            {renderMessageWithMentions(
              message.message,
              message.mentions,
              currentUsername
            )}
          </span>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedUser} adlı kullanıcı banlanacak
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Kaç dakika?</label>
              <div className="flex gap-2">
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value === 'perma' ? 'perma' : Number(e.target.value))}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="5">5 dakika</option>
                  <option value="10">10 dakika</option>
                  <option value="30">30 dakika</option>
                  <option value="60">1 saat</option>
                  <option value="1440">24 saat</option>
                  <option value="perma">Perma Ban</option>
                </select>
              </div>
            </div>
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
