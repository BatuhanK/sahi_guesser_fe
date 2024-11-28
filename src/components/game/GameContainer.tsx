import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Category, categoryApi } from "../../services/api";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import { CategorySelector } from "../CategorySelector";
import { RoundResults } from "../RoundResults";
import { Loader } from "../ui/Loader";
import { GameBoard } from "./GameBoard";

export const GameContainer: React.FC = () => {
  const {
    showResults,
    roundEndScores,
    correctPrice,
    currentListing,
    roomId,
    intermissionDuration,
  } = useGameStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryApi.getAll();
        setCategories(categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  async function handleCategorySelect(categorySlug: string) {
    setSelectedCategory(categorySlug);
    const rooms = await categoryApi.getRooms(categorySlug);
    if (rooms.length > 0) {
      socketService.joinRoom(rooms[0].id);
    } else {
      toast.error("Bu kategori için oda bulunamadı.");
    }
  }

  if (isLoading) {
    return <Loader text="Kategoriler yükleniyor..." />;
  }

  if (!currentListing && roomId) {
    return <Loader text="Oyun için kullanıcı bekleniyor..." />;
  }

  if (!roomId) {
    return (
      <CategorySelector
        categories={categories}
        onSelect={handleCategorySelect}
      />
    );
  }

  return (
    <>
      <GameBoard />
      {showResults && intermissionDuration && (
        <RoundResults
          scores={roundEndScores}
          correctPrice={correctPrice ?? 0}
          listing={currentListing!}
          onNextRound={() => {}}
          intermissionDuration={intermissionDuration}
        />
      )}
    </>
  );
};
