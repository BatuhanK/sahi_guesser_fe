import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useAuth } from "../../hooks/useAuth";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import { Chat } from "../Chat";
import { GuessStatus } from "../GuessStatus";
import { PlayersList } from "../PlayersList";
import { PriceInput } from "../PriceInput";

export const GameBoard: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    currentListing,
    roomId,
    hasCorrectGuess,
    feedback,
    chatMessages,
    onlinePlayers,
    lastGuesses,
  } = useGameStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (feedback === "correct") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    } else if (feedback === "go_higher" || feedback === "go_lower") {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleGuess = (guess: number) => {
    if (!currentListing || !isAuthenticated || !roomId) return;
    socketService.submitGuess(roomId, guess);
  };

  if (!currentListing) return null;

  function handleSendMessage(message: string): void {
    if (!isAuthenticated || !roomId) return;
    socketService.sendMessage(roomId, message);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.3} />
      )}
      <div className="col-span-8 space-y-6">
        <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
          <img
            src={currentListing.details.imageUrls[0]}
            alt="Property"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{currentListing.title}</h2>
              <p className="text-lg">
                {currentListing.details.brand} {currentListing.details.model}{" "}
                {currentListing.details.year}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <PriceInput
            onGuess={handleGuess}
            disabled={!isAuthenticated || hasCorrectGuess}
          />
          {!isAuthenticated && (
            <p className="text-red-500">
              Tahmin yapabilmek için giriş yapmalısınız
            </p>
          )}
          {feedback && (
            <div className={shake ? "animate-shake" : ""}>
              <GuessStatus
                feedback={feedback}
                type={feedback === "correct" ? "success" : "error"}
              />
            </div>
          )}
        </div>

        <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
      </div>

      <div className="col-span-4 space-y-6">
        <PlayersList onlinePlayers={onlinePlayers} lastGuesses={lastGuesses} />
      </div>
    </div>
  );
};
