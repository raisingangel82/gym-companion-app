// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const baseClasses = "w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base text-gray-900 dark:text-gray-100 disabled:opacity-50";

  return (
    <input
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};