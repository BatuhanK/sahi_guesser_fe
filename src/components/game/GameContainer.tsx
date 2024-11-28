import React, { useEffect, useState } from "react";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import { CategorySelector } from "../CategorySelector";
import { RoundResults } from "../RoundResults";
import { Loader } from "../ui/Loader";
import { GameBoard } from "./GameBoard";
// import { GameOver } from "./GameOver";

export const GameContainer: React.FC = () => {
  const {
    showResults,
    roundEndScores,
    correctPrice,
    currentListing,
    roomId,
    intermissionDuration,
  } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<
    "HOME" | "CAR" | null
  >(null);

  function handleCategorySelect(category: "HOME" | "CAR") {
    setSelectedCategory(category);
    socketService.joinRoom(1);
  }

  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  // if (gameOver) {
  //   return <GameOver />;
  // }

  if (!currentListing && roomId) {
    return <Loader text="Oyun için kullanıcı bekleniyor..." />;
  }

  if (!roomId) {
    return <CategorySelector onSelect={handleCategorySelect} />;
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
