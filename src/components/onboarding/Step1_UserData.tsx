import React from 'react';
import type { UserProfile } from '../../types';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useTheme } from '../../contexts/ThemeContext'; // Importa il tema

interface StepProps {
  data: UserProfile;
  onDataChange: (data: Partial<UserProfile>) => void;
}

export const Step1_UserData: React.FC<StepProps> = ({ data, onDataChange }) => {
  const { activeTheme } = useTheme(); // Usa il tema per i colori

  return (
    <div className="space-y-6">
      <div>
        <Label>Sesso</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['male', 'female', 'other'].map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => onDataChange({ gender: gender as UserProfile['gender'] })}
              // Logica dei colori aggiornata
              className={`p-3 rounded-lg text-center font-medium transition-colors ${
                data.gender === gender
                  ? `text-white ${activeTheme.bgClass}` // Usa il colore del tema
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {gender === 'male' ? 'Uomo' : gender === 'female' ? 'Donna' : 'Altro'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="age">Età</Label>
          <Input 
            id="age" 
            type="number" 
            placeholder="es. 25"
            value={data.age || ''}
            onChange={(e) => onDataChange({ age: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="height">Altezza (cm)</Label>
          <Input 
            id="height" 
            type="number" 
            placeholder="es. 175"
            value={data.height || ''}
            onChange={(e) => onDataChange({ height: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input 
            id="weight" 
            type="number" 
            step="0.1"
            placeholder="es. 70.5"
            value={data.weight || ''}
            onChange={(e) => onDataChange({ weight: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};