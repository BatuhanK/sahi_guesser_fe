import React from "react";

export const GameOver: React.FC = () => {
  const score = 0;

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="text-center space-y-6 bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-[var(--text-primary)]">
        Oyun Bitti!
      </h2>
      <p className="text-xl text-[var(--text-primary)]">Toplam Puan: {score}</p>
      <button
        onClick={handleRestart}
        className="flex items-center gap-2 mx-auto bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-lg transition-colors"
      >
        Tekrar Oyna
      </button>
    </div>
  );
};
