// src/contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SettingsContextType {
  restTime: number;
  setRestTime: (time: number) => void;
  autoRestTimer: boolean;
  setAutoRestTimer: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Carica i valori da localStorage o usa i default
  const [restTime, setRestTimeState] = useState<number>(() => {
    const saved = localStorage.getItem('settings_restTime');
    return saved ? JSON.parse(saved) : 60; // Default: 60 secondi
  });

  const [autoRestTimer, setAutoRestTimerState] = useState<boolean>(() => {
    const saved = localStorage.getItem('settings_autoRestTimer');
    return saved ? JSON.parse(saved) : true; // Default: attivo
  });

  // Salva in localStorage ogni volta che un valore cambia
  useEffect(() => {
    localStorage.setItem('settings_restTime', JSON.stringify(restTime));
  }, [restTime]);

  useEffect(() => {
    localStorage.setItem('settings_autoRestTimer', JSON.stringify(autoRestTimer));
  }, [autoRestTimer]);

  const setRestTime = (time: number) => setRestTimeState(time);
  const setAutoRestTimer = (enabled: boolean) => setAutoRestTimerState(enabled);

  const value = { restTime, setRestTime, autoRestTimer, setAutoRestTimer };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};