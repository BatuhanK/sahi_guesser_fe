import { ChevronDown, ChevronUp, Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

interface LeaderboardEntry {
  username: string;
  score: number;
  createdAt: string;
}

export function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get("/leaderboard");
        setLeaderboard(response.data.leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="text-yellow-400" size={20} />;
      case 1:
        return <Medal className="text-gray-400" size={20} />;
      case 2:
        return <Medal className="text-amber-600" size={20} />;
      default:
        return <Trophy className="text-gray-400 opacity-50" size={20} />;
    }
  };

  const getRowStyle = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-2 border-yellow-400";
      case 1:
        return "bg-gray-50 border-2 border-gray-400";
      case 2:
        return "bg-amber-50 border-2 border-amber-600";
      default:
        return "bg-white border border-gray-200";
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const displayedLeaderboard = showAll ? leaderboard : leaderboard.slice(0, 5);

  return (
    <div className="border-2 border-yellow-400 rounded-lg shadow-md p-4">
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
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {getDaysAgo(entry.createdAt)}
              </span>
              <span className="font-bold text-green-600 text-sm">
                {entry.score.toLocaleString("tr-TR")} puan
              </span>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
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
    </div>
  );
}
