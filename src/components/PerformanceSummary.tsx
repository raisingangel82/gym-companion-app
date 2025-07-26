import React from 'react';
import type { Exercise, SetPerformance } from '../types';
// MODIFICA: Aggiunta l'icona 'TrendingUp' per il livello/pendenza
import { Layers, Target, Dumbbell, Timer, Gauge, Repeat, TrendingUp } from 'lucide-react';

interface SummaryProps {
  exercise: Exercise;
  performance: SetPerformance[];
}

const SummaryStat: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center justify-center py-0 px-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 h-full">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <Icon size={14} />
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-base font-bold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

export const PerformanceSummary: React.FC<SummaryProps> = ({ exercise, performance }) => {
  const setsCompleted = performance.length;

  // MODIFICA: La griglia ora è dinamica (3 o 4 colonne)
  const gridColsClass = exercise.type === 'strength' ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className={`grid ${gridColsClass} gap-2 h-full`}>
      {exercise.type === 'strength' ? (
        <>
          <SummaryStat icon={Layers} label="Set" value={`${setsCompleted}/${exercise.sets || 0}`} />
          <SummaryStat icon={Target} label="Reps" value={exercise.reps || 'N/D'} />
          <SummaryStat icon={Dumbbell} label="Carico" value={`${exercise.weight || 0}kg`} />
        </>
      ) : (
        <>
          <SummaryStat icon={Repeat} label="Sessione" value={`${setsCompleted}/1`} />
          <SummaryStat icon={Timer} label="Durata" value={`${exercise.duration || 0}min`} />
          <SummaryStat icon={Gauge} label="Velocità" value={exercise.speed || 0} />
          {/* MODIFICA: Aggiunto il quarto valore per il cardio */}
          <SummaryStat icon={TrendingUp} label="Livello" value={exercise.level || 0} />
        </>
      )}
    </div>
  );
};