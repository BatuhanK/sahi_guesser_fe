import React, { useCallback, useEffect, useState } from "react";
import { formatPrice, parsePrice } from "../utils/priceFormatter";

interface PriceInputProps {
  onGuess: (guess: number) => void;
  disabled?: boolean;
  listingType: string;
  listingId: number;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  onGuess,
  disabled,
  listingType,
  listingId,
}) => {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    setPrice(0);
  }, [listingId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(parsePrice(e.target.value));
  };

  const adjustPrice = useCallback((amount: number) => {
    setPrice((prevPrice) => Math.max(0, prevPrice + amount));
  }, []);

  const getAdjustmentAmounts = useCallback(() => {
    if (listingType === "car") {
      return price >= 1000000 ? [100000, 50000, 25000] : [50000, 25000, 5000];
    } else if (listingType === "letgo") {
      return [1000, 500, 100];
    } else if (listingType === "house-for-rent") {
      if (price >= 100_000) {
        return [10000, 5000, 2500];
      } else if (price >= 50_000) {
        return [5000, 2500, 1000];
      } else {
        return [2500, 1000, 500];
      }
    } else {
      return [1000, 500, 100];
    }
  }, [price, listingType]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const amounts = getAdjustmentAmounts();
      const smallestAmount = amounts[amounts.length - 1];

      if (e.key === "ArrowUp") {
        e.preventDefault();
        adjustPrice(smallestAmount);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        adjustPrice(-smallestAmount);
      }
    },
    [getAdjustmentAmounts, adjustPrice]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price > 0) {
      onGuess(price);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="text-[var(--text-secondary)] text-base lg:text-lg font-medium">
              ₺
            </span>
          </div>
          <input
            type="text"
            value={formatPrice(price)}
            onChange={handleInputChange}
            disabled={disabled}
            className={`w-full pl-10 pr-20 py-4 text-lg lg:text-xl bg-[var(--bg-secondary)] border-2 
              ${
                disabled
                  ? "border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                  : "border-[var(--accent-color)]"
              }
              rounded-xl focus:outline-none focus:border-[var(--accent-hover)] transition-colors
              font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]`}
            placeholder="Tahmin et..."
          />
          <button
            type="submit"
            disabled={disabled || price === 0}
            className={`absolute right-2 top-1/2 -translate-y-1/2 
              ${
                disabled || price === 0
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

      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-3 gap-2">
          {getAdjustmentAmounts().map((amount) => (
            <button
              key={`pos-${amount}`}
              onClick={() => adjustPrice(amount)}
              disabled={disabled}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  disabled
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    : "bg-[var(--success-bg)] text-[var(--success-text)] hover:bg-[var(--success-bg)]/80 active:scale-95"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lg:w-4 lg:h-4"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {formatPrice(amount)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {getAdjustmentAmounts().map((amount) => (
            <button
              key={`neg-${amount}`}
              onClick={() => adjustPrice(-amount)}
              disabled={disabled}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  disabled
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    : "bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-bg)]/80 active:scale-95"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lg:w-4 lg:h-4"
              >
                <path d="M5 12h14" />
              </svg>
              {formatPrice(amount)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
