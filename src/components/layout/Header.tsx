import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Car,
  HelpCircle,
  Home,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShoppingBag,
  Sun,
  UserPlus,
  Users,
  Volume2
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { LazyMarkdown } from "../ui/LazyMarkdown";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { announcementApi } from "../../services/api";
import { socketService } from "../../services/socket";
import { soundService } from "../../services/soundService";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useGameStore } from "../../store/gameStore";
import { getAnnouncementColors, getAnnouncementIcon } from "../../utils/announcement";
import { ProfileEditModal } from "../ProfileEditModal";
import { ScoreBoard } from "../ScoreBoard";
import { Timer } from "../Timer";

const AnimatedIcons = () => {
  const [currentIcon, setCurrentIcon] = React.useState(0);
  const icons = [
    { component: Home, key: "home" },
    { component: Car, key: "car" },
    { component: ShoppingBag, key: "letgo" },
    { component: HelpCircle, key: "help" },
  ];
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 1500); // Switch every 1.5 seconds

    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={icons[currentIcon].key}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.2 }}
        transition={{ duration: 0.3 }}
      >
        {React.createElement(icons[currentIcon].component, {
          className: "text-[var(--accent-color)]",
          size: 22,
        })}
      </motion.div>
    </AnimatePresence>
  );
};

const ThemeToggle: React.FC<{
  isDarkMode: boolean;
  onToggleTheme: () => void;
}> = React.memo(({ isDarkMode, onToggleTheme }) => (
  <button
    onClick={onToggleTheme}
    className="icon-btn"
    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
  </button>
));

ThemeToggle.displayName = "ThemeToggle";

