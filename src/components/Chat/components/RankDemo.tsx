import { cn } from "../../../lib/utils";

const DemoUser = ({ username, score }: { username: string; score: number }) => {
  const getScoreBasedEffects = (score: number) => {
    if (score >= 1_000_000) {
      return {
        className:
          "animate-rainbow font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF0000] via-[#00FF00] to-[#0000FF] hover:scale-110 transform transition-transform",
        prefix: "👑",
        suffix: "👑",
        description: "Efsanevi Oyuncu",
        containerClass: "animate-glow border-2 border-purple-500",
      };
    }
    if (score >= 500_000) {
      return {
        className:
          "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 animate-shimmer hover:scale-105 transform transition-transform",
        prefix: "⭐",
        suffix: "⭐",
        description: "Usta Oyuncu",
        containerClass: "border-2 border-yellow-500/50",
      };
    }
    if (score >= 100_000) {
      return {
        className:
          "font-bold text-transparent bg-clip-text animate-pulse bg-gradient-to-r from-emerald-400 to-cyan-400 hover:scale-105 transform transition-transform",
        prefix: "💎",
        suffix: "💎",
        description: "Uzman Oyuncu",
        containerClass: "border-2 border-emerald-500/30",
      };
    }
    if (score >= 30_000) {
      return {
        className:
          "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 hover:scale-105 transform transition-transform",
        prefix: "🌟",
        suffix: "🌟",
        description: "Deneyimli Oyuncu",
        containerClass: "border-2 border-blue-500/20",
      };
    }
    if (score > 0) {
      return {
        className:
          "font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700 hover:scale-105 transform transition-transform",
        prefix: "⚡",
        suffix: "",
        description: "Acemi Oyuncu",
        containerClass: "",
      };
    }
    return {
      className:
        "text-[#F1C40F] hover:scale-105 transform transition-transform",
      prefix: "🎮",
      suffix: "",
      description: "Yeni Oyuncu",
      containerClass: "",
    };
  };

  const effects = getScoreBasedEffects(score);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-secondary)] transition-all duration-300 hover:shadow-lg",
        effects.containerClass
      )}
    >
      <div className="flex flex-col">
        <span
          className={cn("text-lg", effects.className)}
          title={`${score.toLocaleString()} puan`}
        >
          {effects.prefix} {username} {effects.suffix}
        </span>
        <span className="text-xs text-[var(--text-tertiary)] mt-1">
          {effects.description}
        </span>
      </div>
      <div className="flex flex-col items-end ml-auto">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {score.toLocaleString()}
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">puan</span>
      </div>
    </div>
  );
};

export const RankDemo = () => {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl bg-[var(--bg-primary)] max-w-md mx-auto shadow-xl">
      <h2 className="text-xl font-bold text-center text-[var(--text-primary)] mb-2">
        🏆 Rütbeler
      </h2>
      <DemoUser username="MasterGamer" score={1_500_000} />
      <DemoUser username="ProPlayer" score={750_000} />
      <DemoUser username="Expert" score={250_000} />
      <DemoUser username="Skilled" score={50_000} />
      <DemoUser username="Rookie" score={15_000} />
      <DemoUser username="Newbie" score={0} />
      <div className="text-center text-sm text-[var(--text-secondary)] mt-2">
        Daha yüksek rütbeler için daha çok puan kazanın! 🚀
      </div>
    </div>
  );
};
