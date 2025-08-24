import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// MODIFICA: Aggiornata l'interfaccia per includere due timer
interface SettingsContextType {
  restTimePrimary: number;
  setRestTimePrimary: (time: number) => void;
  restTimeSecondary: number;
  setRestTimeSecondary: (time: number) => void;
  autoRestTimer: boolean;
  setAutoRestTimer: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // MODIFICA: Sostituito restTime con restTimePrimary e restTimeSecondary
  const [restTimePrimary, setRestTimePrimaryState] = useState<number>(() => {
    const saved = localStorage.getItem('settings_restTimePrimary');
    return saved ? JSON.parse(saved) : 90; // Default per il primario
  });

  const [restTimeSecondary, setRestTimeSecondaryState] = useState<number>(() => {
    const saved = localStorage.getItem('settings_restTimeSecondary');
    return saved ? JSON.parse(saved) : 120; // Default per il secondario
  });

  const [autoRestTimer, setAutoRestTimerState] = useState<boolean>(() => {
    const saved = localStorage.getItem('settings_autoRestTimer');
    return saved ? JSON.parse(saved) : true;
  });

  // MODIFICA: Effetti per salvare entrambi i valori nel localStorage
  useEffect(() => {
    localStorage.setItem('settings_restTimePrimary', JSON.stringify(restTimePrimary));
  }, [restTimePrimary]);

  useEffect(() => {
    localStorage.setItem('settings_restTimeSecondary', JSON.stringify(restTimeSecondary));
  }, [restTimeSecondary]);

  useEffect(() => {
    localStorage.setItem('settings_autoRestTimer', JSON.stringify(autoRestTimer));
  }, [autoRestTimer]);
  
  // MODIFICA: Aggiornate le funzioni e il valore del contesto
  const setRestTimePrimary = (time: number) => setRestTimePrimaryState(time);
  const setRestTimeSecondary = (time: number) => setRestTimeSecondaryState(time);
  const setAutoRestTimer = (enabled: boolean) => setAutoRestTimerState(enabled);

  const value = { 
    restTimePrimary, 
    setRestTimePrimary, 
    restTimeSecondary, 
    setRestTimeSecondary, 
    autoRestTimer, 
    setAutoRestTimer 
  };

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