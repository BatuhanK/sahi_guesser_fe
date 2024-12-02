import { Car, Home, LucideIcon, ShoppingBag } from "lucide-react";
import React from "react";
import { Category } from "../services/api";

interface CategorySelectorProps {
  categories: Category[];
  onSelect: (categorySlug: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  car: Car,
  letgo: ShoppingBag,
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onSelect,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 md:gap-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
        Kategori Seç
      </h2>
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 px-4">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon.toLowerCase()] || Home;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.slug)}
              className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-8 bg-white rounded-xl shadow-lg 
                hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105
                w-[140px] md:w-auto"
            >
              <IconComponent
                size={32}
                className="text-yellow-400 md:h-12 md:w-12"
              />
              <span className="text-lg md:text-xl font-medium">
                {category.name}
              </span>
              <span className="text-xs md:text-sm text-gray-500">
                {category.onlinePlayerCount} oyuncu
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
