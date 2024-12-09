import { AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
}) => {
  const [countdown, setCountdown] = useState(30);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleClick = () => {
    if (!isEnabled) return;
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle size={48} className="text-yellow-500" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Şuan bir sorun yaşıyoruz
          </h2>
          <p className="text-center text-[var(--text-secondary)]">
            Serverlarımıza ulaşılamıyor, lütfen daha sonra tekrar dener misin?
          </p>
          <button
            onClick={handleClick}
            disabled={!isEnabled}
            className={`mt-4 px-6 py-2 rounded-lg transition-colors duration-200 font-medium
              ${
                isEnabled
                  ? "bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white"
                  : "bg-gray-400 cursor-not-allowed text-gray-200"
              }`}
          >
            Tamam {!isEnabled && `(${countdown})`}
          </button>
        </div>
      </div>
    </div>
  );
};
