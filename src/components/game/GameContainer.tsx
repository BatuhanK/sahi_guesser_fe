import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LazyMarkdown } from "../ui/LazyMarkdown";
import { useNavigate, useParams } from "react-router-dom";

import { Trophy, X } from "lucide-react";
import { Category, categoryApi, roomApi } from "../../services/api";
import { socketService } from "../../services/socket";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useAuthStore } from "../../store/authStore";
import { useGameStore } from "../../store/gameStore";
import { getAnnouncementColors, getAnnouncementIcon } from "../../utils/announcement";
import { CategorySelector } from "../CategorySelector";
import { ContactForm } from "../ContactForm";
import { LeaderboardTable } from "../LeaderboardTable";
import { Loader } from "../ui/Loader";
import { CarGuessBanner } from "./CarGuessBanner";
import { CarGuessBoard } from "./CarGuessBoard";
import { GameBoard } from "./GameBoard";

export const GameContainer: React.FC = () => {
  const { currentListing, currentQuestion, carContent, roomId, room } = useGameStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [, setSelectedCategory] = useState<string | null>(null);
  const [notSystemOnlinePlayerCount, setNotSystemOnlinePlayerCount] =
    useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  const { announcements, markAsRead, readAnnouncementIds } =
    useAnnouncementStore();

  const latestAnnouncement = announcements[0];
  const isLatestRead = latestAnnouncement
    ? readAnnouncementIds.includes(latestAnnouncement.id)
    : true;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await categoryApi.getAll();
        setCategories(categoryResponse.categories);
        setNotSystemOnlinePlayerCount(
          categoryResponse.notSystemOnlinePlayerCount
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [roomId]);

  useEffect(() => {
    let mounted = true;

    const initializeRoom = async () => {
      if (slug && !room && mounted) {
        try {
          const roomDetailsResponse = await roomApi.getDetails(slug);
          if (mounted) {
            useGameStore.getState().setRoom(roomDetailsResponse.room);
            useGameStore.getState().setRoomId(roomDetailsResponse.room.id);
            setSelectedCategory(roomDetailsResponse.category.slug);
            socketService.joinRoom(roomDetailsResponse.room.id);
          }
        } catch (error) {
          console.error("Failed to fetch room details:", error);
          if (mounted) {
            toast.error("Oda bulunamadı");
            navigate("/");
          }
        }
      }
    };

    initializeRoom();

    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  async function handleCategorySelect(categorySlug: string) {
    setSelectedCategory(categorySlug);
    const [room] = await categoryApi.getRooms(categorySlug);
    if (room) {
      useGameStore.getState().setRoom(room);
      socketService.joinRoom(room.id);
      navigate(`/oda/${room.slug}`);
    } else {
      toast.error("Bu kategori için oda bulunamadı.");
    }
  }

  if (isLoading) {
    return <Loader text="Kategoriler yükleniyor..." />;
  }

  if (!currentListing && !currentQuestion && !carContent && roomId) {
    if (user) {
      return <Loader text="Oyuna bağlanılıyor..." />;
    } else {
      return (
        <Loader text="Yeni round bekleniyor... Üye değilseniz üye olarak oyun oynayabilirsiniz." />
      );
    }
  }

  if (!roomId) {
    return (
      <div className="space-y-6 min-h-screen">
        {latestAnnouncement && !isLatestRead && (
          <div className="flex justify-center px-4 pt-4">
            <div
              className={`relative w-full max-w-xl ${getAnnouncementColors(latestAnnouncement.type).bg} border ${getAnnouncementColors(latestAnnouncement.type).border} rounded-xl shadow-lg p-6 text-center`}
            >
              <button
                onClick={() => markAsRead(latestAnnouncement.id)}
                aria-label="Duyuruyu kapat"
                className={`absolute top-3 right-3 ${getAnnouncementColors(latestAnnouncement.type).hover} p-1.5 rounded-full`}
              >
                <X size={18} className={`text-[var(--${latestAnnouncement.type}-text)]`} />
              </button>
              <div className="flex justify-center mb-3">
                {getAnnouncementIcon(latestAnnouncement.type)}
              </div>
              <h4 className={`font-semibold text-[var(--${latestAnnouncement.type}-text)] text-xl mb-2`}>
                {latestAnnouncement.title}
              </h4>
              <div className={`text-[var(--${latestAnnouncement.type}-text)] prose max-w-none prose-p:my-2 mx-auto`}>
                <LazyMarkdown>{latestAnnouncement.content}</LazyMarkdown>
              </div>
            </div>
          </div>
        )}
        <CategorySelector
          categories={categories}
          onSelect={handleCategorySelect}
          hasError={hasError}
          notSystemOnlinePlayerCount={notSystemOnlinePlayerCount}
          banner={<CarGuessBanner />}
        />
        {isLoading ? (
          <Loader text="Yükleniyor..." />
        ) : (
          <div className="pb-12">
            <div className="flex items-center justify-center gap-3 md:gap-5 my-10 md:my-14 px-4">
              <span className="h-px w-10 md:w-24 bg-gradient-to-r from-transparent to-[var(--border-color)]" />
              <span className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-[var(--accent-muted)]">
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-[var(--accent-color)]" />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Skor Tabloları
              </h2>
              <span className="h-px w-10 md:w-24 bg-gradient-to-l from-transparent to-[var(--border-color)]" />
            </div>
            <LeaderboardTable />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-24 sm:mb-32">
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      {latestAnnouncement && !isLatestRead && (
        <div className={`${getAnnouncementColors(latestAnnouncement.type).bg} border-l-4 ${getAnnouncementColors(latestAnnouncement.type).border} p-4 mb-4 relative`}>
          <button
            onClick={() => markAsRead(latestAnnouncement.id)}
            className={`absolute top-2 right-2 ${getAnnouncementColors(latestAnnouncement.type).hover} p-1 rounded`}
          >
            <X size={16} className={`text-[var(--${latestAnnouncement.type}-text)]`} />
          </button>
          <div className="flex items-start gap-3">
            {getAnnouncementIcon(latestAnnouncement.type)}
            <div className="flex-1">
              <h4 className={`font-medium text-[var(--${latestAnnouncement.type}-text)] mb-1`}>
                {latestAnnouncement.title}
              </h4>
              <div className={`text-[var(--${latestAnnouncement.type}-text)]/90 prose max-w-none`}>
                <LazyMarkdown>{latestAnnouncement.content}</LazyMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
      {room?.gameType === "car-guess" ? <CarGuessBoard /> : <GameBoard />}
    </div>
  );
};
