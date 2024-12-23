import React, { KeyboardEvent, useState } from "react";
import { Button } from "../../ui/Button";

interface TextInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onGuess, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onGuess(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Type your answer..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className="px-6 py-2"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
