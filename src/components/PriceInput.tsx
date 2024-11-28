import { ArrowRight, Minus, Plus } from "lucide-react";
import React, { useRef, useState } from "react";

interface PriceInputProps {
  onGuess: (guess: number) => void;
  disabled?: boolean;
  listingType: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  onGuess,
  disabled,
  listingType,
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value.replace(/[^0-9]/g, ""));
    if (!isNaN(numericValue)) {
      onGuess(numericValue);
    }
  };

  const formatNumber = (
    input: string,
    cursorPosition: number | null = null
  ) => {
    const numbers = input.replace(/[^0-9]/g, "");
    if (numbers === "") return "";

    const formatted = new Intl.NumberFormat("tr-TR").format(parseInt(numbers));

    if (cursorPosition !== null && inputRef.current) {
      const digitsBeforeCursor = input
        .slice(0, cursorPosition)
        .replace(/\./g, "").length;
      let newPosition = 0;
      let digitCount = 0;

      for (
        let i = 0;
        i < formatted.length && digitCount < digitsBeforeCursor;
        i++
      ) {
        if (formatted[i] !== ".") digitCount++;
        newPosition = i + 1;
      }

      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      });
    }

    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Only format if the input contains valid characters
    if (/^[\d.,]*$/.test(input)) {
      setValue(formatNumber(input, cursorPosition));
    }
  };

  const adjustValue = (amount: number) => {
    const currentValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    const newValue = Math.max(0, currentValue + amount);
    setValue(formatNumber(newValue.toString()));
  };

  const QuickActionButton: React.FC<{ amount: number }> = ({ amount }) => {
    const isAddition = amount > 0;
    const formattedAmount = new Intl.NumberFormat("tr-TR").format(
      Math.abs(amount)
    );

    return (
      <button
        type="button"
        onClick={() => adjustValue(amount)}
        disabled={disabled}
        className={`flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all
          ${
            disabled
              ? "bg-gray-100 text-gray-400"
              : isAddition
              ? "bg-green-100 text-green-700 hover:bg-green-200 active:scale-95"
              : "bg-red-100 text-red-700 hover:bg-red-200 active:scale-95"
          }`}
      >
        {isAddition ? (
          <Plus size={12} className="lg:w-4 lg:h-4" />
        ) : (
          <Minus size={12} className="lg:w-4 lg:h-4" />
        )}
        {formattedAmount}
      </button>
    );
  };

  return (
    <div className="w-full max-w-md space-y-2 lg:space-y-3">
      <div className="flex gap-1.5 lg:gap-2">
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <QuickActionButton amount={listingType === "car" ? -1000 : -500} />
          <QuickActionButton amount={listingType === "car" ? -10000 : -1000} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 lg:pl-4 pointer-events-none">
              <span className="text-gray-500 text-base lg:text-lg font-medium">
                ₺
              </span>
            </div>
            <input
              autoFocus
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              className={`w-full pl-8 lg:pl-10 pr-16 lg:pr-20 py-3 lg:py-4 text-lg lg:text-xl bg-white border-2 
                ${disabled ? "border-gray-200 bg-gray-50" : "border-yellow-400"}
                rounded-xl focus:outline-none focus:border-yellow-500 transition-colors
                font-medium placeholder:text-gray-400`}
              placeholder="Tahmin et..."
              disabled={disabled}
            />
            <button
              type="submit"
              disabled={disabled || !value}
              className={`absolute right-2 top-1/2 -translate-y-1/2 
                ${
                  disabled || !value
                    ? "bg-gray-300"
                    : "bg-yellow-400 hover:bg-yellow-500 active:scale-95"
                }
                text-white p-1.5 lg:p-2 rounded-lg transition-all`}
            >
              <ArrowRight size={20} className="lg:w-6 lg:h-6" />
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-1.5 lg:gap-2">
          <QuickActionButton amount={listingType === "car" ? 1000 : 500} />
          <QuickActionButton amount={listingType === "car" ? 10000 : 1000} />
        </div>
      </div>

      <div className="flex justify-center gap-1.5 lg:gap-2">
        <QuickActionButton amount={listingType === "car" ? -100000 : -10000} />
        <QuickActionButton amount={listingType === "car" ? 100000 : 10000} />
      </div>
    </div>
  );
};
