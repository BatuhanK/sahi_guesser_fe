import { X } from "lucide-react";

interface ContactFormProps {
  onClose: () => void;
}

export const ContactForm = ({ onClose }: ContactFormProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-[var(--bg-secondary)] rounded-lg max-w-2xl w-full p-6">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--hover-color)] transition-colors duration-200"
          title="Kapat"
        >
          <X size={18} className="text-[var(--text-secondary)]" />
        </button>

        <h1 className="text-3xl font-bold mb-6">İletişim</h1>
        {/* ... mevcut form içeriği ... */}
      </div>
    </div>
  );
}; 