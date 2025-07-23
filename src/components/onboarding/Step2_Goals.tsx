import React from 'react';
import type { UserProfile } from '../../types';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useTheme } from '../../contexts/ThemeContext';

interface StepProps {
  data: UserProfile;
  onDataChange: (data: Partial<UserProfile>) => void;
}

// Helper per i pulsanti di selezione
const SelectionButton: React.FC<{
  label: string;
  value: string;
  currentValue?: string;
  onClick: () => void;
}> = ({ label, value, currentValue, onClick }) => {
  const { activeTheme } = useTheme();
  const isSelected = currentValue === value;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg text-center font-medium transition-colors w-full ${
        isSelected
          ? `text-white ${activeTheme.bgClass}`
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
};

export const Step2_Goals: React.FC<StepProps> = ({ data, onDataChange }) => {
  const goals = [
    { value: 'hypertrophy', label: 'Ipertrofia' },
    { value: 'strength', label: 'Forza' },
    { value: 'definition', label: 'Definizione' },
    { value: 'recomposition', label: 'Ricomposizione' },
    { value: 'wellness', label: 'Benessere' },
  ];

  const experiences = [
    { value: 'beginner', label: 'Principiante (< 6 mesi)' },
    { value: 'intermediate', label: 'Intermedio (6-24 mesi)' },
    { value: 'advanced', label: 'Avanzato (> 24 mesi)' },
  ];
  
  const equipments = [
    { value: 'full_gym', label: 'Palestra' },
    { value: 'home_gym', label: 'Home Gym' },
    { value: 'bodyweight', label: 'Corpo Libero' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label>Qual è il tuo obiettivo principale?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {goals.map(g => (
            <SelectionButton key={g.value} {...g} currentValue={data.goal} onClick={() => onDataChange({ goal: g.value as UserProfile['goal'] })} />
          ))}
        </div>
      </div>
      
      <div>
        <Label>Qual è la tua esperienza?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {experiences.map(e => (
            <SelectionButton key={e.value} {...e} currentValue={data.experience} onClick={() => onDataChange({ experience: e.value as UserProfile['experience'] })} />
          ))}
        </div>
      </div>
      
      <div>
        <Label>Attrezzatura a disposizione</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {equipments.map(e => (
            <SelectionButton key={e.value} {...e} currentValue={data.equipment} onClick={() => onDataChange({ equipment: e.value as UserProfile['equipment'] })} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency">Frequenza (giorni/sett.)</Label>
          <Input 
            id="frequency" 
            type="number" 
            placeholder="es. 3"
            value={data.frequency || ''}
            onChange={(e) => onDataChange({ frequency: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="duration">Durata (minuti)</Label>
          <Input 
            id="duration" 
            type="number" 
            placeholder="es. 60"
            value={data.duration || ''}
            onChange={(e) => onDataChange({ duration: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};