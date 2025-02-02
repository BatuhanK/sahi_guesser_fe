import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { X } from "lucide-react";
import { Category, categoryApi, roomApi } from "../../services/api";
import { socketService } from "../../services/socket";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useAuthStore } from "../../store/authStore";
import { useGameStore } from "../../store/gameStore";
import { CategorySelector } from "../CategorySelector";
import { LeaderboardTable } from "../LeaderboardTable";
import { Loader } from "../ui/Loader";
import { GameBoard } from "./GameBoard";
import { ContactForm } from "../ContactForm";

export const GameContainer: React.FC = () => {
  const { currentListing, currentQuestion, roomId, room } = useGameStore();
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

  if (!currentListing && !currentQuestion && roomId) {
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
          <div className="bg-[var(--warning-bg)] border-l-4 border-[var(--warning-text)] p-4 relative">
            <button
              onClick={() => markAsRead(latestAnnouncement.id)}
              className="absolute top-2 right-2 hover:bg-[var(--warning-bg)]/80 p-1 rounded"
            >
              <X size={16} className="text-[var(--warning-text)]" />
            </button>
            <h4 className="font-medium text-[var(--warning-text)] mb-1">
              {latestAnnouncement.title}
            </h4>
            <p className="text-[var(--warning-text)]/90">
              {latestAnnouncement.content}
            </p>
          </div>
        )}
        <CategorySelector
          categories={categories}
          onSelect={handleCategorySelect}
          hasError={hasError}
          notSystemOnlinePlayerCount={notSystemOnlinePlayerCount}
        />
        <div className="w-full h-[1px] bg-[var(--border-color)]"></div>

        {isLoading ? (
          <Loader text="Yükleniyor..." />
        ) : (
          <div className="py-[12px]">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 md:gap-8 my-8">
              {/* //divider */}
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                Skor Tabloları
              </h2>
              <LeaderboardTable />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-24 sm:mb-32">
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      {latestAnnouncement && !isLatestRead && (
        <div className="bg-[var(--warning-bg)] border-l-4 border-[var(--warning-text)] p-4 mb-4 relative">
          <button
            onClick={() => markAsRead(latestAnnouncement.id)}
            className="absolute top-2 right-2 hover:bg-[var(--warning-bg)]/80 p-1 rounded"
          >
            <X size={16} className="text-[var(--warning-text)]" />
          </button>
          <h4 className="font-medium text-[var(--warning-text)] mb-1">
            {latestAnnouncement.title}
          </h4>
          <p className="text-[var(--warning-text)]/90">
            {latestAnnouncement.content}
          </p>
        </div>
      )}
      <GameBoard />
    </div>
  );
};
