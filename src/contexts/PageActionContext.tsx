// src/contexts/PageActionContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type PageAction = (() => void) | null;

interface PageActionContextType {
  registerAction: (action: PageAction) => void;
  registeredAction: PageAction;
}

const PageActionContext = createContext<PageActionContextType | undefined>(undefined);

export const PageActionProvider = ({ children }: { children: ReactNode }) => {
  const [action, setAction] = useState<PageAction>(null);

  const handleRegisterAction = useCallback((newAction: PageAction) => {
    setAction(() => newAction);
  }, []);

  const value = { registerAction: handleRegisterAction, registeredAction: action };

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