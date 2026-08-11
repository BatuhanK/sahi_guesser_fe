import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Car, ChevronRight, Sparkles, Tag } from "lucide-react";

/** Anasayfadaki car-guess tanıtım kartı — `/araba-tahmin` lobisine götürür. */
export const CarGuessBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/araba-tahmin")}
      className="group relative w-full max-w-3xl mx-auto surface-card-interactive overflow-hidden p-6 md:p-8 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-48 w-96 max-w-full -translate-x-1/2 rounded-full opacity-70 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(closest-side, rgba(var(--accent-rgb), 0.2), transparent)",
        }}
      />

      <div className="relative flex flex-col items-center gap-3 md:gap-4">
        <span className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--accent-muted)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
          <Car className="h-7 w-7 md:h-8 md:w-8 text-[var(--accent-color)]" />
        </span>

        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[var(--accent-color)] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            <Sparkles className="h-3 w-3" />
            Yeni Oyun
          </span>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Araba Tahmin
          </h3>
        </div>

        <p className="max-w-md text-xs md:text-sm text-[var(--text-secondary)]">
          Fotoğrafına ve fiyatına bak; markayı, modeli ve yılı bil — her parça
          ayrı puan!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs text-[var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] px-2.5 py-1">
            <Car className="h-3 w-3" /> 10 marka
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] px-2.5 py-1">
            <Tag className="h-3 w-3" /> 10 model
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] px-2.5 py-1">
            <Calendar className="h-3 w-3" /> 5 yıl
          </span>
        </div>

        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-color)] px-6 py-2.5 text-sm md:text-base font-semibold text-white shadow-lg transition-all duration-300 group-hover:bg-[var(--accent-hover)] group-hover:shadow-[0_12px_32px_rgba(var(--accent-rgb),0.35)]">
          Oyna
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
};
