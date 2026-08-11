import { motion } from "framer-motion";
import { ChevronRight, Home, Users } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Category } from "../services/api";
import { CreatePrivateRoomModal } from "./CreatePrivateRoomModal";
import { MaintenanceModal } from "./ui/MaintenanceModal";
import { iconMap } from "./ui/iconmap";

interface CategorySelectorProps {
  categories: Category[];
  notSystemOnlinePlayerCount: number;
  onSelect: (categorySlug: string) => void;
  hasError?: boolean;
  /** "Özel oda oluştur" butonunun üstünde gösterilecek içerik (örn. yeni oyun banner'ı). */
  banner?: React.ReactNode;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  notSystemOnlinePlayerCount,
  onSelect,
  hasError = false,
  banner,
}) => {
  const [isCreatePrivateRoomModalOpen, setIsCreatePrivateRoomModalOpen] =
    useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(hasError);

  const { user } = useAuth();

  if (hasError) {
    return (
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
      />
    );
  }

  const totalOnline =
    categories.reduce((sum, c) => sum + (c.onlinePlayerCount || 0), 0) +
    notSystemOnlinePlayerCount;

  return (
    <div className="flex flex-col items-center gap-10 md:gap-14 pt-8 md:pt-14 pb-4">
      <div className="relative flex flex-col items-center gap-4 md:gap-5 px-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(var(--accent-rgb), 0.22), transparent)",
          }}
        />
        {totalOnline > 0 && (
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs md:text-sm font-medium text-[var(--text-secondary)] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success-text)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success-text)]" />
            </span>
            {totalOnline.toLocaleString("tr-TR")} oyuncu çevrimiçi
          </span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-primary)]"
        >
          sahi <span className="text-[var(--accent-color)]">kaça?</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative max-w-md text-base md:text-lg text-[var(--text-secondary)]"
        >
          Tahminini yap, rakiplerini geride bırak, zirveye otur.
        </motion.p>
      </div>

      <div className="w-full max-w-4xl px-4">
        <h2 className="mb-4 md:mb-6 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          Kategorini Seç
        </h2>

        {banner && <div className="w-full max-w-3xl mx-auto">{banner}</div>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-5 mt-16">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon || "home"] || Home;
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.06 }}
                onClick={() => onSelect(category.slug || "")}
                className="group relative flex flex-col items-start gap-3 md:gap-4 surface-card-interactive p-4 md:p-6 text-left"
              >
                <ChevronRight
                  size={18}
                  className="absolute right-4 top-4 -translate-x-1 text-[var(--accent-color)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
                <span className="flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent-color)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <IconComponent className="h-5 w-5 md:h-7 md:w-7" />
                </span>
                <span className="text-base md:text-lg font-semibold text-[var(--text-primary)]">
                  {category.name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-[var(--text-tertiary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-text)]" />
                  {category.onlinePlayerCount || 0} oyuncu
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5 my-6">
        <button
          onClick={() => {
            if (user) {
              setIsCreatePrivateRoomModalOpen(true);
            } else {
              toast.error("Lütfen giriş yapınız");
            }
          }}
          className="btn-accent px-8 py-3.5 text-base md:text-lg"
        >
          <Users className="h-5 w-5" />
          Özel Oda Oluştur
        </button>
        {notSystemOnlinePlayerCount > 0 && (
          <span className="text-xs text-[var(--text-tertiary)]">
            {notSystemOnlinePlayerCount} kişi özel odalarda oynuyor
          </span>
        )}
      </div>

      <CreatePrivateRoomModal
        isOpen={isCreatePrivateRoomModalOpen}
        onClose={() => setIsCreatePrivateRoomModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};
