import { Ban } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { cn } from "../../../lib/utils";
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

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUsername,
  onMentionClick,
  onBanClick,
}) => {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "moderator";
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
      <div className="px-2 py-1 rounded-md">
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
              "text-[var(--text-primary)]",
              "hover:opacity-80 transition-opacity"
            )}
            onClick={() => onMentionClick?.(message.username)}
            role="button"
            tabIndex={0}
          >
            {message.username}
          </span>
          <span
            className={cn(
              "text-[var(--text-primary)] break-words flex-1",
              "text-sm",
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
          <div className="surface-card p-6 max-w-sm w-full mx-4">
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
                className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--hover-color)] text-[var(--text-primary)] transition-colors"
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
