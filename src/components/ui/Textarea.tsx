import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  const baseClasses = "w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base text-gray-900 dark:text-gray-100 disabled:opacity-50 min-h-[80px]";

  return (
    <textarea
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};