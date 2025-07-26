import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

// Rimosso 'playSound' dal tipo
interface TimerContextType {
  isTimerActive: boolean;
  timeLeft: number;
  initialDuration: number;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
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

  // Tutta la logica audio è stata rimossa da questo file

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
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};