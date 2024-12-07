import React, { useState } from "react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { EMOJI_MAP } from "../utils";

export const EmojiHelp: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isDesktop) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowHelp(!showHelp)}
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        ?
      </button>

      {showHelp && (
        <div className="absolute bottom-full left-0 mb-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-64">
          <h4 className="font-medium mb-2">Emoji Kısayolları</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(EMOJI_MAP).map(([shortcut, emoji]) => (
              <div key={shortcut} className="flex items-center gap-2">
                <code className="bg-gray-100 px-1 rounded">{shortcut}</code>
                <span>{emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 