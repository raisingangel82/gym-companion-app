/// <reference lib="dom" />

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

// Interfaccia che definisce la forma del nostro contesto
interface RestTimerContextType {
  isTimerActive: boolean;
  timeLeft: number;
  initialDuration: number;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
  playSound: () => void;
}

// Creazione del contesto React
const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

// Hook personalizzato per utilizzare il contesto più facilmente
export const useRestTimer = () => {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error("useRestTimer deve essere usato all'interno di un RestTimerProvider");
  }
  return context;
};

// Il componente Provider che conterrà tutta la logica
export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext>();

  // Effetto per inizializzare il contesto audio in modo sicuro e robusto
  useEffect(() => {
    const initAndUnlockAudio = () => {
      if (audioContextRef.current) return;

      let context: AudioContext | undefined;

      // Percorso 1: Browser moderni
      if (window.AudioContext) {
        try {
          // ===================================================================
          // CORREZIONE: Forniamo un argomento specifico come richiesto.
          context = new window.AudioContext({ sampleRate: 44100 });
          // ===================================================================
        } catch (e) {
          console.error("Impossibile creare AudioContext (moderno):", e);
        }
      } 
      // Percorso 2: Fallback per browser legacy (es. Safari datato)
      else if ((window as any).webkitAudioContext) {
        try {
          const LegacyAudioContext = (window as any).webkitAudioContext;
          // Il costruttore legacy non accetta argomenti
          // @ts-ignore
          context = new LegacyAudioContext();
        } catch (e) {
          console.error("Impossibile creare webkitAudioContext (legacy):", e);
        }
      }

      if (context) {
        audioContextRef.current = context;
        // Sblocca il contesto per la riproduzione
        if (context.state === 'suspended') {
          context.resume();
        }
      } else {
        console.warn("Web Audio API non è supportata in questo browser.");
      }
    };

    document.addEventListener('click', initAndUnlockAudio, { once: true });

    return () => {
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  const playSound = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTimerActive(false);
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft <= 0) {
      stopTimer();
      playSound();
    }
  }, [timeLeft, isTimerActive, stopTimer, playSound]);

  const startTimer = (duration: number) => {
    stopTimer();
    setInitialDuration(duration);
    setTimeLeft(duration);
    setIsTimerActive(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const addTime = (seconds: number) => {
    if (isTimerActive && timeLeft > 0) {
      setTimeLeft(prev => prev + seconds);
      setInitialDuration(prev => prev + seconds);
    }
  };

  const value = {
    isTimerActive,
    timeLeft,
    initialDuration,
    startTimer,
    stopTimer,
    addTime,
    playSound,
  };

  return <RestTimerContext.Provider value={value}>{children}</RestTimerContext.Provider>;
};