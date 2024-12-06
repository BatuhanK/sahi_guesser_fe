import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatHeaderProps } from "../types";
import { OnlinePlayersList } from ".";

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onlinePlayers,
}) => {
  const [showOnlinePlayers, setShowOnlinePlayers] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-yellow-500" />
        <h2 className="font-medium text-gray-900">
          Sohbet
          <span
            className="text-gray-500 ml-1">
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