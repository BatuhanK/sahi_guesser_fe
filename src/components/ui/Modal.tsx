import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          {title && (
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--hover-color)] rounded-full transition-colors text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
