// src/components/RestTimerModal.tsx

import React, { useState, useEffect } from 'react';
import { Timer, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface RestTimerModalProps {
  isOpen: boolean;
  duration: number;
  onClose: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({ isOpen, duration, onClose }) => {
  const { activeTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration); // Resetta il timer ogni volta che il modale si apre
    }
  }, [isOpen, duration]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) {
      if (timeLeft <= 0) onClose();
      return;
    }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [isOpen, timeLeft, onClose]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (!isOpen) return null;

  return (
    // L'overlay non copre la bottom bar (bottom-16)
    <div className="fixed inset-0 bottom-16 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-sm rounded-lg shadow-lg flex flex-col items-center gap-4 p-6 ${activeTheme.bg} text-white`}>
        <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20">
          <X size={20} />
        </button>
        <Timer size={32} />
        <div className="text-center">
          <p className="font-bold text-lg">Riposo</p>
          <p className="text-5xl font-mono">{formatTime(timeLeft)}</p>
        </div>
      </div>
    </div>
  );
};