import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactConfetti from "react-confetti";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analytics";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import { Chat } from "../Chat";
import { PlayersList } from "../PlayersList";
import { Popover } from "../Popover";
import { PriceInput } from "../PriceInput";
import { RoundResults } from "../RoundResults";
import {
  FeedbackMessage,
  GuessMessage,
  GuessProgressBar,
} from "./components/GuessComponents";
import ImageNavigation from "./components/ImageNavigation";
import {
  CarDetails,
  HotelsDetails,
  LetgoDetails,
  PropertyDetails,
} from "./components/ListingDetails";
import { GameOver } from "./GameOver";

// Constants
const SLIDESHOW_INTERVAL = 3000;
const CONFETTI_DURATION = 5000;

export const GameBoard: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideshowTimerRef = useRef<NodeJS.Timeout>();

  const {
    currentListing,
    currentQuestion,
    roomId,
    hasCorrectGuess,
    feedback,
    chatMessages,
    onlinePlayers,
    lastGuesses,
    showResults,
    intermissionDuration,
    roundEndScores,
    correctPrice,
    room,
    guessCount,
    roomSummary,
  } = useGameStore();
  const { isAuthenticated, user } = useAuth();

  // Improved slideshow implementation using useRef
  const startSlideshow = useCallback(() => {
    if (!currentListing) return;

    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }

    slideshowTimerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === currentListing.details.imageUrls.length - 1
          ? 0
          : prevIndex + 1
      );
    }, SLIDESHOW_INTERVAL);
  }, [currentListing]);

  useEffect(() => {
    startSlideshow();
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [startSlideshow]);

  useEffect(() => {
    if (!currentListing?.details.imageUrls.length) return;
    setCurrentImageIndex(
      Math.floor(Math.random() * currentListing.details.imageUrls.length)
    );
  }, [currentListing?.id, currentListing?.details.imageUrls.length]);

  useEffect(() => {
    if (currentListing && room?.id) {
      analyticsService.trackGameStart(room.id.toString());
    }
  }, [currentListing?.id, room?.id]);

  useEffect(() => {
    if (feedback === "correct") {
      setShowConfetti(true);
      if (currentListing) {
        analyticsService.trackGuess(
          currentListing.id.toString(),
          true,
          guessCount
        );
      }
      const timer = setTimeout(() => setShowConfetti(false), CONFETTI_DURATION);
      return () => clearTimeout(timer);
    }
  }, [feedback, currentListing, guessCount]);

  useEffect(() => {
    if (showResults && correctPrice && roundEndScores.length > 0) {
      const userScore =
        roundEndScores.find((score) => score.playerId === user?.id)
          ?.userScore || 0;
      if (currentListing) {
        analyticsService.trackRoundEnd(
          currentListing.id.toString(),
          correctPrice,
          userScore
        );
      }
    }
  }, [showResults, correctPrice, roundEndScores, currentListing, user?.id]);

  const handleGuess = useCallback(
    (guess: number) => {
      if (!currentListing || !isAuthenticated || !roomId) return;
      socketService.submitGuess(roomId, guess);
      analyticsService.trackGuess(
        currentListing.id.toString(),
        false,
        guessCount + 1
      );
    },
    [currentListing, isAuthenticated, roomId, guessCount]
  );

  const imageHandlers = useMemo(
    () => ({
      handlePrevImage: () => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === 0
            ? (currentListing?.details.imageUrls.length ?? 1) - 1
            : prevIndex - 1
        );
        if (currentListing) {
          analyticsService.trackImageNavigation(currentListing.id.toString());
        }
        startSlideshow();
      },
      handleNextImage: () => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === (currentListing?.details.imageUrls.length ?? 1) - 1
            ? 0
            : prevIndex + 1
        );
        if (currentListing) {
          analyticsService.trackImageNavigation(currentListing.id.toString());
        }
        startSlideshow();
      },
    }),
    [currentListing, startSlideshow]
  );

  const handleSendMessage = useCallback(
    (message: string): void => {
      if (!isAuthenticated || !roomId || !user?.id) return;

      try {
        window.sa_event?.("chat_message", {
          user_id: user.id,
          room_id: roomId,
        });
      } catch (e) {
        console.error("Error sending chat message:", e);
      }

      socketService.sendMessage(roomId, message);
    },
    [isAuthenticated, roomId, user?.id]
  );

  const renderListingDetails = useCallback(() => {
    if (!currentListing) return null;

    switch (currentListing.details.type) {
      case "car":
        return <CarDetails details={currentListing.details} />;
      case "house-for-rent":
        return <PropertyDetails details={currentListing.details} />;
      case "house-for-sale":
        return <PropertyDetails details={currentListing.details} />;
      case "letgo":
        return <LetgoDetails details={currentListing.details} />;
      case "hotels":
        return <HotelsDetails details={currentListing.details} />;
      default:
        return null;
    }
  }, [currentListing]);

  if (!currentListing && !currentQuestion) return null;

  const maxGuessExceeded =
    guessCount >= (room?.roomSettings.maxGuessesPerRound ?? 20);

  if (roomSummary) {
    return <GameOver />;
  }

  return (
    <div className="game-board max-w-[1920px] mx-auto px-4 lg:px-8 flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-10 gap-6 lg:gap-8 mb-6">
        {showConfetti && (
          <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.3} />
        )}

        {/* Center - Main Content */}
        <div className="md:col-span-2 lg:col-span-2 xl:col-span-6 space-y-4 lg:space-y-6 order-1 xl:order-1">
          {showResults && intermissionDuration && currentListing ? (
            <RoundResults
              scores={roundEndScores}
              correctPrice={correctPrice ?? 0}
              listing={currentListing}
              intermissionDuration={intermissionDuration}
            />
          ) : (
            <div className="bg-[var(--bg-secondary)] rounded-xl shadow-lg transition-colors">
              {/* Image Section */}
              <div className="relative">
                <div className="relative aspect-[16/10] w-full max-h-[500px]">
                  <img
                    src={currentListing?.details.imageUrls[currentImageIndex]}
                    onContextMenu={(e) => e.preventDefault()}
                    alt="Listing image"
                    className="w-full h-full object-contain transition-opacity duration-500 rounded-t-xl"
                  />
                  <ImageNavigation
                    currentIndex={currentImageIndex}
                    totalImages={currentListing?.details.imageUrls.length ?? 0}
                    onPrev={imageHandlers.handlePrevImage}
                    onNext={imageHandlers.handleNextImage}
                  />
                </div>
              </div>
              {/* Details Section - Moved outside of image container */}
              {currentListing ? (
                <div className="p-3 lg:p-4 space-y-2">
                  {currentListing.title &&
                    (currentListing.details.type === "letgo" ? (
                      <Popover
                        key={currentListing.id}
                        content={currentListing.details.description}
                      >
                        <h2 className="text-lg lg:text-2xl font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)] px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg inline-block">
                          {currentListing.title}
                        </h2>
                      </Popover>
                    ) : (
                      <h2 className="text-lg lg:text-2xl font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)] px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg inline-block">
                        {currentListing.title}
                      </h2>
                    ))}
                  <div className="text-sm lg:text-base bg-[var(--bg-secondary)] px-3 py-2 lg:px-4 lg:py-3 rounded-lg">
                    {renderListingDetails()}
                  </div>
                </div>
              ) : null}

              {/* Price Guess Section */}
              <div className="p-4 lg:p-6 border-t-2 border-[var(--border-color)]">
                <div className="flex flex-col items-center">
                  {currentListing ? (
                    <PriceInput
                      onGuess={handleGuess}
                      disabled={
                        !isAuthenticated ||
                        hasCorrectGuess ||
                        showResults ||
                        maxGuessExceeded
                      }
                      listingType={currentListing?.details.type || "generative"}
                      listingId={currentListing?.id || 0}
                    />
                  ) : null}

                  <div className="w-full max-w-md space-y-2 lg:space-y-4 mt-4">
                    {room?.roomSettings.maxGuessesPerRound && (
                      <GuessProgressBar
                        current={guessCount}
                        max={room.roomSettings.maxGuessesPerRound}
                      />
                    )}

                    <div className="h-[32px] lg:h-[60px] flex items-center justify-center">
                      {!isAuthenticated || maxGuessExceeded ? (
                        <GuessMessage
                          isAuthenticated={isAuthenticated}
                          maxGuessExceeded={maxGuessExceeded}
                        />
                      ) : (
                        <FeedbackMessage
                          feedback={
                            feedback as
                              | "correct"
                              | "go_higher"
                              | "go_lower"
                              | null
                          }
                          showResults={showResults}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Left Side - Players List */}
        <div className="hidden xl:block xl:col-span-4 order-3 xl:order-3">
          <div className="xl:sticky xl:top-6">
            <div className="bg-white rounded-xl shadow-lg overflow-auto h-[calc(100vh-15rem)] scrollbar-hide">
              <PlayersList
                onlinePlayers={onlinePlayers}
                lastGuesses={lastGuesses}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Chat */}
      <div>
        <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};
