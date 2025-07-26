import type { User as FirebaseUser } from 'firebase/auth';
import type { ElementType } from 'react';

// --- Tipi per l'Allenamento ---

/**
 * Definisce una singola performance registrata.
 * Ora è generica e può contenere dati sia di forza che di cardio.
 */
export interface SetPerformance {
  // Dati di Forza
  reps?: number;
  weight?: number;
  
  // Dati Cardio
  duration?: number; // in minuti
  speed?: number;    // es. in km/h
  level?: number;    // es. pendenza o resistenza

  // Dati Comuni
  notes?: string;
  rpe?: number;
}

/**
 * Definisce un esercizio, che ora può essere di tipo 'strength' o 'cardio'.
 */
export interface Exercise {
  name: string;
  type: 'strength' | 'cardio'; // <-- Campo per distinguere il tipo di esercizio
  imageUrl?: string;

  // Proprietà per la forza
  sets?: number;
  reps?: string;
  weight?: number;

  // Proprietà per il cardio (i target)
  duration?: number; // in minuti
  speed?: number;
  level?: number;

  performance?: SetPerformance[];
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

// MODIFICA: Aggiunto il nuovo tipo per le playlist preferite
export interface FavoritePlaylist {
  name: string;
  url: string;
}

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
  // MODIFICA: Aggiunta la proprietà per le playlist preferite
  favoritePlaylists?: FavoritePlaylist[];
}

/** Unisce l'utente di Firebase con il nostro profilo custom. */
export type AppUser = FirebaseUser & Partial<UserProfile>;


// --- Tipi per il Tema e l'UI ---

/** Definisce la struttura per il pulsante d'azione centrale. */
export interface ActionConfig {
  icon: ElementType;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

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