interface HeaderProps {
  onOpenAuth: (type: "login" | "register") => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  isDarkMode,
  onToggleTheme,
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const {
    status,
    currentListing,
    carContent,
    roundStartTime,
    roundDuration,
    roomId,
    setRoom,
    setRoomId,
  } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(roundDuration);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const { announcements, readAnnouncementIds, markAsRead, getUnreadCount } =
    useAnnouncementStore();
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("app-volume");
    return savedVolume ? parseFloat(savedVolume) : 0.05;
  });

  useEffect(() => {
    let intervalId: number;

    if ((currentListing || carContent) && roundStartTime) {
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
  }, [currentListing, carContent, roundStartTime, roundDuration]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcements = await announcementApi.getAll();
        useAnnouncementStore.getState().setAnnouncements(
          announcements.map((announcement) => ({
            id: announcement.id.toString(),
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            createdAt: new Date(announcement.createdAt),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleLeaveRoom = (redirectTo: string = "/") => {
    if (roomId) {
      socketService.leaveRoom();
    }
    setRoom(null);
    setRoomId(null);
    navigate(redirectTo);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.reload();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundService.setVolume(newVolume);
    localStorage.setItem("app-volume", newVolume.toString());
  };

  useEffect(() => {
    soundService.setVolume(volume);
  }, []); // Run once on mount

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 transition-colors">
        <div
          className="mx-auto flex items-center justify-between"
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleLeaveRoom()}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
              <AnimatedIcons />
            </div>
            <h1
              className={`${
                isMobile ? "text-xl" : "text-2xl"
              } font-extrabold tracking-tight text-[var(--text-primary)]`}
            >
              sahi <span className="text-[var(--accent-color)]">kaça?</span>
            </h1>
          </div>

          {isMobile ? (
            <div className="flex items-center gap-2">
              {(currentListing || carContent) && roundStartTime && status === "PLAYING" && (
                <div className="mr-2">
                  <Timer timeLeft={timeLeft} />
                </div>
              )}
              <ThemeToggle
                isDarkMode={isDarkMode}
                onToggleTheme={onToggleTheme}
              />
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="icon-btn"
                aria-label="Menü"
              >
                <Menu size={22} />
              </button>
              {showMobileMenu && (
                <div className="absolute top-full right-0 mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg rounded-b-2xl p-4 z-50">
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleLeaveRoom("/kullanici-odalari")}
                      className="flex items-center gap-2 text-[var(--text-primary)] p-2 hover:bg-[var(--hover-color)] rounded-lg transition-colors"
                    >
                      <Users size={20} />
                      <span>Kullanıcı Odaları</span>
                    </button>
                    {user && <ScoreBoard totalScore={user.score} />}
                    {user && (
                      <div className="flex flex-col gap-2">
                        <div
                          className="flex items-center justify-between cursor-pointer p-2 hover:bg-[var(--hover-color)] rounded transition-colors"
                          onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                          <span className="text-[var(--text-primary)]">
                            Hoşgeldin, <b>{user.username}</b>
                          </span>
                        </div>
                        {showUserMenu && (
                          <>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 text-red-500 p-2 hover:bg-[var(--hover-color)] rounded"
                            >
                              <LogOut size={20} />
                              <span>Çıkış Yap</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowProfileEditModal(true);
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-color)] text-[var(--text-primary)]"
                            >
                              <Settings size={20} />
                              <span>Profil Düzenle</span>
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 w-full hover:bg-[var(--hover-color)]">
                              <Volume2
                                size={20}
                                className="text-[var(--text-primary)]"
                              />
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full accent-[var(--accent-color)]"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {!isAuthenticated && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onOpenAuth("login")}
                          className="flex items-center gap-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                        >
                          <LogIn size={20} />
                          <span>Giriş</span>
                        </button>
                        <button
                          onClick={() => onOpenAuth("register")}
                          className="flex items-center gap-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                        >
                          <UserPlus size={20} />
                          <span>Kayıt</span>
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <button
                        onClick={() => setShowAnnouncements(!showAnnouncements)}
                        className="icon-btn relative"
                      >
                        <Bell
                          className="text-[var(--text-primary)]"
                          size={24}
                        />
                        {getUnreadCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[var(--error-text)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {getUnreadCount()}
                          </span>
                        )}
                      </button>
                      {showAnnouncements && (
                        <div className="absolute top-full right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl rounded-2xl py-2 w-96 max-h-[32rem] overflow-y-auto z-50">
                          <div className="px-4 py-2 border-b border-[var(--border-color)]">
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              Duyurular
                            </h3>
                          </div>
                          {announcements.length > 0 ? (
                            announcements.map((announcement) => {
                              const colors = getAnnouncementColors(
                                announcement.type
                              );
                              const isRead = readAnnouncementIds.includes(
                                announcement.id
                              );

                              return (
                                <div
                                  key={announcement.id}
                                  className={`p-4 border-b last:border-b-0 ${
                                    isRead ? "opacity-75" : ""
                                  } ${colors.bg} ${
                                    colors.border
                                  } transition-colors`}
                                >
                                  <div className="flex items-start gap-3">
                                    {getAnnouncementIcon(announcement.type)}
                                    <div className="flex-1">
                                      <h4 className="font-medium text-[var(--text-primary)] mb-1">
                                        {announcement.title}
                                      </h4>
                                      <div className="text-[var(--text-secondary)] prose max-w-none prose-p:my-2 prose-headings:my-3">
                                        <LazyMarkdown>{announcement.content}</LazyMarkdown>
                                      </div>
                                      <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs text-[var(--text-tertiary)]">
                                          {new Date(
                                            announcement.createdAt
                                          ).toLocaleDateString("tr-TR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        {!isRead && (
                                          <button
                                            onClick={() =>
                                              markAsRead(announcement.id)
                                            }
                                            className="text-xs text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium"
                                          >
                                            Okundu işaretle
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center text-[var(--text-secondary)]">
                              <Bell
                                className="mx-auto mb-2 text-[var(--text-secondary)]"
                                size={24}
                              />
                              <p>Henüz duyuru yok</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {(currentListing || carContent) && roundStartTime && status === "PLAYING" && (
                <Timer timeLeft={timeLeft} />
              )}
              <button
                onClick={() => handleLeaveRoom("/kullanici-odalari")}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-color)] hover:text-[var(--text-primary)]"
              >
                <Users size={18} />
                <span>Kullanıcı Odaları</span>
              </button>
              {user && <ScoreBoard totalScore={user.score} />}
              {user && (
                <div className="relative">
                  <div
                    className="flex items-center gap-2 cursor-pointer rounded-full px-3 py-2 transition-colors hover:bg-[var(--hover-color)]"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="text-sm text-[var(--text-primary)]">
                      Hoşgeldin, <b>{user.username}</b>
                    </span>
                  </div>
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl rounded-2xl py-2 min-w-[200px] z-50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-color)] text-red-500"
                      >
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileEditModal(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-color)] text-[var(--text-primary)]"
                      >
                        <Settings size={20} />
                        <span>Profil Düzenle</span>
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2 w-full hover:bg-[var(--hover-color)]">
                        <Volume2
                          size={20}
                          className="text-[var(--text-primary)]"
                        />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-full accent-[var(--accent-color)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!isAuthenticated && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenAuth("login")}
                    className="btn-ghost text-sm"
                  >
                    <LogIn size={18} />
                    <span>Giriş</span>
                  </button>
                  <button
                    onClick={() => onOpenAuth("register")}
                    className="btn-accent text-sm"
                  >
                    <UserPlus size={18} />
                    <span>Kayıt</span>
                  </button>
                </div>
              )}
              <ThemeToggle
                isDarkMode={isDarkMode}
                onToggleTheme={onToggleTheme}
              />
              <div className="relative">
                <button
                  onClick={() => setShowAnnouncements(!showAnnouncements)}
                  className="icon-btn relative"
                >
                  <Bell size={22} />
                  {getUnreadCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--error-text)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getUnreadCount()}
                    </span>
                  )}
                </button>
                {showAnnouncements && (
                  <div className="absolute top-full right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl rounded-2xl py-2 w-96 max-h-[32rem] overflow-y-auto z-50">
                    <div className="px-4 py-2 border-b border-[var(--border-color)]">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        Duyurular
                      </h3>
                    </div>
                    {announcements.length > 0 ? (
                      announcements.map((announcement) => {
                        const colors = getAnnouncementColors(announcement.type);
                        const isRead = readAnnouncementIds.includes(
                          announcement.id
                        );

                        return (
                          <div
                            key={announcement.id}
                            className={`p-4 border-b last:border-b-0 ${
                              isRead ? "opacity-75" : ""
                            } ${colors.bg} ${colors.border} transition-colors`}
                          >
                            <div className="flex items-start gap-3">
                              {getAnnouncementIcon(announcement.type)}
                              <div className="flex-1">
                                <h4 className="font-medium text-[var(--text-primary)] mb-1">
                                  {announcement.title}
                                </h4>
                                <div className="text-[var(--text-secondary)] prose max-w-none prose-p:my-2 prose-headings:my-3">
                                  <LazyMarkdown>{announcement.content}</LazyMarkdown>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-xs text-[var(--text-tertiary)]">
                                    {new Date(
                                      announcement.createdAt
                                    ).toLocaleDateString("tr-TR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {!isRead && (
                                    <button
                                      onClick={() =>
                                        markAsRead(announcement.id)
                                      }
                                      className="text-xs text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium"
                                    >
                                      Okundu işaretle
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-[var(--text-secondary)]">
                        <Bell
                          className="mx-auto mb-2 text-[var(--text-secondary)]"
                          size={24}
                        />
                        <p>Henüz duyuru yok</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      <ProfileEditModal
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
      />
    </>
  );
};
