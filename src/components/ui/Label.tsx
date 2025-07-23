// src/components/ui/Label.tsx
import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = '', ...props }) => {
  const baseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <label
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};