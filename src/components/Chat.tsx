import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { MessageCircle, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cn } from "../lib/utils";
import type { ChatMessage } from "../types";
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

const ChatMessage: React.FC<{
  message: ChatMessage;
  isOwn: boolean;
  showTimestamp: boolean;
}> = ({ message, isOwn, showTimestamp }) => (
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
        "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
        isOwn
          ? "bg-yellow-400 text-white rounded-tr-none"
          : "bg-gray-100 text-gray-800 rounded-tl-none"
      )}
    >
      <p className="break-words text-sm">{message.message}</p>
    </div>
  </div>
);

const ChatInput: React.FC<{
  onSubmit: (message: string) => void;
}> = ({ onSubmit }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-none sticky bottom-0 p-3 lg:p-3 border-t border-gray-100 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80"
    >
      <div className="flex gap-2 items-center max-w-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSubmit={onSendMessage} />
    </div>
  );
};
