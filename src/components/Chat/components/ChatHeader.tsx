import { MessageCircle } from "lucide-react";
import React, { useState } from "react";
import { OnlinePlayersList } from ".";
import { ChatHeaderProps } from "../types";

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onlinePlayers }) => {
  const [showOnlinePlayers, setShowOnlinePlayers] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-[var(--accent-color)]" />
        <h2 className="font-medium text-[var(--text-primary)]">
          Sohbet
          <span className="text-[var(--text-secondary)] ml-1">
            ({onlinePlayers.length})
          </span>
        </h2>
      </div>
      <OnlinePlayersList
        players={onlinePlayers}
        isOpen={showOnlinePlayers}
        onClose={() => setShowOnlinePlayers(false)}
      />
    </>
  );
};
