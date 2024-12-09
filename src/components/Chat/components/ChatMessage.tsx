import React from "react";
import { cn } from "../../../lib/utils";
import { ChatMention, ChatMessageProps } from "../types";
import { maskNumbers } from "../utils";

// Function to generate consistent color based on username
const getUsernameColor = (username: string) => {
  const colors = [
    "text-[#FF6B6B]", // Red
    "text-[#4ECDC4]", // Teal
    "text-[#45B7D1]", // Light Blue
    "text-[#96CEB4]", // Sage
    "text-[#D4A5A5]", // Rose
    "text-[#9B59B6]", // Purple
    "text-[#3498DB]", // Blue
    "text-[#2ECC71]", // Green
    "text-[#F1C40F]", // Yellow
    "text-[#E67E22]", // Orange
  ];

  // Simple hash function to get consistent index
  const hash = username.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

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

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUsername,
  onMentionClick,
}) => {
  const isAdmin = message.username === "batuhan";
  const isTucik = message.username === "Tucik";
  const isSystem = message.username === "system";

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
            "font-medium text-sm cursor-pointer",
            "break-all",
            isAdmin
              ? "text-[var(--error-text)] font-bold text-base"
              : isTucik
              ? "text-[var(--accent-color)] font-bold text-base"
              : getUsernameColor(message.username),
            "hover:opacity-80 transition-opacity"
          )}
          onClick={() => onMentionClick?.(message.username)}
          role="button"
          tabIndex={0}
          title={message.username}
        >
          {isAdmin
            ? `👑 ${message.username} 👑`
            : isTucik
            ? `💜 ${message.username} 💜`
            : message.username}
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
