import { motion } from "framer-motion";
import {
  ArrowDown,
  Building2,
  Calendar,
  Car,
  Filter,
  Home,
  MapPin,
  Maximize,
  Move,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactConfetti from "react-confetti";
import { useAuth } from "../../hooks/useAuth";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import {
  CarListingDetails,
  HouseForRentListingDetails,
  LetgoListingDetails,
} from "../../types/socket";
import { Chat } from "../Chat";
import { GuessStatus } from "../GuessStatus";
import { PlayersList } from "../PlayersList";
import { Popover } from "../Popover";
import { PriceInput } from "../PriceInput";
import { RoundResults } from "../RoundResults";

export const GameBoard: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    currentListing,
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
  } = useGameStore();
  const { isAuthenticated } = useAuth();

  // Auto slideshow effect with reset capability
  useEffect(() => {
    if (!currentListing) return;

    const startSlideshow = () => {
      return setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === currentListing.details.imageUrls.length - 1
            ? 0
            : prevIndex + 1
        );
      }, 3000);
    };

    let interval = startSlideshow();

    // Expose the reset function to window for access from click handlers
    const resetTimer = () => {
      clearInterval(interval);
      interval = startSlideshow();
    };

    //@ts-expect-error windowa koyduk allah affetsin
    window._resetSlideshowTimer = resetTimer;

    return () => {
      clearInterval(interval);
      //@ts-expect-error windowa koyduk allah affetsin
      delete window._resetSlideshowTimer;
    };
  }, [currentListing]);

  // Reset image index when listing changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentListing?.id]);

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

  const handleGuess = useCallback(
    (guess: number) => {
      if (!currentListing || !isAuthenticated || !roomId) return;
      socketService.submitGuess(roomId, guess);
    },
    [currentListing, isAuthenticated, roomId]
  );

  // Memoize car details rendering
  const carDetails = useMemo(() => {
    if (currentListing?.details.type !== "car") return null;
    const details = currentListing.details as CarListingDetails;

    return (
      <div className="flex flex-wrap gap-2 lg:gap-4 text-sm lg:text-base">
        <div className="flex items-center gap-1 lg:gap-2">
          <Car className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>
            {details.brand} {details.model}
          </span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Calendar className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.year}</span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Zap className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.mileage} km</span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Filter className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.fuelType}</span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Move className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.transmission}</span>
        </div>
      </div>
    );
  }, [currentListing?.details]);

  // Memoize property details rendering
  const propertyDetails = useMemo(() => {
    if (currentListing?.details.type !== "house-for-rent") return null;
    const details = currentListing.details as HouseForRentListingDetails;

    return (
      <div className="flex flex-wrap gap-2 lg:gap-4 text-sm lg:text-base">
        <div className="flex items-center gap-1 lg:gap-2">
          <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>
            {details.city}, {details.district}
          </span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Home className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.rooms} oda</span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Maximize className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.squareMeters} m²</span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <Building2 className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>{details.buildingAge} yaşında</span>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          <ArrowDown className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Kat: {details.floor}</span>
        </div>
      </div>
    );
  }, [currentListing?.details]);

  const letgoDetails = useMemo(() => {
    if (currentListing?.details.type !== "letgo") return null;
    const details = currentListing.details as LetgoListingDetails;

    return (
      <div className="flex flex-wrap gap-2 lg:gap-3 text-sm lg:text-base">
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <MapPin className="h-4 w-4 lg:h-5 lg:w-5 mr-1.5" />
          <span>{details.city}</span>
        </div>

        {Object.entries(details.keyValues).map(([key, value], index) => (
          <div
            key={index}
            className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <span className="text-white/80 mr-1.5">{key}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    );
  }, [currentListing?.details]);

  // Memoize image navigation handlers
  const imageHandlers = useMemo(
    () => ({
      handlePrevImage: () => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === 0
            ? (currentListing?.details.imageUrls.length ?? 1) - 1
            : prevIndex - 1
        );
        //@ts-expect-error windowa koyduk allah affetsin
        window._resetSlideshowTimer?.();
      },
      handleNextImage: () => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === (currentListing?.details.imageUrls.length ?? 1) - 1
            ? 0
            : prevIndex + 1
        );
        //@ts-expect-error windowa koyduk allah affetsin
        window._resetSlideshowTimer?.();
      },
    }),
    [currentListing?.details.imageUrls.length, currentListing?.id]
  );

  const handleSendMessage = useCallback(
    (message: string): void => {
      if (!isAuthenticated || !roomId) return;
      socketService.sendMessage(roomId, message);
    },
    [isAuthenticated, roomId]
  );

  if (!currentListing) return null;

  const maxGuessExceeded =
    guessCount >= (room?.roomSettings.maxGuessesPerRound ?? 20);

  return (
    <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-12 gap-6 lg:gap-8">
        {showConfetti && (
          <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.3} />
        )}

        {/* Sol Taraf - Oyuncu Listesi */}
        <div className="hidden xl:block xl:col-span-3 order-2 xl:order-1">
          <div className="xl:sticky xl:top-6">
            <div className="bg-white rounded-xl shadow-lg overflow-auto h-[calc(100vh-15rem)]">
              <PlayersList
                onlinePlayers={onlinePlayers}
                lastGuesses={lastGuesses}
              />
            </div>
          </div>
        </div>

        {/* Orta - Ana İçerik */}
        <div className="md:col-span-1 lg:col-span-1 xl:col-span-5 space-y-4 lg:space-y-6 order-1 xl:order-2 flex flex-col md:h-[calc(100vh-8rem)] xl:h-[calc(100vh-15rem)]">
          {showResults && intermissionDuration ? (
            <RoundResults
              scores={roundEndScores}
              correctPrice={correctPrice ?? 0}
              listing={currentListing}
              intermissionDuration={intermissionDuration}
            />
          ) : (
            <div className="flex flex-col gap-4 lg:gap-6 h-full">
              <div className="relative rounded-xl bg-white shadow-lg">
                <div className="relative h-[250px] sm:h-[300px] md:h-[400px]">
                  <img
                    src={currentListing.details.imageUrls[currentImageIndex]}
                    onContextMenu={(e) => e.preventDefault()}
                    alt="Listing image"
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                  <button
                    onClick={imageHandlers.handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={imageHandlers.handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 lg:p-6">
                  <div className="text-white space-y-2 lg:space-y-3">
                    {currentListing.details.type === "letgo" ? (
                      <Popover
                        key={currentListing.id}
                        content={currentListing.details.description}
                      >
                        <h2 className="text-xl lg:text-2xl font-bold">
                          {currentListing.title}
                        </h2>
                      </Popover>
                    ) : (
                      <h2 className="text-xl lg:text-2xl font-bold">
                        {currentListing.title}
                      </h2>
                    )}
                    <div className="text-sm lg:text-base">
                      {currentListing.details.type === "letgo"
                        ? letgoDetails
                        : null}

                      {currentListing.details.type === "house-for-rent"
                        ? propertyDetails
                        : null}

                      {currentListing.details.type === "car"
                        ? carDetails
                        : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white rounded-xl shadow-lg p-4 lg:p-6 border-2 border-yellow-100 h-full">
                  <div className="flex flex-col items-center h-full pt-4 lg:pt-10">
                    <PriceInput
                      onGuess={handleGuess}
                      disabled={
                        !isAuthenticated ||
                        hasCorrectGuess ||
                        showResults ||
                        maxGuessExceeded
                      }
                      listingType={currentListing.details.type}
                      listingId={currentListing.id}
                    />

                    <div className="w-full max-w-md space-y-2 lg:space-y-4 mt-4 lg:mt-16">
                      {isAuthenticated &&
                        room?.roomSettings.maxGuessesPerRound && (
                          <div className="w-full flex items-center gap-1">
                            <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 transition-all duration-300"
                                style={{
                                  width: `${
                                    (guessCount /
                                      room.roomSettings.maxGuessesPerRound) *
                                    100
                                  }%`,
                                  backgroundColor:
                                    guessCount >=
                                    room.roomSettings.maxGuessesPerRound
                                      ? "#EF4444"
                                      : undefined,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 min-w-[60px] text-right">
                              {guessCount} /{" "}
                              {room.roomSettings.maxGuessesPerRound}
                            </span>
                          </div>
                        )}

                      <div className="h-[32px] lg:h-[60px] flex items-center justify-center">
                        {!isAuthenticated ? (
                          <p className="text-center text-red-500 text-sm lg:text-base bg-red-50 p-1.5 lg:p-2 rounded-lg w-full">
                            Tahmin yapabilmek için giriş yapmalısınız
                          </p>
                        ) : maxGuessExceeded ? (
                          <p className="text-center text-red-500 text-sm lg:text-base bg-red-50 p-1.5 lg:p-2 rounded-lg w-full">
                            Bu tur için maksimum tahmin hakkınızı kullandınız
                          </p>
                        ) : (
                          feedback &&
                          !showResults && (
                            <motion.div
                              className={`${
                                shake ? "animate-shake" : ""
                              } w-full flex justify-center`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                            >
                              <GuessStatus
                                feedback={feedback}
                                type={
                                  feedback === "correct" ? "success" : "error"
                                }
                              />
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Taraf - Chat */}
        <div className="md:col-span-1 lg:col-span-1 xl:col-span-4 order-3">
          <div className="xl:sticky xl:top-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] xl:h-[calc(100vh-15rem)] flex flex-col">
              <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>

        {/* Alt Kısım - Tablet görünümünde Oyuncular ve Tahminler */}
        <div className="hidden md:flex lg:flex xl:hidden col-span-2 gap-6 order-4">
          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-auto h-[400px]">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <h3 className="font-semibold">Çevrimiçi Oyuncular</h3>
              </div>
            </div>
            <div className="p-3">
              {onlinePlayers.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 mb-2"
                >
                  <span className="font-medium truncate">
                    {player.username}
                  </span>
                  <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    {player.roomScore} puan
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-auto h-[400px]">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                <h3 className="font-semibold">Son Tahminler</h3>
              </div>
            </div>
            <div className="p-3">
              {lastGuesses?.map((guess) => (
                <div
                  key={guess.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 mb-2"
                >
                  <span className="font-medium truncate">{guess.username}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      guess.isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {guess.isCorrect ? "Doğru" : "Yanlış"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
