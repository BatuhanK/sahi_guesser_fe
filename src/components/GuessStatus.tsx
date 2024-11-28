import { AlertCircle, CheckCircle, Info } from "lucide-react";
import React from "react";

interface GuessStatusProps {
  type: "success" | "error" | "info";
  feedback: "correct" | "go_higher" | "go_lower";
}

export const GuessStatus: React.FC<GuessStatusProps> = ({ feedback, type }) => {
  const icons = {
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />,
  };

  const backgrounds = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`w-full max-w-md p-4 rounded-lg border ${backgrounds[type]} flex flex-col gap-2`}
    >
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="font-medium">
          {feedback === "correct" && "Doğru tahmin ettin!"}
          {feedback === "go_higher" && (
            <span>
              Daha <b>yüksek</b> bir tahmin deneyin
            </span>
          )}
          {feedback === "go_lower" && (
            <span>
              Daha <b>düşük</b> bir tahmin deneyin
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
