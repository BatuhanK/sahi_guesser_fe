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
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useAuth } from "../../hooks/useAuth";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import {
  CarListingDetails,
  HouseForRentListingDetails,
} from "../../types/socket";
import { Chat } from "../Chat";
import { GuessStatus } from "../GuessStatus";
import { PlayersList } from "../PlayersList";
import { PriceInput } from "../PriceInput";

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

  const handleGuess = (guess: number) => {
    if (!currentListing || !isAuthenticated || !roomId) return;
    socketService.submitGuess(roomId, guess);
  };

  if (!currentListing) return null;

  function handleSendMessage(message: string): void {
    console.log(message, "--message");
    console.log(isAuthenticated, "--isAuthenticated");
    console.log(roomId, "--roomId");
    if (!isAuthenticated || !roomId) return;
    socketService.sendMessage(roomId, message);
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0
        ? currentListing.details.imageUrls.length - 1
        : prevIndex - 1
    );
    //@ts-expect-error windowa koyduk allah affetsin
    window._resetSlideshowTimer?.();
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === currentListing.details.imageUrls.length - 1
        ? 0
        : prevIndex + 1
    );
    //@ts-expect-error windowa koyduk allah affetsin
    window._resetSlideshowTimer?.();
  };

  const renderCarDetails = () => {
    if (currentListing.details.type !== "car") return null;
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
  };

  const renderPropertyDetails = () => {
    if (currentListing.details.type !== "house-for-rent") return null;
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.3} />
      )}
      <div className="lg:col-span-8 space-y-4 lg:space-y-6">
        <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="relative h-[250px] sm:h-[300px] md:h-[400px]">
            <img
              src={currentListing.details.imageUrls[currentImageIndex]}
              alt="Listing image"
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            <button
              onClick={handlePrevImage}
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
              onClick={handleNextImage}
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
              <h2 className="text-xl lg:text-2xl font-bold">
                {currentListing.title}
              </h2>
              <div className="text-sm lg:text-base">
                {currentListing.details.type === "car"
                  ? renderCarDetails()
                  : renderPropertyDetails()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 lg:gap-4">
          <PriceInput
            onGuess={handleGuess}
            disabled={!isAuthenticated || hasCorrectGuess}
            listingType={currentListing.details.type}
          />
          {!isAuthenticated && (
            <p className="text-red-500 text-sm lg:text-base">
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

        <div className="h-[400px] lg:h-[500px]">
          <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4 lg:space-y-6">
        <PlayersList onlinePlayers={onlinePlayers} lastGuesses={lastGuesses} />
      </div>
    </div>
  );
};
