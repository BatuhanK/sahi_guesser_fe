import React from "react";
import { X } from "lucide-react";
import { OnlinePlayersListProps } from "../types";

export const OnlinePlayersList: React.FC<OnlinePlayersListProps> = ({
  players,
  isOpen,
  onClose,
}) => {
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