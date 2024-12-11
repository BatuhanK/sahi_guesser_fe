import React from "react";
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
}) => {
  const onlinePlayers = useGameStore((state) => state.onlinePlayers);
  const isAdmin = message.username === "batuhan";
  const isTucik = message.username === "Tucik";
  const isSystem = message.username === "system";

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
    <div className="flex flex-col mb-1">
      <div className="flex items-baseline gap-2">
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
            isAdmin || isTucik ? "text-base font-medium" : "text-sm"
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
  );
};
