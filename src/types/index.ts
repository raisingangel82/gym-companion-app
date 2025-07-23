// src/types/index.ts

// Definisce una singola performance registrata per un set
export interface SetPerformance {
  reps: number;
  weight: number;
  notes?: string;
  rpe?: number;
}

// Definisce un esercizio, ora con un array per le performance
export interface Exercise {
  name: string;
  sets: number;
  reps: string; // Reps target (mantenuto come stringa per range come "8-12")
  weight: number; // Peso target
  performance?: SetPerformance[]; // Performance effettive
  imageUrl?: string;
}

export interface WorkoutHistoryEntry {
    date: string; // Formato ISO, es: "2025-07-23T12:30:00.000Z"
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

// Struttura per la Color Palette
export type ColorShade = '400' | '700' | '800';

export interface ColorDefinition {
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

// NUOVA INTERFACCIA per una singola sessione di allenamento
export interface WorkoutSession {
  date: string; // Formato ISO, es: "2025-07-23T12:30:00.000Z"
  exercises: Exercise[];
  // Dati soggettivi di fine sessione
  sessionNotes?: string;
  doms?: number; // Scala 1-5 per i dolori muscolari
  sleepQuality?: number; // Scala 1-5 per la qualità del sonno
  stressLevel?: number; // Scala 1-5 per il livello di stress
}

export interface WorkoutData {
  name: string;
  exercises: Exercise[];
  createdAt: Date;
  history: WorkoutSession[]; // MODIFICATO: Usa la nuova interfaccia
}