import { AnimatePresence, motion } from "framer-motion";
import { Medal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Listing, RoundEndScore } from "../types/socket";

interface RoundResultsProps {
  scores: RoundEndScore[];
  correctPrice: number;
  listing: Listing;
  intermissionDuration: number;
  onNextRound: () => void;
}

export const RoundResults: React.FC<RoundResultsProps> = ({
  scores,
  correctPrice,
  listing,
  intermissionDuration,
  onNextRound,
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
      >
        <div className="round-results-container">
          <div className="border-4 border-yellow-400 rounded-xl shadow-xl p-8 max-w-3xl w-full">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">Tur Sonuçları</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-600 text-lg">İlan: {listing.title}</p>
                  <p className="text-2xl font-semibold text-green-600">
                    Gerçek Fiyat: ₺{correctPrice.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {sortedScores.map((score, index) => (
                  <div
                    key={score.userId}
                    className={`flex items-center justify-between p-5 rounded-lg transition-all hover:scale-[1.02] ${getRowBackground(
                      index
                    )}`}
                  >
                    <div className="flex items-center gap-4">
                      {index <= 2 ? (
                        <Medal className={getMedalColor(index)} size={28} />
                      ) : (
                        <span className="w-7 text-center font-medium text-gray-500">
                          {index + 1}
                        </span>
                      )}
                      <span className="font-medium text-lg">
                        {score.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-gray-700 font-medium">
                        ₺{score.guess.toLocaleString("tr-TR")}
                      </span>
                      <div className="w-24 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            score.accuracy >= 90
                              ? "bg-green-100 text-green-700"
                              : score.accuracy >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          %{score.accuracy.toFixed(1)}
                        </span>
                      </div>
                      <span className="font-bold text-green-600 w-20 text-right">
                        +{score.roundScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advertisement Space */}
              {/* <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-500">Reklam Alanı</p>
              </div> */}

              <button
                onClick={onNextRound}
                className="w-full bg-yellow-500 text-white py-4 px-6 rounded-lg hover:bg-yellow-600 transition-all text-lg font-medium hover:shadow-lg active:transform active:scale-95"
              >
                Sonraki Tur{" "}
                {remainingSeconds > 0 && (
                  <span className="text-sm">({remainingSeconds}s)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
