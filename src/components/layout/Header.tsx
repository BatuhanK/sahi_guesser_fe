import { AnimatePresence, motion } from "framer-motion";
import {
  Car,
  HelpCircle,
  Home,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { socketService } from "../../services/socket";
import { useGameStore } from "../../store/gameStore";
import { ScoreBoard } from "../ScoreBoard";
import { Timer } from "../Timer";

const AnimatedIcons = () => {
  const [currentIcon, setCurrentIcon] = React.useState(0);
  const icons = [
    { component: Home, key: "home" },
    { component: Home, key: "home" },
    { component: Home, key: "home" },
    { component: HelpCircle, key: "help" },
    { component: Car, key: "car" },
    { component: Car, key: "car" },
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
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { status, currentListing, roundStartTime, roundDuration, roomId } =
    useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(roundDuration);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.reload();
  };

  return (
    <>
      <header className="bg-yellow-400 p-4 shadow-md relative">
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: "95rem" }}
        >
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleLeaveRoom()}
          >
            <div className="flex items-center gap-4">
              <AnimatedIcons />
            </div>
            <h1
              className={`${
                isMobile ? "text-xl" : "text-2xl"
              } font-bold text-white`}
              style={{
                textShadow: "0 0 3px rgba(255, 255, 255, 0.3)",
              }}
            >
              sahi kaca?
            </h1>
          </div>

          {isMobile ? (
            <div className="flex items-center gap-2">
              {currentListing && roundStartTime && status === "PLAYING" && (
                <div className="mr-2">
                  <Timer timeLeft={timeLeft} />
                </div>
              )}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-white"
              >
                <Menu size={24} />
              </button>
              {showMobileMenu && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white shadow-lg rounded-b-lg p-4 z-50">
                  <div className="flex flex-col gap-4">
                    {user && <ScoreBoard totalScore={user.score} />}
                    {user && (
                      <div className="flex flex-col gap-2">
                        <div
                          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded"
                          onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                          <span>
                            Hoşgeldin, <b>{user.username}</b>
                          </span>
                        </div>
                        {showUserMenu && (
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 p-2 hover:bg-gray-100 rounded"
                          >
                            <LogOut size={20} />
                            <span>Çıkış Yap</span>
                          </button>
                        )}
                      </div>
                    )}
                    {!isAuthenticated && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onOpenAuth("login")}
                          className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-lg"
                        >
                          <LogIn size={20} />
                          <span>Giriş</span>
                        </button>
                        <button
                          onClick={() => onOpenAuth("register")}
                          className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-lg"
                        >
                          <UserPlus size={20} />
                          <span>Kayıt</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {currentListing && roundStartTime && status === "PLAYING" && (
                <Timer timeLeft={timeLeft} />
              )}
              {user && <ScoreBoard totalScore={user.score} />}
              {user && (
                <div className="relative">
                  <div
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-yellow-500 transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="text-white">
                      Hoşgeldin, <b>{user.username}</b>
                    </span>
                  </div>
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg py-2 min-w-[200px] z-50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-red-500"
                      >
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  )}
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
          )}
        </div>
      </header>
    </>
  );
};
