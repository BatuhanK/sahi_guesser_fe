import React from 'react';
import { cn } from "./utils";

export const getPremiumIndicator = (isPremium: boolean, premiumLevel: number, asEmoji = true) => {
  if (!isPremium) return asEmoji ? "" : null;
  
  switch (premiumLevel) {
    case 3:
      return asEmoji ? "💰 " : <span title="Premium Seviye 3">💰</span>;
    case 2:
      return asEmoji ? "💎 " : <span title="Premium Seviye 2">💎</span>;
    case 1:
      return asEmoji ? "⭐ " : <span title="Premium Seviye 1">⭐</span>;
    default:
      return asEmoji ? "" : null;
  }
};

export const getScoreBasedEffects = (score: number) => {
  if (score >= 1_000_000) {
    return {
      className: cn(
        "font-black text-transparent bg-clip-text",
        "bg-[linear-gradient(45deg,#FF0000,#FF4500,#FF8C00,#FFD700,#FF0000)]",
        "bg-[length:200%_auto] animate-flow-fast",
        "hover:scale-110 transform transition-transform",
        "drop-shadow-[0_0_10px_rgba(255,69,0,0.5)]"
      ),
      prefix: "🔥",
      suffix: "🔥",
    };
  }
  if (score >= 500_000) {
    return {
      className:
        "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 animate-shimmer hover:scale-105 transform transition-transform",
      prefix: "⭐",
      suffix: "⭐",
    };
  }
  if (score >= 100_000) {
    return {
      className:
        "font-bold text-transparent bg-clip-text animate-pulse bg-gradient-to-r from-emerald-400 to-cyan-400 hover:scale-105 transform transition-transform",
      prefix: "💎",
      suffix: "💎",
    };
  }
  if (score >= 30_000) {
    return {
      className:
        "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 hover:scale-105 transform transition-transform",
      prefix: "🌟",
      suffix: "🌟",
    };
  }
  if (score > 0) {
    return {
      className:
        "font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700 hover:scale-105 transform transition-transform",
      prefix: "⚡",
      suffix: "",
    };
  }
  return {
    className: "text-[#F1C40F] hover:scale-105 transform transition-transform",
    prefix: "🎮",
    suffix: "",
  };
};

export const getUserBackgroundClass = (isAdmin: boolean, isModerator: boolean, isPremium: boolean, premiumLevel: number) => {
  return cn(
    "flex flex-col mb-1 px-2 py-1 rounded-lg transition-colors",
    isAdmin && "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-l-2 border-red-500",
    isModerator && "bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-l-2 border-purple-500",
    !isAdmin && !isModerator && isPremium && premiumLevel === 3 && "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-500",
    !isAdmin && !isModerator && isPremium && premiumLevel === 2 && "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-l-2 border-blue-500",
    !isAdmin && !isModerator && isPremium && premiumLevel === 1 && "bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border-l-2 border-green-500"
  );
}; 