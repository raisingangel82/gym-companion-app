import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SettingsContextType {
  restTime: number;
  setRestTime: (time: number) => void;
  autoRestTimer: boolean;
  setAutoRestTimer: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [restTime, setRestTimeState] = useState<number>(() => {
    const saved = localStorage.getItem('settings_restTime');
    return saved ? JSON.parse(saved) : 60;
  });

  const [autoRestTimer, setAutoRestTimerState] = useState<boolean>(() => {
    const saved = localStorage.getItem('settings_autoRestTimer');
    return saved ? JSON.parse(saved) : true;
  });

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