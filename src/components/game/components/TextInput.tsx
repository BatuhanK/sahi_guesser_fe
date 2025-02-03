import React, { useState } from "react";

interface TextInputProps {
  onGuess: (answer: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onGuess, disabled }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onGuess(answer.trim());
      setAnswer("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-4 text-lg lg:text-xl bg-[var(--bg-secondary)] border-2 
              ${
                disabled
                  ? "border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                  : "border-[var(--accent-color)]"
              }
              rounded-xl focus:outline-none focus:border-[var(--accent-hover)] transition-colors
              font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]`}
            placeholder="Cevabınızı yazın..."
          />
          <button
            type="submit"
            disabled={disabled || !answer.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 
              ${
                disabled || !answer.trim()
                  ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                  : "bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] active:scale-95 text-white"
              }
              p-3 lg:p-2 rounded-lg transition-all touch-manipulation`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lg:w-6 lg:h-6"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
