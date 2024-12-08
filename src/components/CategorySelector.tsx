import {
  BedDouble,
  Bike,
  Car,
  Home,
  LucideIcon,
  ShoppingBasket,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Category } from "../services/api";
import { CreatePrivateRoomModal } from "./CreatePrivateRoomModal";

interface CategorySelectorProps {
  categories: Category[];
  onSelect: (categorySlug: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  car: Car,
  letgo: ShoppingBasket,
  motocycle: Bike,
  hotel: BedDouble,
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onSelect,
}) => {
  const [isCreatePrivateRoomModalOpen, setIsCreatePrivateRoomModalOpen] =
    useState(false);

  const { user } = useAuth();

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

      <button
        onClick={() => {
          if (user) {
            setIsCreatePrivateRoomModalOpen(true);
          } else {
            toast.error("Lütfen giriş yapınız");
          }
        }}
        className="mt-8 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] 
          transition-colors duration-200 font-medium text-lg shadow-md hover:shadow-lg"
      >
        Özel oda oluştur
      </button>

      <CreatePrivateRoomModal
        isOpen={isCreatePrivateRoomModalOpen}
        onClose={() => setIsCreatePrivateRoomModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};
