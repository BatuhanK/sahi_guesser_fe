import { motion } from "framer-motion";
import React from "react";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";
import { useWindowSize } from "react-use";
import { roomApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { useGameStore } from "../../store/gameStore";

export const GameOver: React.FC = () => {
  const { roomSummary } = useGameStore();
  const { user } = useAuthStore();
  const { width, height } = useWindowSize();

  const recreateRoom = async () => {
    if (!roomSummary) return;
    if (!user) return;

    const { room } = roomSummary;
    const [creator] = room.name.split(" -");
    if (creator === user.username) {
      await roomApi.recreateRoom(room.slug);
      window.location.replace(`/oda/${room.slug}?recreate=true`);
    } else {
      toast.error("Sadece oluşturan kişi oyunu tekrar başlatabilir.");
    }
  };

  const handleRestart = () => {
    window.location.href = "/";
  };

  // Sort players by score in descending order
  const sortedPlayers =
    roomSummary?.players.sort((a, b) => b.score - a.score) || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const getPlayerAnimation = (index: number) => {
    if (index === 0) return "scale(1.1) translateY(-10px)";
    return "scale(1)";
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return null;
    }
  };

  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.2}
        colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"]}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] p-10 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-[var(--border-color)]"
      >
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[#45B7D1]"
        >
          Oyun Bitti!
        </motion.h2>

        {roomSummary && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold mb-6 text-[var(--text-primary)]">
              İşte Skorlarınız
            </h3>
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.playerId}
                  variants={item}
                  style={{
                    transform: getPlayerAnimation(index),
                  }}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-md transition-all duration-300 ${
                    index === 0
                      ? "bg-gradient-to-r from-[var(--accent-color)]/20 to-[#45B7D1]/20 border border-[var(--accent-color)]/30"
                      : "bg-[var(--bg-secondary)]/80 border border-[var(--border-color)]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold min-w-[40px]">
                      {getMedalColor(index) || `#${index + 1}`}
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`text-lg ${
                        index === 0
                          ? "text-[var(--accent-color)] font-bold"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {player.username}
                    </motion.span>
                  </div>
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`font-bold text-xl ${
                        index === 0
                          ? "text-[var(--accent-color)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {player.score}
                    </span>
                    <span className="text-[var(--text-secondary)] text-sm">
                      puan
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={handleRestart}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 mx-auto bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
        >
          Anasayfaya Dön
        </motion.button>

        <motion.button
          onClick={recreateRoom}
          className="flex items-center gap-2 mx-auto bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
        >
          Oyunu Tekrar Oyna
        </motion.button>
      </motion.div>
    </>
  );
};
