// src/components/AccountIcon.tsx
import React from 'react';
import { User } from 'lucide-react';

interface AccountIconProps {
  className?: string;
}

export const AccountIcon: React.FC<AccountIconProps> = ({ className }) => {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${className}`}>
      <User size={24} />
    </div>
  );
};