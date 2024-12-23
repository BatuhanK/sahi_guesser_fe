import {
  ChevronDown,
  ChevronUp,
  Crown,
  Home,
  ListFilter,
  Medal,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { iconMap } from "./ui/iconmap";

interface LeaderboardEntry {
  username: string;
  score: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  onlinePlayerCount?: number;
}

interface LeaderboardTableProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function LeaderboardTable({
  isModal = false,
  onClose,
}: LeaderboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModal, onClose]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const endpoint = selectedCategory
          ? `/leaderboard/${selectedCategory}`
          : "/leaderboard";
        const response = await api.get(endpoint);
        setLeaderboard(response.data.leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedCategory]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="text-[var(--accent-color)]" size={20} />;
      case 1:
        return <Medal className="text-[var(--text-tertiary)]" size={20} />;
      case 2:
        return <Medal className="text-[var(--warning-text)]" size={20} />;
      default:
        return (
          <Trophy
            className="text-[var(--text-tertiary)] opacity-50"
            size={20}
          />
        );
    }
  };

  const getRowStyle = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-[var(--warning-bg)] border-2 border-[var(--accent-color)]";
      case 1:
        return "bg-[var(--bg-tertiary)] border-2 border-[var(--text-tertiary)]";
      case 2:
        return "bg-[var(--warning-bg)] border-2 border-[var(--warning-text)]";
      default:
        return "bg-[var(--bg-secondary)] border border-[var(--border-color)]";
    }
  };

  const getDaysAgo = (date: string): string => {
    const days = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Bugün katıldı";
    if (days === 1) return "Dün katıldı";
    return `${days} gün önce katıldı`;
  };

  const LeaderboardSkeleton = () => (
    <div className="space-y-2">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-2 rounded-lg ${getRowStyle(
            index
          )} animate-pulse`}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[var(--text-tertiary)] rounded-full opacity-20" />
            <div className="h-4 w-32 bg-[var(--text-tertiary)] rounded opacity-20" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 bg-[var(--text-tertiary)] rounded opacity-20 hidden sm:block" />
            <div className="h-4 w-20 bg-[var(--text-tertiary)] rounded opacity-20" />
          </div>
        </div>
      ))}
    </div>
  );

  const CategorySelector = () => {
    if (isModal) {
      return (
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full px-4 py-2 rounded-lg flex items-center justify-between bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
          >
            <div className="flex items-center gap-2">
              <ListFilter size={20} />
              <span>
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name
                  : "Genel"}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`transform transition-transform ${
                showCategoryDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showCategoryDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg py-1">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryDropdown(false);
                }}
                className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-[var(--bg-tertiary)] ${
                  selectedCategory === null ? "text-[var(--accent-color)]" : ""
                }`}
              >
                <Trophy size={20} />
                <span>Genel</span>
              </button>
              {categories.map((category) => {
                const IconComponent =
                  iconMap[category.icon?.toLowerCase() || "home"] || Home;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-[var(--bg-tertiary)] ${
                      selectedCategory === category.slug
                        ? "text-[var(--accent-color)]"
                        : ""
                    }`}
                  >
                    <IconComponent size={20} />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            selectedCategory === null
              ? "bg-[var(--accent-color)] text-white"
              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          }`}
        >
          <Trophy size={20} />
          <span>Genel</span>
        </button>
        {categories.map((category) => {
          const IconComponent =
            iconMap[category.icon?.toLowerCase() || "home"] || Home;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedCategory === category.slug
                  ? "bg-[var(--accent-color)] text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              <IconComponent size={20} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const displayedLeaderboard = showAll ? leaderboard : leaderboard.slice(0, 5);

  return (
    <div
      className={`space-y-4 ${
        isModal ? "max-h-[80vh] overflow-y-auto p-4" : ""
      }`}
      ref={isModal ? modalRef : null}
    >
      <CategorySelector />

      <div className="border-2 border-[var(--accent-color)] rounded-lg shadow-md p-4 bg-[var(--bg-secondary)]">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : (
          <>
            <div className="space-y-2">
              {displayedLeaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all hover:scale-[1.01] ${getRowStyle(
                    index
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">
                      {entry.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">
                      {getDaysAgo(entry.createdAt)}
                    </span>
                    <span className="font-bold text-[var(--success-text)] text-sm">
                      {entry.score.toLocaleString("tr-TR")} puan
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-2 flex items-center justify-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showAll ? (
                  <>
                    Daha az göster <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Tümünü göster <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
