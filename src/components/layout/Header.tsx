import { AnimatePresence, motion } from "framer-motion";
import { Car, HelpCircle, Home, LogIn, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import { ScoreBoard } from "../ScoreBoard";
import { Timer } from "../Timer";

const AnimatedIcons = () => {
  const [currentIcon, setCurrentIcon] = React.useState(0);
  const icons = [
    { component: Home, key: "home" },
    { component: HelpCircle, key: "help" },
    { component: Car, key: "car" },
  ];
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 2000); // Switch every 2 seconds

    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={icons[currentIcon].key}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
      >
        {React.createElement(icons[currentIcon].component, {
          className: "text-white",
          size: 32,
        })}
      </motion.div>
    </AnimatePresence>
  );
};

interface HeaderProps {
  onOpenAuth: (type: "login" | "register") => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { isAuthenticated, user } = useAuth();
  const { currentListing, roundStartTime, roundDuration, roomId } =
    useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(roundDuration);

  useEffect(() => {
    let intervalId: number;

    if (currentListing && roundStartTime) {
      const roundEndTime = new Date(roundStartTime.getTime() + roundDuration);

      const updateTimer = () => {
        const now = new Date();
        const remaining = Math.max(0, roundEndTime.getTime() - now.getTime());

        setTimeLeft(Math.floor(remaining / 1000));

        if (remaining <= 0) {
          window.clearInterval(intervalId);
        }
      };

      // Update immediately and then every second
      updateTimer();
      intervalId = window.setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [currentListing, roundStartTime, roundDuration]);

  const handleLeaveRoom = () => {
    if (roomId) {
      socketService.leaveRoom(roomId);
    }
  };

  return (
    <header className="bg-yellow-400 p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleLeaveRoom()}
        >
          <div className="flex items-center gap-4">
            <AnimatedIcons />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{
              textShadow: "0 0 3px rgba(255, 255, 255, 0.3)",
            }}
          >
            sahikaca
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {currentListing && roundStartTime && <Timer timeLeft={timeLeft} />}

          {user && <ScoreBoard totalScore={user.score} />}

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-white">
                Hoşgeldin, <b>{user.username}</b>
              </span>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogIn size={20} />
                <span>Giriş</span>
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserPlus size={20} />
                <span>Kayıt</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
