import React from 'react';

/**
 * Definisce la struttura per la configurazione del pulsante d'azione centrale.
 */
export interface ActionConfig {
  icon: React.ElementType;
  onClick: () => void;
  label: string;
  disabled?: boolean; // Il campo 'disabled' è opzionale
}