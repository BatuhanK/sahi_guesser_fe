import React from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../lib/utils";
import { ChatMessageProps, ChatMention } from "../types";
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
  isOwn,
  showTimestamp,
  currentUsername,
  onMentionClick,
}) => {
  const isMentioned = message.mentions?.some(
    (mention) => mention.username === currentUsername
  );
  const isAdmin = message.username === "batuhan";
  const isTucik = message.username === "Tucik";
  const isSystem = message.username === "system";

  if (isSystem) {
    return (
      <div className="mb-3">
        <div className={cn(
          "w-full rounded-lg px-4 py-2 text-sm",
          "bg-orange-100",
          "border-2 border-orange-200",
          "text-gray-600 font-medium text-center"
        )}>
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
                : isTucik
                ? "text-purple-600 font-bold"
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
            {isAdmin
              ? `${message.username} 👑`
              : isTucik
              ? `${message.username} 💜`
              : message.username}
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
            : isTucik
            ? "bg-gradient-to-r from-purple-300 via-pink-500 to-purple-500 text-white rounded-tr-none animate-pulse-slow"
            : isOwn
            ? "bg-yellow-400 text-white rounded-tr-none"
            : isMentioned
            ? "bg-yellow-50 text-gray-800 rounded-tl-none border-2 border-yellow-200 animate-pulse-subtle"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        <p
          className={cn(
            "break-words text-sm",
            (isAdmin || isTucik) && "font-medium"
          )}
        >
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