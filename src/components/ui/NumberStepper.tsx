import React from 'react';
import { Button } from './Button';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({ value, onChange, step = 1, min = 0, max = 999 }) => {
  
  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="flex items-center justify-between w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <Button variant="ghost" size="icon" onClick={handleDecrement} className="text-gray-600 dark:text-gray-300">
        <Minus size={20} />
      </Button>
      <span className="text-xl font-bold font-mono text-center min-w-[60px] text-gray-900 dark:text-gray-100">
        {value}
      </span>
      <Button variant="ghost" size="icon" onClick={handleIncrement} className="text-gray-600 dark:text-gray-300">
        <Plus size={20} />
      </Button>
    </div>
  );
};