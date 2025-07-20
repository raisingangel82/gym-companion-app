// src/components/SetProgressBar.tsx
import React from 'react';
import type { Exercise } from '../types';

interface SetProgressBarProps {
    exercise: Exercise;
}

export const SetProgressBar: React.FC<SetProgressBarProps> = ({ exercise }) => {
    const { sets, reps: targetReps, weight: targetWeight, performance } = exercise;
    
    const getSetColor = (setIndex: number): string => {
        const perf = performance?.[setIndex];
        if (!perf) {
            return 'bg-gray-200 dark:bg-gray-700'; // Non completato
        }

        const perfWeight = parseFloat(perf.weight) || 0;
        const targetWeightNum = parseFloat(targetWeight) || 0;

        if (perf.reps > parseInt(targetReps) || perfWeight > targetWeightNum) {
            return 'bg-sky-500'; // Blu - Migliore
        }
        if (perf.reps < parseInt(targetReps) || perfWeight < targetWeightNum) {
            return 'bg-red-500'; // Rosso - Peggiore
        }
        return 'bg-green-500'; // Verde - In target
    };

    return (
        <div className="flex w-full gap-1.5 h-3">
            {Array.from({ length: sets }).map((_, i) => (
                <div key={i} className={`flex-1 rounded-full transition-colors ${getSetColor(i)}`}></div>
            ))}
        </div>
    );
};