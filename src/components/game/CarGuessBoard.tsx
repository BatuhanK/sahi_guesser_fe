import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Calendar, Car, Filter, Move, Tag, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import type { CarGuessKind } from "../../types/socket";
import { formatPrice } from "../../utils/priceFormatter";
import { PlayersList } from "../PlayersList";
import { CarGuessResults } from "./CarGuessResults";
import { GuessMessage } from "./components/GuessComponents";
import ImageNavigation from "./components/ImageNavigation";
import { GameOver } from "./GameOver";

const Chat = lazy(() =>
  import("../Chat").then((m) => ({ default: m.Chat }))
);

const SLIDESHOW_INTERVAL = 3000;

interface OptionGroupProps<T extends string | number> {
  title: string;
  icon: React.ReactNode;
  kind: CarGuessKind;
  options: T[];
  guess: T | undefined;
  result: boolean | undefined;
  disabled: boolean;
  onPick: (kind: CarGuessKind, value: T) => void;
}

/** Çoktan seçmeli bir tahmin grubu (marka / model / yıl). Tek hak: ilk
 * tıklama gönderilir, grup kilitlenir ve sonuç renkle gösterilir. */
function OptionGroup<T extends string | number>({
  title,
  icon,
  kind,
  options,
  guess,
  result,
  disabled,
  onPick,
}: OptionGroupProps<T>) {
  const answered = guess !== undefined;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[var(--accent-color)]">{icon}</span>
        <h3 className="text-sm lg:text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {answered && result !== undefined && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              result
                ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                : "bg-[var(--error-bg)] text-[var(--error-text)]"
            )}
          >
            {result ? "Doğru" : "Yanlış"}
          </span>
        )}
      </div>
      <div
        className={cn(
          "grid gap-1.5 sm:gap-2 grid-cols-[repeat(auto-fill,minmax(72px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(88px,1fr))]"
        )}
      >
        {options.map((option) => {
          const picked = guess === option;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled || answered}
              onClick={() => onPick(kind, option)}
              className={cn(
                "flex items-center justify-center px-1.5 py-2 sm:px-2 rounded-lg border text-center text-[11px] sm:text-xs font-medium leading-tight [overflow-wrap:anywhere] transition-all",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]",
                picked && result === true &&
                  "bg-[var(--success-bg)] border-[var(--success-text)] text-[var(--success-text)]",
                picked && result === false &&
                  "bg-[var(--error-bg)] border-[var(--error-text)] text-[var(--error-text)]",
                picked && result === undefined &&
                  "bg-[var(--accent-muted)] border-[var(--accent-color)] text-[var(--text-primary)]",
                !picked && answered && "opacity-40 cursor-not-allowed bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]",
                !answered && !disabled &&
                  "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-color)] hover:bg-[var(--hover-color)] cursor-pointer",
                disabled && !answered &&
                  "opacity-50 cursor-not-allowed bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** car-guess oyun ekranı — araba görselleri + fiyat ipucu + 3 çoktan
 * seçmeli tahmin grubu (10 marka / 10 model / 5 yıl). */
export const CarGuessBoard: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval>>();

  const {
    carContent,
    carGuesses,
    carResults,
    carCorrectAnswers,
    showResults,
    intermissionDuration,
    roundEndScores,
    chatMessages,
    onlinePlayers,
    lastGuesses,
    roomId,
    roomSummary,
    maxRounds,
    roundNumber,
  } = useGameStore();
  const { isAuthenticated, user } = useAuth();

  const imageUrls = carContent?.imageUrls ?? [];

  const startSlideshow = useCallback(() => {
    if (!carContent) return;
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }
    slideshowTimerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === (carContent.imageUrls.length || 1) - 1 ? 0 : prevIndex + 1
      );
    }, SLIDESHOW_INTERVAL);
  }, [carContent]);

  useEffect(() => {
    startSlideshow();
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [startSlideshow]);

  useEffect(() => {
    if (!imageUrls.length) return;
    setCurrentImageIndex(Math.floor(Math.random() * imageUrls.length));
  }, [carContent?.id, imageUrls.length]);

  const handlePick = useCallback(
    (kind: CarGuessKind, value: string | number) => {
      if (!carContent || !isAuthenticated || !roomId || showResults) return;
      if (carGuesses[kind] !== undefined) return;
      useGameStore.getState().setCarGuess(kind, value);
      socketService.submitCarGuess(kind, value);
    },
    [carContent, isAuthenticated, roomId, showResults, carGuesses]
  );

  const handleSendMessage = useCallback(
    (message: string): void => {
      if (!isAuthenticated || !roomId || !user?.id) return;
      socketService.sendMessage(message);
    },
    [isAuthenticated, roomId, user?.id]
  );

  if (roomSummary) {
    return <GameOver />;
  }
  if (!carContent) return null;

  const shouldShowRoundInfo = Boolean(
    Number.isSafeInteger(maxRounds) &&
      maxRounds !== 9999999 &&
      maxRounds !== 0 &&
      roundNumber &&
      roundNumber !== 0
  );

  const guessDisabled = !isAuthenticated || showResults;

  return (
    <div className="game-board w-full mx-auto flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-10 gap-6 lg:gap-8 mb-6">
        {/* Center - Main Content */}
        <div className="md:col-span-2 lg:col-span-2 xl:col-span-10 2xl:col-span-8 space-y-4 lg:space-y-6 order-1 xl:order-1">
          {showResults && intermissionDuration ? (
            <CarGuessResults
              scores={roundEndScores}
              correctAnswers={carCorrectAnswers}
              content={carContent}
              intermissionDuration={intermissionDuration}
            />
          ) : (
            <div className="surface-card overflow-hidden lg:grid lg:grid-cols-[3fr_2fr]">
              <div className="flex flex-col">
              {/* Image Section */}
              <div className="relative">
                <div className="relative aspect-[16/10] w-full max-h-[24vh] sm:max-h-[32vh] lg:max-h-none lg:h-full">
                  {imageUrls.length > 0 ? (
                    <img
                      src={imageUrls[currentImageIndex]}
                      referrerPolicy="no-referrer"
                      onContextMenu={(e) => e.preventDefault()}
                      alt="Araba görseli"
                      className="w-full h-full object-contain transition-opacity duration-500 rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl bg-[var(--bg-tertiary)]">
                      <Car className="h-16 w-16 text-[var(--text-tertiary)]" />
                    </div>
                  )}
                  {imageUrls.length > 1 && (
                    <ImageNavigation
                      currentIndex={currentImageIndex}
                      totalImages={imageUrls.length}
                      onPrev={() => {
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? imageUrls.length - 1 : prev - 1
                        );
                        startSlideshow();
                      }}
                      onNext={() => {
                        setCurrentImageIndex((prev) =>
                          prev === imageUrls.length - 1 ? 0 : prev + 1
                        );
                        startSlideshow();
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="p-3 lg:p-4 space-y-2">
                <div className="text-sm lg:text-base rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 lg:px-4 lg:py-3">
                  <div className="flex flex-wrap gap-2 text-sm lg:text-base">
                    <span className="inline-flex items-center shrink-0 bg-[var(--bg-primary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-md whitespace-nowrap">
                      <Tag className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[var(--accent-color)]" />
                      <span className="text-[var(--text-secondary)] mx-1.5 text-xs lg:text-sm">
                        Fiyat:
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] text-xs lg:text-sm">
                        {formatPrice(carContent.price)} ₺
                      </span>
                    </span>
                    <span className="inline-flex items-center shrink-0 bg-[var(--bg-primary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-md whitespace-nowrap">
                      <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[var(--accent-color)]" />
                      <span className="font-semibold text-[var(--text-primary)] ml-1.5 text-xs lg:text-sm">
                        {formatPrice(carContent.mileage)} km
                      </span>
                    </span>
                    <span className="inline-flex items-center shrink-0 bg-[var(--bg-primary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-md whitespace-nowrap">
                      <Filter className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[var(--accent-color)]" />
                      <span className="font-semibold text-[var(--text-primary)] ml-1.5 text-xs lg:text-sm">
                        {carContent.fuelType}
                      </span>
                    </span>
                    <span className="inline-flex items-center shrink-0 bg-[var(--bg-primary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-md whitespace-nowrap">
                      <Move className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[var(--accent-color)]" />
                      <span className="font-semibold text-[var(--text-primary)] ml-1.5 text-xs lg:text-sm">
                        {carContent.transmission}
                      </span>
                    </span>
                  </div>

                  {shouldShowRoundInfo && (
                    <div className="mt-3 flex items-center justify-center">
                      <div className="inline-flex items-center bg-[var(--bg-primary)] rounded-full px-4 py-1.5 shadow-sm">
                        <span className="text-xs lg:text-sm font-medium text-[var(--text-primary)]">
                          Tur
                        </span>
                        <span className="ml-1.5 text-sm lg:text-base font-bold text-[var(--text-primary)]">
                          {roundNumber}
                        </span>
                        <span className="mx-1 text-xs lg:text-sm text-[var(--text-secondary)]">
                          /
                        </span>
                        <span className="text-sm lg:text-base font-bold text-[var(--text-primary)]">
                          {maxRounds}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* Guess Section */}
              <div className="p-3 lg:p-4 border-t lg:border-t-0 lg:border-l border-[var(--border-color)] space-y-3 lg:flex lg:flex-col lg:justify-center">
                <OptionGroup
                  title="Marka"
                  icon={<Car className="h-4 w-4" />}
                  kind="brand"
                  options={carContent.brands}
                  guess={carGuesses.brand}
                  result={carResults.brand}
                  disabled={guessDisabled}
                  onPick={handlePick}
                />
                <OptionGroup
                  title="Model"
                  icon={<Tag className="h-4 w-4" />}
                  kind="model"
                  options={carContent.models}
                  guess={carGuesses.model}
                  result={carResults.model}
                  disabled={guessDisabled}
                  onPick={handlePick}
                />
                <OptionGroup
                  title="Yıl"
                  icon={<Calendar className="h-4 w-4" />}
                  kind="year"
                  options={carContent.years}
                  guess={carGuesses.year}
                  result={carResults.year}
                  disabled={guessDisabled}
                  onPick={handlePick}
                />

                {!isAuthenticated && (
                  <GuessMessage isAuthenticated={isAuthenticated} maxGuessExceeded={false} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Left Side - Players List */}
        <div className="hidden 2xl:block 2xl:col-span-2 order-3 xl:order-3">
          <div className="2xl:sticky 2xl:top-6">
            <div className="surface-card overflow-auto h-[calc(100vh-15rem)] scrollbar-hide">
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
        <Suspense fallback={null}>
          <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
        </Suspense>
      </div>
    </div>
  );
};
