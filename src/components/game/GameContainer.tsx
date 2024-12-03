import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { Category, categoryApi, roomApi } from "../../services/api";
import { socketService } from "../../services/socket";
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
      console.log("we are in initializeRoom slug: ", slug, "room:", room?.id);
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
      <GameBoard />
    </div>
  );
};
