import {
  Activity,
  Ban,
  CirclePlay,
  Hourglass,
  Users,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader } from "../../components/ui/Loader";
import {
  adminApi,
  type AdminRoom,
  type AdminStats,
} from "../../services/api";
import { AdminBadge } from "./components";
import { roomStatusBadge } from "./utils";

const POLL_INTERVAL_MS = 15000;

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [statsData, roomsData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getLiveRooms(),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setRooms(roomsData);
        }
      } catch (error) {
        console.error("Admin verileri yüklenemedi:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader text="Yükleniyor..." />
      </div>
    );
  }

  const statCards = [
    {
      label: "Çevrimiçi Oyuncu",
      value: stats?.onlineUsers,
      icon: Wifi,
      tone: "text-[var(--success-text)]",
      bg: "bg-[var(--success-bg)]",
    },
    {
      label: "Aktif Oda",
      value: stats?.activeRooms,
      icon: Activity,
      tone: "text-[var(--accent-color)]",
      bg: "bg-[var(--accent-muted)]",
    },
    {
      label: "Bekleyen Oda",
      value: stats?.waitingRooms,
      icon: Hourglass,
      tone: "text-[var(--warning-text)]",
      bg: "bg-[var(--warning-bg)]",
    },
    {
      label: "Oynanan Oda",
      value: stats?.playingRooms,
      icon: CirclePlay,
      tone: "text-[var(--info-text)]",
      bg: "bg-[var(--info-bg)]",
    },
    {
      label: "Toplam Üye",
      value: stats?.totalUsers,
      icon: Users,
      tone: "text-[var(--text-secondary)]",
      bg: "bg-[var(--bg-tertiary)]",
    },
    {
      label: "Banlı Kullanıcı",
      value: stats?.bannedUsers,
      icon: Ban,
      tone: "text-[var(--error-text)]",
      bg: "bg-[var(--error-bg)]",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="surface-card p-4">
            <div
              className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-5 h-5 ${card.tone}`} />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {(card.value ?? 0).toLocaleString("tr-TR")}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <h2 className="font-semibold text-[var(--text-primary)]">
            Oynanan Odalar
          </h2>
          <Link
            to="/admin/canli"
            className="text-sm text-[var(--accent-color)] hover:underline"
          >
            Canlı izlemeye git
          </Link>
        </div>
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            Şu an oynanan oda yok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-color)]">
                  <th className="px-5 py-3 font-medium">Oda</th>
                  <th className="px-5 py-3 font-medium">Oyun Tipi</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Oyuncu</th>
                  <th className="px-5 py-3 font-medium">Görünürlük</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const badge = roomStatusBadge(room.status);
                  return (
                    <tr
                      key={room.id}
                      className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-color)] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-[var(--text-primary)]">
                          {room.name}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {room.slug}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {room.gameType}
                      </td>
                      <td className="px-5 py-3">
                        <AdminBadge tone={badge.tone}>{badge.label}</AdminBadge>
                      </td>
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {room.playerCount}
                      </td>
                      <td className="px-5 py-3">
                        <AdminBadge tone={room.isPublic ? "info" : "neutral"}>
                          {room.isPublic ? "Herkese Açık" : "Özel"}
                        </AdminBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
