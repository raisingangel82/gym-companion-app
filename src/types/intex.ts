// src/types/index.ts

// Definisce una singola performance registrata per un set
export interface SetPerformance {
  reps: string;
  weight: string;
  notes?: string;
}

// Definisce un esercizio, ora con un array per le performance
export interface Exercise {
  name: string;
  sets: number;
  reps: string; // Reps target
  weight: string; // Peso target
  performance?: SetPerformance[]; // Performance effettive
  imageUrl?: string; // <-- AGGIUNGI QUESTA RIGA
}

export interface WorkoutHistoryEntry {
    date: string;
}

export interface WorkoutData {
  name: string;
  exercises: Exercise[];
  createdAt: Date;
  history: WorkoutHistoryEntry[];
}

export interface Workout extends WorkoutData {
  id: string;
}

// NUOVA STRUTTURA PER LA COLOR PALETTE (dal tuo file)
export type ColorShade = '400' | '700' | '800';

interface ColorDefinition {
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
}

export interface ColorPalette {
  name: string;
  base: string;
  shades: {
    [key in ColorShade]: ColorDefinition;
  };
}