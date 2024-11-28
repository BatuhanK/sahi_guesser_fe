import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import type { ChatMessage } from "../types";
import type { User } from "../types/auth";

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

function isOwnMessage(message: ChatMessage, user: User | null) {
  return String(message.userId) === String(user?.id);
}

function shouldShowTimestamp(messages: ChatMessage[], index: number) {
  if (index === 0) return true;
  const currentMsg = messages[index];
  const prevMsg = messages[index - 1];

  // Show timestamp if messages are from different users or if more than 5 minutes apart
  return (
    prevMsg.userId !== currentMsg.userId ||
    currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() > 5 * 60 * 1000
  );
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col h-[400px] border border-gray-200">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages?.map((msg, index) => {
          const isOwn = isOwnMessage(msg, user);
          const showTimestamp = shouldShowTimestamp(messages, index);

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col",
                isOwn ? "items-end" : "items-start"
              )}
            >
              {showTimestamp && (
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isOwn ? "text-yellow-600" : "text-gray-700"
                    )}
                  >
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(msg.timestamp, {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  isOwn
                    ? "bg-yellow-400 text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                )}
              >
                <p className="break-words">{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="flex-1 rounded-full border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={cn(
            "bg-yellow-400 text-white p-2.5 rounded-full hover:bg-yellow-500 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          )}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
