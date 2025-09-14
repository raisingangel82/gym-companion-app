// src/components/CompletionDots.tsx

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Exercise } from '../types';

interface CompletionDotsProps {
  exercise: Exercise;
}

export const CompletionDots: React.FC<CompletionDotsProps> = ({ exercise }) => {
  const { activeTheme } = useTheme();

  // Gestisce sia esercizi di forza (con 'sets') che cardio (considerato come 1 set)
  const totalSets = exercise.type === 'strength' ? (exercise.sets || 0) : 1;
  const completedSets = exercise.performance?.length || 0;

  if (totalSets === 0) {
    return null; // Non mostrare nulla se l'esercizio non ha set definiti
  }

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSets }).map((_, index) => (
        <span
          key={index}
          className={`block w-2.5 h-2.5 rounded-full transition-colors`}
          style={{
            backgroundColor: index < completedSets ? activeTheme.hex : '#D1D5DB', // Grigio per non completati
          }}
        />
      ))}
    </div>
  );
};