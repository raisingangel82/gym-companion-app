import React, { createContext, useContext, useState, useCallback } from 'react';

// NON ESPORTIAMO PIÙ ActionConfig da qui.
interface ActionConfig {
  icon: React.ElementType;
  onClick: () => void;
  label: string;
}

interface CentralActionContextType {
  actionConfig: ActionConfig | null;
  setActionConfig: (config: ActionConfig | null) => void;
}

const CentralActionContext = createContext<CentralActionContextType>({
  actionConfig: null,
  setActionConfig: () => {},
});

export const CentralActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actionConfig, setActionConfigState] = useState<ActionConfig | null>(null);

  const setActionConfig = useCallback((config: ActionConfig | null) => {
    setActionConfigState(config);
  }, []);

  return (
    <CentralActionContext.Provider value={{ actionConfig, setActionConfig }}>
      {children}
    </CentralActionContext.Provider>
  );
};

export const useCentralAction = () => useContext(CentralActionContext);