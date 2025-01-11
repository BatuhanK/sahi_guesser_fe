import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const isIOS = false;
const isAndroid = /Android/.test(navigator.userAgent);

const DAILY_SHOW_LIMIT = 8;

const getDailyShowCount = () => {
  const lastResetTimestamp = localStorage.getItem("mobileAppModalLastReset");
  const now = Date.now();

  // If no last reset timestamp or it's a new day, reset the counter
  if (!lastResetTimestamp || now - parseInt(lastResetTimestamp) >= 24 * 60 * 60 * 1000) {
    localStorage.setItem("mobileAppModalLastReset", now.toString());
    localStorage.setItem("mobileAppModalShows", DAILY_SHOW_LIMIT.toString());
    return DAILY_SHOW_LIMIT;
  }

  // Return current count for today
  return parseInt(localStorage.getItem("mobileAppModalShows") || DAILY_SHOW_LIMIT.toString());
};

export const MobileAppModal: React.FC<MobileAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [remainingShows, setRemainingShows] = useState(getDailyShowCount);
  const [canDismiss, setCanDismiss] = useState(false);
  const [dismissTimer, setDismissTimer] = useState(5);

  useEffect(() => {
    if (!isOpen || !isIOS && !isAndroid) return;

    // Check and update daily counter
    const currentCount = getDailyShowCount();
    const newCount = currentCount - 1;
    setRemainingShows(newCount);
    localStorage.setItem("mobileAppModalShows", newCount.toString());

    // Reset dismiss state when modal opens
    setCanDismiss(false);
    setDismissTimer(5);

    // Start countdown timer
    const timer = setInterval(() => {
      setDismissTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanDismiss(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isIOS && !isAndroid) return null;
  if (remainingShows <= 0) return null;

  const appStoreUrl = "https://apps.apple.com/app/your-app-id";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.sahikaca.tr";

  const handleAppStoreClick = () => {
    window.location.href = isIOS ? appStoreUrl : playStoreUrl;
    onClose();
  };

  const handleClose = () => {
    if (canDismiss) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Mobil Uygulamamızı Deneyin!</DialogTitle>
          <button
            onClick={handleClose}
            disabled={!canDismiss}
            className={`absolute right-4 top-4 transition-colors ${
              canDismiss
                ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] cursor-not-allowed"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-[var(--text-primary)]">
            Daha iyi bir deneyim için mobil uygulamamızı indirin! {isIOS ? "iOS" : "Android"} cihazınızda en iyi performansı yakalayın.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={!canDismiss}
              className={`px-4 py-2 rounded-lg transition-colors ${
                canDismiss
                  ? "text-[var(--text-primary)] hover:bg-[var(--hover-color)]"
                  : "text-[var(--text-tertiary)] cursor-not-allowed"
              }`}
            >
              {canDismiss ? "Kapat" : `(${dismissTimer}s) Kapat`}
            </button>
            <button
              onClick={handleAppStoreClick}
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              {isIOS ? "App Store'da Aç" : "Play Store'da Aç"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 