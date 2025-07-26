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

  useEffect(() => {
    // Inizializza e sblocca il contesto audio al primo tocco dell'utente.
    const initAndUnlockAudio = () => {
      // Se il contesto è già stato creato, non fare nulla.
      if (audioContextRef.current) return;

      // Verifica se l'API moderna è supportata.
      if (window.AudioContext) {
        try {
          // Crea il contesto audio passando un oggetto vuoto {}
          // per risolvere l'errore di compilazione su Vercel.
          const context = new window.AudioContext({});
          audioContextRef.current = context;

          // "Sblocca" il contesto per la riproduzione automatica.
          if (context.state === 'suspended') {
            context.resume();
          }
          // Riproduci un buffer silenzioso per attivare l'audio.
          const buffer = context.createBuffer(1, 1, 22050);
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          source.start(0);

        } catch (e) {
          console.error("Creazione di AudioContext fallita:", e);
        }
      } else {
        console.warn("Web Audio API non è supportata in questo browser.");
      }
    };

    document.addEventListener('click', initAndUnlockAudio, { once: true });

    // Pulisci il contesto audio quando il componente viene smontato.
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
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Frequenza del "beep"

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
      stopTimer();
      // Potresti voler chiamare playSound() qui quando il timer raggiunge lo zero.
    }
  }, [timeLeft, isTimerActive, stopTimer]);

  const startTimer = (duration: number) => {
    stopTimer(); // Ferma qualsiasi timer precedente
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
      setInitialDuration(prev => prev + seconds); // Aggiorna anche la durata iniziale se necessario
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