// src/contexts/WorkoutActionContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type WorkoutAction = (() => void) | null;

interface WorkoutActionContextType {
  // Funzione per "registrare" l'azione dal componente figlio (WorkoutPage)
  registerAction: (action: WorkoutAction) => void;
  // L'azione registrata, che sarà eseguita dal componente genitore (App)
  registeredAction: WorkoutAction;
}

const WorkoutActionContext = createContext<WorkoutActionContextType | undefined>(undefined);

export const WorkoutActionProvider = ({ children }: { children: ReactNode }) => {
  const [action, setAction] = useState<WorkoutAction>(null);

  // Usiamo useCallback per evitare che la funzione cambi ad ogni render, ottimizzando le performance.
  const handleRegisterAction = useCallback((newAction: WorkoutAction) => {
    setAction(() => newAction);
  }, []);

  const value = { registerAction: handleRegisterAction, registeredAction: action };

  return (
    <WorkoutActionContext.Provider value={value}>
      {children}
    </WorkoutActionContext.Provider>
  );
};

export const useWorkoutAction = () => {
  const context = useContext(WorkoutActionContext);
  if (context === undefined) {
    throw new Error('useWorkoutAction must be used within a WorkoutActionProvider');
  }
  return context;
};