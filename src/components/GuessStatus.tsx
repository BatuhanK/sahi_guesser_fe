import { AlertCircle, CheckCircle, Info } from "lucide-react";
import React from "react";

interface GuessStatusProps {
  type: "success" | "error" | "info";
  feedback: "correct" | "go_higher" | "go_lower";
  roomQuestionType?: "text" | "price";
}

export const GuessStatus: React.FC<GuessStatusProps> = ({ feedback, type, roomQuestionType = "price" }) => {
  const icons = {
    success: <CheckCircle className="text-[var(--success-text)]" size={24} />,
    error: <AlertCircle className="text-[var(--error-text)]" size={24} />,
    info: <Info className="text-[var(--info-text)]" size={24} />,
  };

  const backgrounds = {
    success: "bg-[var(--success-bg)] border-[var(--success-text)]",
    error: "bg-[var(--error-bg)] border-[var(--error-text)]",
    info: "bg-[var(--info-bg)] border-[var(--info-text)]",
  };

  return (
    <div
      className={`w-full max-w-md p-3 lg:p-4 rounded-lg border ${backgrounds[type]} flex flex-col gap-1.5 lg:gap-2`}
    >
      <div className="flex items-center gap-1.5 lg:gap-2">
        <div className="w-5 h-5 lg:w-6 lg:h-6">{icons[type]}</div>
        <span className="text-sm lg:text-base font-medium text-[var(--text-primary)]">
          {feedback === "correct" && "Doğru tahmin ettin!"}
          {(feedback === "go_higher" || feedback === "go_lower") && (
            roomQuestionType === "text" ? (
              "Doğru değil, tekrar deneyin"
            ) : (
              <span>
                Daha <b className="text-[var(--error-text)]">{feedback === "go_higher" ? "yüksek" : "düşük"}</b> bir tahmin deneyin
              </span>
            )
          )}
        </span>
      </div>
    </div>
  );
};
