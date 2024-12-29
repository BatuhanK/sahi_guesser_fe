import React from "react";
import OneSignal from "react-onesignal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

interface OneSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneSignalModal: React.FC<OneSignalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handlePermissionRequest = async () => {
    try {
      const permission = await OneSignal.Notifications.requestPermission();
      if (permission) {
        const playerId = await OneSignal.User.PushSubscription.getId();
        if (playerId) {
          localStorage.setItem("oneSignalPlayerId", playerId);
        }
      }
      onClose();
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bildirim İzni</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-[var(--text-primary)]">
            Size özel fırsatları ve güncellemeleri kaçırmamak için bildirim izni
            vermeyi unutmayın!
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-primary)] hover:bg-[var(--hover-color)] rounded-lg transition-colors"
            >
              Daha Sonra
            </button>
            <button
              onClick={handlePermissionRequest}
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              İzin Ver
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
