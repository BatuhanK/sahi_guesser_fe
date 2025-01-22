import { AnimatePresence, motion } from "framer-motion";
import { Check, Trophy, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

import { useMediaQuery } from "../hooks/useMediaQuery";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/gameStore";
import { GuessResult } from "../types";
import { OnlinePlayer } from "../types/socket";

interface PlayersListProps {
  onlinePlayers: OnlinePlayer[];
  lastGuesses: GuessResult[];
}

export const PlayersList: React.FC<PlayersListProps> = ({
  onlinePlayers,
  lastGuesses,
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const correctGuesses = useGameStore((state) => state.correctGuesses);

  const [confettiGuessId, setConfettiGuessId] = useState<string | null>(null);
  const [animatingGuesses, setAnimatingGuesses] = useState<Set<string>>(
    new Set()
  );

  // Disable animations if there are more than 150 players
  const shouldDisableAnimations = onlinePlayers.length > 150;

  // Group players based on correct guesses
  const groupedPlayers = onlinePlayers.reduce(
    (acc, player) => {
      const hasCorrectGuess = correctGuesses.some(
        (guess) => guess.playerId === player.playerId
      );
      if (hasCorrectGuess) {
        acc.correct.push(player);
      } else {
        acc.incorrect.push(player);
      }
      return acc;
    },
    { correct: [] as OnlinePlayer[], incorrect: [] as OnlinePlayer[] }
  );

  // Watch for new guesses and trigger animations
  useEffect(() => {
    if (shouldDisableAnimations || lastGuesses.length === 0) return;

    const latestGuess = lastGuesses[0];
    const guessId =
      latestGuess.playerId + (latestGuess.isCorrect ? "y" : "n") + "0";

    if (!animatingGuesses.has(guessId)) {
      setAnimatingGuesses((prev) => new Set(prev).add(guessId));

      if (latestGuess.isCorrect) {
        setConfettiGuessId(guessId);
        setTimeout(() => {
          setConfettiGuessId(null);
        }, 2000);
      }
    }
  }, [lastGuesses, shouldDisableAnimations]);

  if (!isDesktop) {
    return null;
  }

  const playerItemProps = shouldDisableAnimations
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] rounded-lg">
      {/* Çevrimiçi Oyuncular Bölümü - 50% */}
      <div className="h-1/2 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 sticky top-0 bg-[var(--bg-secondary)] p-3">
          <div className="flex items-center gap-1.5 lg:gap-2">
            <Users
              size={18}
              className="text-[var(--accent-color)] lg:w-5 lg:h-5"
            />
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">
              Çevrimiçi
            </h3>
          </div>
          <span className="text-xs lg:text-sm px-2 py-1 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-full">
            {onlinePlayers.length}
          </span>
        </div>
        <div className="overflow-y-auto h-[calc(100%-48px)] p-3 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {/* Correct guesses group */}
            {groupedPlayers.correct.map((player) => (
              <motion.div
                key={player.playerId}
                {...playerItemProps}
                className="flex items-center justify-between bg-[var(--success-muted)] p-2 rounded-lg hover:bg-[var(--success-hover)] transition-colors mb-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Check
                    size={16}
                    className="text-[var(--success-text)] shrink-0"
                  />
                  <span className="font-medium truncate text-[var(--text-primary)]">
                    {player.username}
                  </span>
                </div>
                <span className="text-sm px-2 py-1 bg-[var(--success-bg)] text-[var(--success-text)] rounded-full shrink-0 ml-2">
                  {player.roomScore} puan
                </span>
              </motion.div>
            ))}

            {/* Incorrect/waiting group */}
            {groupedPlayers.incorrect.map((player) => (
              <motion.div
                key={player.playerId}
                {...playerItemProps}
                className="flex items-center justify-between bg-[var(--bg-tertiary)] p-2 rounded-lg hover:bg-[var(--hover-color)] transition-colors mb-2"
              >
                <span className="font-medium truncate flex-1 min-w-0 text-[var(--text-primary)]">
                  {player.username}
                </span>
                <span className="text-sm px-2 py-1 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-full shrink-0 ml-2">
                  {player.roomScore} puan
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Son Tahminler Bölümü - 50% */}
      <div className="h-1/2">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 sticky top-0 bg-[var(--bg-secondary)] p-3">
          <div className="flex items-center gap-1.5 lg:gap-2">
            <Trophy
              size={18}
              className="text-[var(--warning-text)] lg:w-5 lg:h-5"
            />
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">
              Son Tahminler
            </h3>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-48px)] p-3 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {lastGuesses?.map((guess, index) => {
              const guessId =
                guess.playerId + (guess.isCorrect ? "y" : "n") + index;

              return (
                <motion.div
                  key={guessId}
                  {...playerItemProps}
                  onAnimationComplete={() => {
                    if (!shouldDisableAnimations) {
                      setAnimatingGuesses((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(guessId);
                        return newSet;
                      });
                    }
                  }}
                  className="relative mb-2"
                >
                  {confettiGuessId === guessId && !shouldDisableAnimations && (
                    <div className="absolute inset-0 pointer-events-none">
                      <Confetti
                        width={300}
                        height={100}
                        recycle={false}
                        numberOfPieces={50}
                      />
                    </div>
                  )}
                  <motion.div
                    initial={false}
                    animate={
                      !shouldDisableAnimations &&
                      guess.isCorrect &&
                      animatingGuesses.has(guessId)
                        ? {
                            scale: [1, 1.05, 1],
                            transition: { duration: 0.5, delay: 0.3 },
                          }
                        : {}
                    }
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      guess.isCorrect
                        ? "bg-[var(--success-muted)] hover:bg-[var(--success-hover)]"
                        : "bg-[var(--error-muted)] hover:bg-[var(--error-hover)]"
                    )}
                  >
                    <span className="font-medium truncate flex-1 mr-2 text-[var(--text-primary)]">
                      {guess.username}
                    </span>
                    <span
                      className={cn(
                        "text-sm px-2 py-1 rounded-full shrink-0",
                        guess.isCorrect
                          ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                          : "bg-[var(--error-bg)] text-[var(--error-text)]"
                      )}
                    >
                      {guess.isCorrect ? "Doğru Tahmin" : "Yanlış Tahmin"}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
