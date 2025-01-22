import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  childrenClassName: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  childrenClassName,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="fixed inset-0 bg-black/50 " />
      <div className="relative z-50 w-full max-w-lg mx-4">
        <div className="bg-[var(--bg-primary)] rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className={`overflow-y-auto max-h-[80vh] ${childrenClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
