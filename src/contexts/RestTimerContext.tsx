/// <reference lib="dom" />

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

interface RestTimerContextType {
  isTimerActive: boolean;
  isAlarming: boolean; // NUOVO: Stato per l'allarme
  timeLeft: number;
  initialDuration: number;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
  playSound: () => void;
  stopAlarm: () => void; // NUOVO: Funzione per fermare l'allarme
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
  const [isAlarming, setIsAlarming] = useState(false); // NUOVO
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null); // NUOVO: Ref per l'intervallo dell'allarme
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAndUnlockAudio = () => {
      if (audioContextRef.current) return;
      try {
        const context = new window.AudioContext({ sampleRate: 44100 });
        audioContextRef.current = context;
        if (context.state === 'suspended') {
          context.resume();
        }
      } catch (e) {
        console.error("Creazione di AudioContext fallita:", e);
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
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerActive(false);
  }, []);

  // NUOVO: Funzione per fermare l'allarme
  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarming(false);
  }, []);

  // Effetto che gestisce la fine del timer
  useEffect(() => {
    if (isTimerActive && timeLeft <= 0) {
      stopTimer();
      setIsAlarming(true); // Invece di suonare una volta, attiva la fase di allarme
    }
  }, [timeLeft, isTimerActive, stopTimer]);
  
  // NUOVO: Effetto che gestisce la logica dell'allarme
  useEffect(() => {
    if (isAlarming) {
      // Fa partire il suono a ripetizione
      alarmIntervalRef.current = setInterval(() => {
        playSound();
      }, 1200); // Ripete il suono ogni 1.2 secondi
    } else {
      // Se non è più in allarme, ferma tutto
      stopAlarm();
    }

    // Funzione di pulizia per sicurezza
    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
    };
  }, [isAlarming, playSound, stopAlarm]);

  const startTimer = (duration: number) => {
    stopTimer();
    stopAlarm(); // Ferma qualsiasi allarme precedente quando parte un nuovo timer
    setInitialDuration(duration);
    setTimeLeft(duration);
    setIsTimerActive(true);
    setIsAlarming(false);
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
    isAlarming, // NUOVO
    timeLeft,
    initialDuration,
    startTimer,
    stopTimer,
    addTime,
    playSound,
    stopAlarm, // NUOVO
  };

  return <RestTimerContext.Provider value={value}>{children}</RestTimerContext.Provider>;
};