// src/components/SetProgressBar.tsx

import type { Exercise } from '../types';
import { useTheme } from '../contexts/ThemeContext'; // 1. Importa il hook del tema

export const SetProgressBar: React.FC<SetProgressBarProps> = ({ exercise }) => {
    const { activeTheme } = useTheme(); // 2. Recupera il tema attivo

    const { sets = 0, reps: targetReps, weight: targetWeight, performance } = exercise;
    
    const getSetColor = (setIndex: number): string => {
        const perf = performance?.[setIndex];
        if (!perf) {
            return 'bg-gray-200 dark:bg-gray-700';
        }

        const perfWeight = perf.weight || 0;
        const targetWeightNum = targetWeight || 0;
        const perfReps = perf.reps || 0;
        const targetRepsNum = parseInt(String(targetReps).split(/[-|–]/)[0], 10) || 0;

        if (perfReps > targetRepsNum || perfWeight > targetWeightNum) {
            return 'bg-sky-500'; 
        }
        if (perfReps < targetRepsNum || perfWeight < targetWeightNum) {
            return 'bg-red-500';
        }
        // 3. Usa la classe del tema attivo al posto del verde fisso
        return activeTheme.bgClass;
    };

    return (
        <div className="flex w-full gap-1.5 h-3">
            {Array.from({ length: sets }).map((_, i) => (
                <div key={i} className={`flex-1 rounded-full transition-colors ${getSetColor(i)}`}></div>
            ))}
        </div>
    );
};

// Aggiungo l'interfaccia delle props per completezza, nel caso non fosse già nello stesso file
interface SetProgressBarProps {
    exercise: Exercise;
}