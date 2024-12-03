import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { X } from "lucide-react";
import { Category, categoryApi, roomApi } from "../../services/api";
import { socketService } from "../../services/socket";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useGameStore } from "../../store/gameStore";
import { CategorySelector } from "../CategorySelector";
import { LeaderboardTable } from "../LeaderboardTable";
import { Loader } from "../ui/Loader";
import { GameBoard } from "./GameBoard";

export const GameContainer: React.FC = () => {
  const { currentListing, roomId, room } = useGameStore();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setSelectedCategory] = useState<string | null>(null);

  const { announcements, markAsRead, readAnnouncementIds } =
    useAnnouncementStore();

  const latestAnnouncement = announcements[0];
  const isLatestRead = latestAnnouncement
    ? readAnnouncementIds.includes(latestAnnouncement.id)
    : true;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryApi.getAll();
        setCategories(categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
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

  if (!currentListing && roomId) {
    return <Loader text="Oyuna bağlanılıyor..." />;
  }

  if (!roomId) {
    return (
      <div className="space-y-6">
        {latestAnnouncement && !isLatestRead && (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 relative">
            <button
              onClick={() => markAsRead(latestAnnouncement.id)}
              className="absolute top-2 right-2 hover:bg-yellow-200 p-1 rounded"
            >
              <X size={16} />
            </button>
            <h4 className="font-medium text-yellow-800 mb-1">
              {latestAnnouncement.title}
            </h4>
            <p className="text-yellow-700">{latestAnnouncement.content}</p>
          </div>
        )}
        <CategorySelector
          categories={categories}
          onSelect={handleCategorySelect}
        />
        <LeaderboardTable />
      </div>
    );
  }

  return (
    <div className="h-full">
      {latestAnnouncement && !isLatestRead && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 mb-4 relative">
          <button
            onClick={() => markAsRead(latestAnnouncement.id)}
            className="absolute top-2 right-2 hover:bg-yellow-200 p-1 rounded"
          >
            <X size={16} />
          </button>
          <h4 className="font-medium text-yellow-800 mb-1">
            {latestAnnouncement.title}
          </h4>
          <p className="text-yellow-700">{latestAnnouncement.content}</p>
        </div>
      )}
      <GameBoard />
    </div>
  );
};
