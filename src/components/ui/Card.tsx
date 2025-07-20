// src/components/ui/Card.tsx
import React, { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  const baseClasses = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4";
  
  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};