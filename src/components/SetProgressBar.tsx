import type { Exercise } from '../types';

interface SetProgressBarProps {
    exercise: Exercise;
}

export const SetProgressBar: React.FC<SetProgressBarProps> = ({ exercise }) => {
    // Aggiunto un fallback a 0 se sets non è definito (per gli esercizi cardio)
    const { sets = 0, reps: targetReps, weight: targetWeight, performance } = exercise;
    
    const getSetColor = (setIndex: number): string => {
        const perf = performance?.[setIndex];
        if (!perf) {
            return 'bg-gray-200 dark:bg-gray-700'; // Non completato
        }

        const perfWeight = perf.weight || 0;
        const targetWeightNum = targetWeight || 0;
        
        // Aggiunto un fallback a 0 se perf.reps è undefined
        const perfReps = perf.reps || 0;
        const targetRepsNum = parseInt(String(targetReps).split(/[-|–]/)[0], 10) || 0;

        if (perfReps > targetRepsNum || perfWeight > targetWeightNum) {
            return 'bg-sky-500'; // Blu - Migliore
        }
        if (perfReps < targetRepsNum || perfWeight < targetWeightNum) {
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