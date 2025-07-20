// src/components/ui/Button.tsx
import React, { ReactNode } from 'react';

// Interfaccia semplificata
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  // La variante non è più necessaria, lo stile viene passato tramite className
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  // Classi di base per tutti i pulsanti
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Classi per la variante secondaria (grigia), che è l'unica che rimane standard
  const secondaryVariantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500';

  // Se viene passata una classe di background (es. bg-blue-600), non applichiamo lo stile secondario
  const finalClassName = className.includes('bg-') ? `${baseClasses} ${className}` : `${baseClasses} ${secondaryVariantClasses} ${className}`;

  return (
    <button
      className={finalClassName}
      {...props}
    >
      {children}
    </button>
  );
};
