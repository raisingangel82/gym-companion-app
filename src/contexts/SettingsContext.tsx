// src/contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SettingsContextType {
  restTime: number;
  setRestTime: (time: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [restTime, setRestTime] = useLocalStorage<number>('settings_restTime', 90);

  const value = { restTime, setRestTime };

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
