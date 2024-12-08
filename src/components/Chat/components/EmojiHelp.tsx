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
        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        ?
      </button>

      {showHelp && (
        <div className="absolute bottom-full left-0 mb-2 p-4 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--border-color)] w-64">
          <h4 className="font-medium mb-2 text-[var(--text-primary)]">
            Emoji Kısayolları
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(EMOJI_MAP).map(([shortcut, emoji]) => (
              <div key={shortcut} className="flex items-center gap-2">
                <code className="bg-[var(--bg-tertiary)] px-1 rounded text-[var(--text-primary)]">
                  {shortcut}
                </code>
                <span className="text-[var(--text-primary)]">{emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
