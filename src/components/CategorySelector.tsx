import { Car, Home } from "lucide-react";
import React from "react";

interface CategorySelectorProps {
  onSelect: (category: "HOME" | "CAR") => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelect,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <h2 className="text-3xl font-bold text-gray-800">Kategori Seç</h2>
      <div className="flex gap-6">
        <button
          onClick={() => onSelect("HOME")}
          className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <Home size={48} className="text-yellow-400" />
          <span className="text-xl font-medium">Ev</span>
        </button>
        <button
          onClick={() => onSelect("CAR")}
          className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <Car size={48} className="text-yellow-400" />
          <span className="text-xl font-medium">Araba</span>
        </button>
      </div>
    </div>
  );
};
