import { Home } from "lucide-react";
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
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  notSystemOnlinePlayerCount,
  onSelect,
  hasError = false,
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 md:gap-8">
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
        Kategori Seç
      </h2>
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 px-4">
        {categories.map((category) => {
          const IconComponent =
            iconMap[category.icon?.toLowerCase() || "home"] || Home;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.slug || "")}
              className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-8 bg-[var(--bg-secondary)] rounded-xl shadow-lg 
                hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105
                w-[140px] md:w-auto"
            >
              <IconComponent
                size={32}
                className="text-[var(--accent-color)] md:h-12 md:w-12"
              />
              <span className="text-lg md:text-xl font-medium text-[var(--text-primary)]">
                {category.name}
              </span>
              <span className="text-xs md:text-sm text-[var(--text-tertiary)]">
                {category.onlinePlayerCount || 0} oyuncu
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 my-12">
        <button
          onClick={() => {
            if (user) {
              setIsCreatePrivateRoomModalOpen(true);
            } else {
              toast.error("Lütfen giriş yapınız");
            }
          }}
          className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] 
            transition-colors duration-200 font-medium text-lg shadow-md hover:shadow-lg"
        >
          Özel oda oluştur
        </button>
        <span className="text-xs text-[var(--text-tertiary)] opacity-75">
          {notSystemOnlinePlayerCount > 0 &&
            `${notSystemOnlinePlayerCount} kişi özel odalarda oynuyor`}
          {notSystemOnlinePlayerCount === 0 && ""}
        </span>
      </div>

      <CreatePrivateRoomModal
        isOpen={isCreatePrivateRoomModalOpen}
        onClose={() => setIsCreatePrivateRoomModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};
