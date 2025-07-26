import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

interface TimerContextType {
  isTimerActive: boolean;
  timeLeft: number;
  initialDuration: number;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
  playSound: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer deve essere usato all'interno di un TimerProvider");
  }
  return context;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext>();

  // MODIFICA CHIAVE: Logica di "sblocco" dell'audio
  useEffect(() => {
    const initAndUnlockAudio = () => {
      if (!audioContextRef.current) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
        
        // Il "trucco": riproduci un buffer silenzioso per attivare il contesto
        // Questo è necessario perché il contesto audio parte in stato 'suspended'
        const buffer = context.createBuffer(1, 1, 22050);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);

        // Ora il contesto è 'running' e può riprodurre suoni in seguito
        if (context.state === 'suspended') {
          context.resume();
        }
      }
    };
    // Aggiungiamo l'evento al primo click, poi lo rimuoviamo
    document.addEventListener('click', initAndUnlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAndUnlockAudio);
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

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopTimer = useCallback(() => {
    clearTimerInterval();
    setIsTimerActive(false);
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft <= 0) {
      clearTimerInterval();
    }
  }, [timeLeft, isTimerActive]);

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

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};