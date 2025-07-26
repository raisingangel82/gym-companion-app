/// <reference lib="dom" />

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

interface RestTimerContextType {
  isTimerActive: boolean;
  isAlarming: boolean;
  timeLeft: number;
  initialDuration: number;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
  stopAlarm: () => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

export const useRestTimer = () => {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error("useRestTimer deve essere usato all'interno di un RestTimerProvider");
  }
  return context;
};

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAlarming, setIsAlarming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  useEffect(() => {
    const initAndUnlockAudio = () => {
      if (audioContextRef.current) return;
      try {
        const context = new window.AudioContext({ sampleRate: 44100 });
        audioContextRef.current = context;
        if (context.state === 'suspended') context.resume();
      } catch (e) {
        console.error("Creazione di AudioContext fallita:", e);
      }
    };
    document.addEventListener('click', initAndUnlockAudio, { once: true });
    return () => audioContextRef.current?.close().catch(() => {});
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerActive(false);
  }, []);

  const stopAlarm = useCallback(() => {
    setIsAlarming(false);
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft <= 0) {
      stopTimer();
      setIsAlarming(true);
    }
  }, [timeLeft, isTimerActive, stopTimer]);
  
  // ===================================================================
  // ECCO LA CORREZIONE CHIAVE
  // Questo useEffect ora gestisce l'allarme in modo più pulito.
  // ===================================================================
  useEffect(() => {
    if (isAlarming) {
      const intervalId = setInterval(() => {
        playSound();
      }, 1200);

      // La funzione di pulizia viene restituita e si occupa di fermare l'intervallo
      // quando 'isAlarming' diventa 'false' o il componente si smonta.
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isAlarming, playSound]);

  const startTimer = (duration: number) => {
    stopTimer();
    stopAlarm();
    setInitialDuration(duration);
    setTimeLeft(duration);
    setIsTimerActive(true);
    timerIntervalRef.current = setInterval(() => {
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
    isAlarming,
    timeLeft,
    initialDuration,
    startTimer,
    stopTimer,
    addTime,
    stopAlarm,
  };

  return <RestTimerContext.Provider value={value}>{children}</RestTimerContext.Provider>;
};