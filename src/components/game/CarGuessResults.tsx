import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Car, Check, Medal, Tag, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import type {
  CarGuessContent,
  CarGuessCorrectAnswers,
  RoundEndScore,
} from "../../types/socket";
import { formatPrice } from "../../utils/priceFormatter";

interface CarGuessResultsProps {
  scores: RoundEndScore[];
  correctAnswers: CarGuessCorrectAnswers | null;
  content: CarGuessContent;
  intermissionDuration: number;
}

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

/** car-guess tur sonuç ekranı: doğru cevaplar + parça bazlı sonucun + podium. */
export const CarGuessResults: React.FC<CarGuessResultsProps> = ({
  scores,
  correctAnswers,
  content,
  intermissionDuration,
}) => {
  const { user } = useAuth();

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const duration = Math.floor(intermissionDuration / 1000);
    return isNaN(duration) ? 5 : duration;
  });

  useEffect(() => {
    if (
      typeof intermissionDuration !== "number" ||
      isNaN(intermissionDuration)
    ) {
      return;
    }

    const endTime = Date.now() + intermissionDuration;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [intermissionDuration]);

  const sortedScores = useMemo(
    () => [...scores].filter((s) => s.score).sort((a, b) => b.score - a.score),
    [scores]
  );

  const myScore = scores.find((s) => s.player_id === user?.id);
  const myParts = myScore?.detail
    ? ([
        { label: "Marka", part: myScore.detail.brand },
        { label: "Model", part: myScore.detail.model },
        { label: "Yıl", part: myScore.detail.year },
      ] as const)
    : [];

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
          <div className="h-full rounded-xl bg-[var(--bg-secondary)]">
            <div className="border-4 border-[var(--accent-color)] rounded-xl shadow-xl p-6 lg:p-8 h-full flex flex-col">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-[var(--text-primary)]">
                    Tur Sonuçları
                  </h2>
                  {correctAnswers && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full px-3 py-1.5">
                        <Car className="h-4 w-4 text-[var(--accent-color)]" />
                        <span className="font-semibold text-[var(--text-primary)] text-sm">
                          {correctAnswers.brand} {correctAnswers.model}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full px-3 py-1.5">
                        <Calendar className="h-4 w-4 text-[var(--accent-color)]" />
                        <span className="font-semibold text-[var(--text-primary)] text-sm">
                          {correctAnswers.year}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full px-3 py-1.5">
                        <Tag className="h-4 w-4 text-[var(--accent-color)]" />
                        <span className="font-semibold text-[var(--text-primary)] text-sm">
                          {formatPrice(content.price)} ₺
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {myScore && myParts.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {myParts.map(({ label, part }) =>
                      part ? (
                        <span
                          key={label}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs lg:text-sm font-medium border",
                            part.correct
                              ? "bg-[var(--success-bg)] border-[var(--success-text)] text-[var(--success-text)]"
                              : "bg-[var(--error-bg)] border-[var(--error-text)] text-[var(--error-text)]"
                          )}
                        >
                          {part.correct ? <Check size={14} /> : <X size={14} />}
                          {label}: {part.guess ?? "—"}
                          {part.score > 0 && (
                            <span className="font-bold">+{part.score}</span>
                          )}
                        </span>
                      ) : null
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {sortedScores.slice(0, 3).map((score, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={score.player_id}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-lg transition-all hover:scale-[1.02] ${getRowBackground(
                        index
                      )} backdrop-blur-sm backdrop-filter`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
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
                            className={`${getMedalColor(index)} drop-shadow-md`}
                            size={24}
                          />
                        </motion.div>
                        <span className="font-medium text-base sm:text-lg truncate text-[var(--text-primary)]">
                          {score.username}
                        </span>
                      </div>
                      <motion.span
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="font-bold text-[var(--success-text)] text-sm sm:text-base shrink-0 min-w-[60px] text-right"
                      >
                        +{score.score}
                      </motion.span>
                    </motion.div>
                  ))}
                  {sortedScores.length === 0 && (
                    <p className="text-center text-[var(--text-secondary)]">
                      Bu tur kimse puan alamadı.
                    </p>
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
