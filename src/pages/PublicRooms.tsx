import { Clock, DollarSign, Plus, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePrivateRoomModal } from "../components/CreatePrivateRoomModal";
import { Loader } from "../components/ui/Loader";
import { iconMap } from "../components/ui/iconmap";
import { Category, categoryApi, roomApi } from "../services/api";
import { socketService } from "../services/socket";

interface RoomOwner {
  id: number;
  username: string;
  score: number;
}

interface PublicRoom {
  id: number;
  name: string;
  slug: string;
  status: string;
  isSystemRoom: boolean;
  maxRounds: number;
  categoryIds: number[];
  state: {
    roundNumber: number;
    nextListingId?: number;
    roundStartTime?: string;
    currentListingId?: number;
  };
  createdAt: string;
  updatedAt: string;
  roomSettings: {
    maxPrice: number;
    minPrice: number;
    maxGuessesPerRound: number;
    roundDurationSeconds: number;
  };
  isPublic: boolean;
  maxPlayers: number;
  ownerId: number;
  publicName: string;
  publicDescription: string;
  owner: RoomOwner;
}

interface PublicRoomsResponse {
  publicRooms: PublicRoom[];
  onlineCounts: Record<string, number>;
  categories: Category[];
}

export const PublicRooms = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PublicRoomsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleShowCreateModal = async () => {
    if (!categories) {
      await fetchCategories();
    }
    setShowCreateModal(true);
  };

  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        const response = await roomApi.getPublicRooms();
        setData(response);
        setError(null);
      } catch (err) {
        setError("Odalar yüklenirken bir hata oluştu.");
        console.error("Failed to fetch public rooms:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicRooms();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPublicRooms, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = (room: PublicRoom) => {
    socketService.joinRoom(room.id);
    navigate(`/oda/${room.slug}`);
  };

  const getCategoriesForRoom = (room: PublicRoom) => {
    if (!data?.categories) return [];
    return data.categories.filter(cat => room.categoryIds.includes(cat.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Kullanıcı Odaları</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Room Box */}
        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 border border-[var(--border-color)] border-dashed flex flex-col">
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-color)] bg-opacity-10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Yeni Oda Oluştur
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              Kendi odanı oluştur ve arkadaşlarınla oynamaya başla
            </p>
            <button
              onClick={handleShowCreateModal}
              className="mt-4 px-6 py-2.5 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors font-medium"
            >
              Oda Oluştur
            </button>
          </div>
        </div>

        {data?.publicRooms.map((room) => {
          const categories = getCategoriesForRoom(room);

          return (
            <div
              key={room.id}
              className="bg-[var(--bg-secondary)] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 border border-[var(--border-color)] flex flex-col"
            >
              {/* Header Section */}
              <div className="p-6 border-b border-[var(--border-color)]">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  {room.publicName}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-3">
                  {room.publicDescription}
                </p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => {
                      const CategoryIcon = category.icon ? iconMap[category.icon] : null;
                      return (
                        <div 
                          key={category.id}
                          className="flex items-center gap-2 text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-full text-sm"
                        >
                          {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
                          <span>{category.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Owner Info Section */}
              <div className="px-6 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-[var(--bg-secondary)] font-semibold">
                      {room.owner.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[var(--text-primary)] font-medium">
                        {room.owner.username}
                      </div>
                      <div className="flex items-center gap-1 text-[var(--text-secondary)] text-sm">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{room.owner.score.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full text-sm">
                    <Users className="w-4 h-4" />
                    <span>{data.onlineCounts[room.slug] || 0} / {room.maxPlayers}</span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6 flex-1">
                <div className="space-y-3">
                  <div className="flex items-center text-[var(--text-secondary)]">
                    <Clock className="w-5 h-5 mr-3 text-[var(--accent-color)]" />
                    <span>{room.roomSettings.roundDurationSeconds} saniye/tur</span>
                  </div>
                  
                  {room.roomSettings.minPrice && room.roomSettings.maxPrice && (
                    <div className="flex items-center text-[var(--text-secondary)]">
                      <DollarSign className="w-5 h-5 mr-3 text-[var(--accent-color)]" />
                      <span>
                        {room.roomSettings.minPrice.toLocaleString('tr-TR')} ₺ - {room.roomSettings.maxPrice.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Join Button Section */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleJoinRoom(room)}
                  className="w-full bg-[var(--accent-color)] text-white py-2.5 rounded-lg hover:bg-[var(--accent-hover)] transition-colors font-medium"
                >
                  {room.status === "PLAYING" ? "İzle" : "Katıl"}
                </button>
              </div>
            </div>
          );
        })}

        {data?.publicRooms.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-8 border border-[var(--border-color)] text-center max-w-md w-full space-y-6">
              <div className="text-[var(--text-secondary)] text-lg">
                Henüz açık oda bulunmuyor
              </div>
              <div className="text-sm text-[var(--text-tertiary)]">
                Hadi bir oda oluştur ve oyunu başlat
              </div>
              <button
                onClick={handleShowCreateModal}
                className="px-6 py-2.5 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors font-medium w-full"
              >
                Oda Oluştur
              </button>
            </div>
          </div>
        )}
      </div>

      {categories && (
        <CreatePrivateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          categories={categories}
          defaultPublic={true}
        />
      )}
    </div>
  );
}; 