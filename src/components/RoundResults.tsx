import { AnimatePresence, motion } from "framer-motion";
import { Medal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useGameStore } from "../store/gameStore";
import { Listing, RoundEndScore } from "../types/socket";
import { formatPriceWithCurrency } from "../utils/priceFormatter";

interface RoundResultsProps {
  scores: RoundEndScore[];
  correctPrice: number;
  currentAnswer?: string | number;
  listing: Listing;
  intermissionDuration: number;
  maxRounds?: number;
  roundNumber?: number;
  shouldShowRoundInfo?: boolean;
}

type ScoreWithAccuracy = RoundEndScore & {
  accuracy?: number;
};

export const RoundResults: React.FC<RoundResultsProps> = ({
  scores,
  correctPrice,
  currentAnswer,
  listing,
  intermissionDuration,
  maxRounds,
  roundNumber,
  shouldShowRoundInfo,
}) => {
  const room = useGameStore((state) => state.room);
  const isTextQuestion = room?.roomSettings.roomQuestionType === 'text';

  const scoresWithAccuracy = scores
    .filter((score) => score.roundScore)
    .map((score) => {
      if (isTextQuestion) {
        return score;
      }
      return {
        ...score,
        accuracy:
          100 -
          Number(
            (
              (Math.abs(score.guess - correctPrice) / correctPrice) *
              100
            ).toFixed(1)
          ),
      };
    }) as ScoreWithAccuracy[];

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const duration = Math.floor(intermissionDuration / 1000);
    return isNaN(duration) ? 5 : duration;
  });

  useEffect(() => {
    if (
      typeof intermissionDuration !== "number" ||
      isNaN(intermissionDuration)
    ) {
      console.warn("Invalid intermissionDuration:", intermissionDuration);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + intermissionDuration;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [intermissionDuration]);

  const sortedScores = useMemo(() => {
    return [...scoresWithAccuracy]
      .filter((score) => score.roundScore)
      .sort((a, b) => b.roundScore! - a.roundScore!);
  }, [scoresWithAccuracy]);

  const getMedalColor = (index: number): string => {
    switch (index) {
      case 0:
        return "text-[var(--accent-color)]";
      case 1:
        return "text-[var(--text-tertiary)]";
      case 2:
        return "text-[var(--warning-text)]";
      default:
        return "text-transparent";
    }
  };

  const getRowBackground = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-[var(--warning-bg)] border-2 border-[var(--accent-color)]";
      case 1:
        return "bg-[var(--bg-tertiary)] border-2 border-[var(--text-tertiary)]";
      case 2:
        return "bg-[var(--warning-bg)] border-2 border-[var(--warning-text)]";
      default:
        return "bg-[var(--bg-tertiary)]";
    }
  };

  const { user } = useAuth();

  const userRank = sortedScores.findIndex((score) => score.userId === user?.id);

  return (
    <div className="h-full lg:p-6 rounded-xl" style={{ padding: 0 }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="h-full"
        >
          <div className="round-results-container h-full rounded-xl bg-[var(--bg-secondary)]">
            <div className="border-4 border-[var(--accent-color)] rounded-xl shadow-xl p-8 h-full flex flex-col">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3 text-[var(--text-primary)]">
                    Tur Sonuçları
                    {shouldShowRoundInfo && (
                      <div className="flex justify-center mt-2">
                        <span className="inline-block px-3 py-1 text-sm rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                          {roundNumber} / {maxRounds}
                        </span>
                      </div>
                    )}
                  </h2>
         
                  <div className="flex flex-col gap-2">
                    <p className="text-[var(--text-secondary)] text-lg">
                      {listing.title}
                    </p>
                    <p className="text-2xl font-semibold text-[var(--success-text)]">
                      {isTextQuestion ? (
                        <>Cevap: {currentAnswer}</>
                      ) : (
                        <>
                          Gerçek Fiyat:{" "}
                          {formatPriceWithCurrency(
                            correctPrice,
                            listing.details.type
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedScores.slice(0, 3).map((score, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={score.userId}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-lg transition-all hover:scale-[1.02] ${getRowBackground(
                        index
                      )} backdrop-blur-sm backdrop-filter`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
                        {index <= 2 ? (
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              delay: index * 0.1,
                            }}
                            className="shrink-0"
                          >
                            <Medal
                              className={`${getMedalColor(
                                index
                              )} drop-shadow-md`}
                              size={24}
                            />
                          </motion.div>
                        ) : (
                          <span className="w-6 text-center font-medium text-[var(--text-tertiary)] shrink-0">
                            {index + 1}
                          </span>
                        )}
                        <span className="font-medium text-base sm:text-lg truncate text-[var(--text-primary)]">
                          {score.username}
                        </span>
                      </div>

                      <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-6 shrink-0 w-full sm:w-auto sm:ml-auto">
                        {isTextQuestion ? (
                          <span className="text-[var(--text-secondary)] font-medium text-sm sm:text-base whitespace-nowrap">
                            "{score.guess}"
                          </span>
                        ) : (
                          <>
                            <span className="text-[var(--text-secondary)] font-medium text-sm sm:text-base whitespace-nowrap">
                              {formatPriceWithCurrency(
                                score.guess,
                                listing.details.type
                              )}
                            </span>
                            {score.accuracy !== undefined && (
                              <div className="shrink-0">
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.1 + 0.2 }}
                                  className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                    score.accuracy >= 90
                                      ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                                      : score.accuracy >= 70
                                      ? "bg-[var(--warning-bg)] text-[var(--warning-text)]"
                                      : "bg-[var(--error-bg)] text-[var(--error-text)]"
                                  }`}
                                >
                                  %{score.accuracy.toFixed(1)}
                                </motion.span>
                              </div>
                            )}
                          </>
                        )}
                        <motion.span
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="font-bold text-[var(--success-text)] text-sm sm:text-base shrink-0 min-w-[60px] text-right"
                        >
                          +{score.roundScore}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}

                  {userRank > 3 && (
                    <div className="flex justify-center py-1">
                      <div className="flex flex-col items-center gap-[2px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]"></div>
                      </div>
                    </div>
                  )}
                  {userRank > 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      key={sortedScores[userRank].userId}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-lg transition-all hover:scale-[1.02] ${getRowBackground(
                        userRank
                      )} backdrop-blur-sm backdrop-filter`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
                        <span className="w-6 text-center font-medium text-[var(--text-tertiary)] shrink-0">
                          {userRank + 1}
                        </span>
                        <span className="font-medium text-base sm:text-lg truncate text-[var(--text-primary)]">
                          {sortedScores[userRank].username}
                        </span>
                      </div>

                      <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-6 shrink-0 w-full sm:w-auto sm:ml-auto">
                        {isTextQuestion ? (
                          <span className="text-[var(--text-secondary)] font-medium text-sm sm:text-base whitespace-nowrap">
                            "{sortedScores[userRank].guess}"
                          </span>
                        ) : (
                          <>
                            <span className="text-[var(--text-secondary)] font-medium text-sm sm:text-base whitespace-nowrap">
                              {formatPriceWithCurrency(
                                sortedScores[userRank].guess,
                                listing.details.type
                              )}
                            </span>
                            {sortedScores[userRank].accuracy !== undefined && (
                              <div className="shrink-0">
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 }}
                                  className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                    sortedScores[userRank].accuracy >= 90
                                      ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                                      : sortedScores[userRank].accuracy >= 70
                                      ? "bg-[var(--warning-bg)] text-[var(--warning-text)]"
                                      : "bg-[var(--error-bg)] text-[var(--error-text)]"
                                  }`}
                                >
                                  %{sortedScores[userRank].accuracy.toFixed(1)}
                                </motion.span>
                              </div>
                            )}
                          </>
                        )}
                        <motion.span
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="font-bold text-[var(--success-text)] text-sm sm:text-base shrink-0 min-w-[60px] text-right"
                        >
                          +{sortedScores[userRank].roundScore}
                        </motion.span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="w-full bg-[var(--accent-color)] text-white py-4 px-6 rounded-lg transition-all text-lg font-medium text-center mt-8 hover:bg-[var(--accent-hover)]">
                Lütfen Bekleyiniz{" "}
                {remainingSeconds > 0 && (
                  <span className="text-sm">({remainingSeconds}s)</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
