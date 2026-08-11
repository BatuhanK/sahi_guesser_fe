import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Calendar, Car, Play, Tag, Trophy } from "lucide-react";

import { roomApi } from "../services/api";
import { socketService } from "../services/socket";
import { useGameStore } from "../store/gameStore";
import { Loader } from "../components/ui/Loader";

/** car-guess lobisi — system odasını bulur ve oyuna bağlar. */
export const CarGuessLanding: React.FC = () => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const { room } = await roomApi.getCarGuessRoom();
      useGameStore.getState().setRoom(room);
      useGameStore.getState().setRoomId(room.id);
      socketService.joinRoom(room.id);
      navigate(`/oda/${room.slug}`);
    } catch (error) {
      console.error("car-guess odası alınamadı:", error);
      toast.error("Araba tahmin odası şu an açık değil");
      setIsJoining(false);
    }
  };

  if (isJoining) {
    return <Loader text="Oyuna bağlanılıyor..." />;
  }

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-72 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(var(--accent-rgb), 0.18), transparent)",
        }}
      />
      <div className="group relative w-full max-w-2xl surface-card p-6 lg:p-10 text-center space-y-6">
        <div className="flex justify-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-muted)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
            <Car className="h-8 w-8 text-[var(--accent-color)]" />
          </span>
        </div>

        <div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Araba Tahmin
          </h1>
          <p className="mt-3 text-sm lg:text-base text-[var(--text-secondary)]">
            Fiyatını ve fotoğraflarını gördüğün arabanın markasını, modelini ve
            yılını tahmin et. Her parça ayrı puan — üçünü de bil, zirveye oyna!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
            <Car className="h-5 w-5 text-[var(--accent-color)] mb-2" />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Marka</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              10 marka arasından seç
            </p>
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
            <Tag className="h-5 w-5 text-[var(--accent-color)] mb-2" />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Model</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Her markaya ait bir model
            </p>
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
            <Calendar className="h-5 w-5 text-[var(--accent-color)] mb-2" />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Yıl</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              5 yıl seçeneğinden birini bul
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs lg:text-sm text-[var(--text-tertiary)]">
          <Trophy className="h-4 w-4" />
          <span>Her parçada tek tahmin hakkın var — hızlı bilen daha çok puan alır.</span>
        </div>

        <button
          type="button"
          onClick={handleJoin}
          className="btn-accent text-base lg:text-lg px-8 py-3"
        >
          <Play className="h-5 w-5" />
          Oyuna Katıl
        </button>
      </div>
    </div>
  );
};
