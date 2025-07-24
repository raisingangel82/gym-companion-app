import type { User as FirebaseUser } from 'firebase/auth';

// --- Tipi per l'Allenamento ---

/** Definisce una singola performance registrata per un set. */
export interface SetPerformance {
  reps: number;
  weight: number;
  notes?: string;
  rpe?: number;
}

/** Definisce un esercizio all'interno di una scheda. */
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: number;
  performance?: SetPerformance[];
  imageUrl?: string;
}

/** Dati raccolti alla fine di una sessione di allenamento. */
export interface SessionLogData {
  sessionNotes?: string;
  doms: number;
  sleepQuality: number;
  stressLevel: number;
}

/** Definisce una singola sessione di allenamento completata (per la cronologia). */
export interface WorkoutSession extends SessionLogData {
  date: string; // Formato ISO
  exercises: Exercise[];
}

/** Definisce la struttura base di una scheda di allenamento. */
export interface WorkoutData {
  name: string;
  exercises: Exercise[];
  createdAt: Date;
  history: WorkoutSession[];
}

/** Definisce una scheda di allenamento con il suo ID del database. */
export interface Workout extends WorkoutData {
  id: string;
}

// --- Tipi per l'Utente ---

/** Definisce il profilo utente con i dati raccolti durante l'onboarding. */
export interface UserProfile {
  plan?: 'Free' | 'Pro';
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  goal?: 'hypertrophy' | 'strength' | 'definition' | 'recomposition' | 'wellness';
  experience?: 'beginner' | 'intermediate' | 'advanced';
  frequency?: number;
  duration?: number;
  equipment?: 'full_gym' | 'home_gym' | 'bodyweight';
  lifestyle?: 'sedentary' | 'active';
  injuries?: string;
  pathologies?: string;
  mobility_issues?: string;
}

/** Unisce l'utente di Firebase con il nostro profilo custom. */
export type AppUser = FirebaseUser & Partial<UserProfile>;

// --- Tipi per il Tema e l'UI ---

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