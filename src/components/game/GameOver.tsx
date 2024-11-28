import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const GameOver: React.FC = () => {
  const { score } = useGameStore();

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="text-center space-y-6 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold">Oyun Bitti!</h2>
      <p className="text-xl">Toplam Puan: {score}</p>
      <button
        onClick={handleRestart}
        className="flex items-center gap-2 mx-auto bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Tekrar Oyna
      </button>
    </div>
  );
};