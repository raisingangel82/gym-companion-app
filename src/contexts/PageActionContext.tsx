// src/contexts/PageActionContext.tsx

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ActionConfig } from '../types/actions'; // Assicurati che questo path sia corretto

// MODIFICA: Il contesto ora gestisce un intero ActionConfig o null
type PageActionState = ActionConfig | null;

interface PageActionContextType {
  // MODIFICA: La funzione è stata rinominata per chiarezza e ora accetta ActionConfig
  setActionConfig: (config: PageActionState) => void;
  actionConfig: PageActionState;
}

const PageActionContext = createContext<PageActionContextType | undefined>(undefined);

export const PageActionProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<PageActionState>(null);

  // MODIFICA: La funzione ora imposta l'intero oggetto di configurazione
  const handleSetConfig = useCallback((newConfig: PageActionState) => {
    setConfig(newConfig);
  }, []);

  const value = { setActionConfig: handleSetConfig, actionConfig: config };

  return (
    <PageActionContext.Provider value={value}>
      {children}
    </PageActionContext.Provider>
  );
};

export const usePageAction = () => {
  const context = useContext(PageActionContext);
  if (context === undefined) {
    throw new Error('usePageAction must be used within a PageActionProvider');
  }
  return context;
};