import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface RpeSelectorProps {
  value: number;
  onChange: (newValue: number) => void;
}

export const RpeSelector: React.FC<RpeSelectorProps> = ({ value, onChange }) => {
  const { activeTheme } = useTheme();
  const rpeLevels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center w-full gap-1">
      {rpeLevels.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className="w-full aspect-square rounded-full transition-all duration-150 flex items-center justify-center"
        >
          <span
            className={`block w-3/4 h-3/4 rounded-full border-2 ${
              value >= level
                ? `${activeTheme.bgClass} ${activeTheme.borderClass}`
                : 'bg-transparent border-gray-300 dark:border-gray-600'
            }`}
          ></span>
        </button>
      ))}
    </div>
  );
};