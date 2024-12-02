import { AnimatePresence, motion } from "framer-motion";
import { Medal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  CarListingDetails,
  HouseForRentListingDetails,
  LetgoListingDetails,
  Listing,
  RoundEndScore,
} from "../types/socket";

interface RoundResultsProps {
  scores: RoundEndScore[];
  correctPrice: number;
  listing: Listing;
  intermissionDuration: number;
}

export const RoundResults: React.FC<RoundResultsProps> = ({
  scores,
  correctPrice,
  listing,
  intermissionDuration,
}) => {
  const scoresWithAccuracy = scores
    .filter((score) => score.roundScore)
    .map((score) => {
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
    });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const duration = Math.floor(intermissionDuration / 1000);
    return isNaN(duration) ? 5 : duration; // Default to 10 seconds if invalid
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
        return "text-yellow-400";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-transparent";
    }
  };

  const getRowBackground = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-2 border-yellow-400";
      case 1:
        return "bg-gray-50 border-2 border-gray-400";
      case 2:
        return "bg-amber-50 border-2 border-amber-600";
      default:
        return "bg-gray-50";
    }
  };

  const { user } = useAuth();

  const renderScoreRow = (score: (typeof sortedScores)[0], index: number) => (
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
            transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
            className="shrink-0"
          >
            <Medal
              className={`${getMedalColor(index)} drop-shadow-md`}
              size={24}
            />
          </motion.div>
        ) : (
          <span className="w-6 text-center font-medium text-gray-500 shrink-0">
            {index + 1}
          </span>
        )}
        <span className="font-medium text-base sm:text-lg truncate">
          {score.username}
        </span>
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-6 shrink-0 w-full sm:w-auto sm:ml-auto">
        <span className="text-gray-700 font-medium text-sm sm:text-base whitespace-nowrap">
          ₺{score.guess.toLocaleString("tr-TR")}
        </span>
        <div className="shrink-0">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              score.accuracy >= 90
                ? "bg-green-100 text-green-700"
                : score.accuracy >= 70
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            %{score.accuracy.toFixed(1)}
          </motion.span>
        </div>
        <motion.span
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="font-bold text-green-600 text-sm sm:text-base shrink-0 min-w-[60px] text-right"
        >
          +{score.roundScore}
        </motion.span>
      </div>
    </motion.div>
  );

  const userRank = sortedScores.findIndex((score) => score.userId === user?.id);

  const carListingInfo = useMemo(() => {
    if (listing.details.type !== "car") return null;
    const details = listing.details as CarListingDetails;
    return `${details.brand} ${details.model}`;
  }, [listing.details]);

  const houseListingInfo = useMemo(() => {
    if (listing.details.type !== "house-for-rent") return null;
    const details = listing.details as HouseForRentListingDetails;
    return `${details.rooms} oda ${details.squareMeters} m² ${details.city} ${details.district}`;
  }, [listing.details]);

  const letgoListingInfo = useMemo(() => {
    if (listing.details.type !== "letgo") return null;
    const details = listing.details as LetgoListingDetails;
    return `${details.title}`;
  }, [listing.details]);

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
          <div className="round-results-container h-full rounded-xl bg-white">
            <div className="border-4 border-yellow-400 rounded-xl shadow-xl p-8 h-full flex flex-col">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3">Tur Sonuçları</h2>
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-600 text-lg">
                      {carListingInfo || houseListingInfo || letgoListingInfo}
                    </p>
                    <p className="text-2xl font-semibold text-green-600">
                      Gerçek Fiyat: ₺{correctPrice.toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedScores
                    .slice(0, 3)
                    .map((score, index) => renderScoreRow(score, index))}

                  {userRank > 3 && (
                    <div className="flex justify-center py-1">
                      <div className="flex flex-col items-center gap-[2px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      </div>
                    </div>
                  )}
                  {userRank > 2 && (
                    <>{renderScoreRow(sortedScores[userRank], userRank)}</>
                  )}
                </div>
              </div>

              <div className="w-full bg-yellow-500 text-white py-4 px-6 rounded-lg transition-all text-lg font-medium text-center mt-8">
                Sonraki Tur{" "}
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
