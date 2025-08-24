import * as React from 'react';

// Abbiamo bisogno del tipo ReactNode se non è già globale
import type { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// Utilizziamo React.forwardRef per avvolgere il tuo componente.
// Questo aggiunge un secondo argomento 'ref' alla funzione.
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    const baseClasses = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4";
    
    return (
      // Passiamo il 'ref' ricevuto direttamente al div sottostante.
      <div ref={ref} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

// È buona norma aggiungere un displayName per facilitare il debugging in React DevTools.
Card.displayName = 'Card';