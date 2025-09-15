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
 * AGGIORNAMENTO: Aggiunto 'id' come proprietà obbligatoria per l'identificazione univoca.
 * AGGIORNAMENTO: 'imageUrl' ora accetta 'null'.
 * AGGIORNAMENTO: 'performance' è ora obbligatoria e di tipo 'SetPerformance[]'.
 */
export interface Exercise {
  id: string; // <-- MODIFICA: ID univoco per l'esercizio
  name: string;
  type: 'strength' | 'cardio';
  imageUrl: string | null; // <-- MODIFICA: string o null, non undefined

  // Proprietà per la forza
  sets?: number;
  reps?: string;
  weight?: number;
  
  // MODIFICA: Aggiunto campo per selezionare il tipo di timer
  restTimerType?: 'primary' | 'secondary';

  // Proprietà per il cardio (i target)
  duration?: number; // in minuti
  speed?: number;
  level?: number;

  performance: SetPerformance[]; // <-- MODIFICA: Sempre un array, anche vuoto
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

/** Definisce la struttura base di una scheda di allenamento.
 * AGGIORNAMENTO: 'history' è ora obbligatoria e di tipo 'WorkoutSession[]'.
*/
export interface WorkoutData {
  name: string;
  exercises: Exercise[];
  createdAt: Date;
  history: WorkoutSession[]; // <-- MODIFICA: Sempre un array, anche vuoto
  _lastUpdated?: Date;
}

/** Definisce una scheda di allenamento con il suo ID del database. */
export interface Workout extends WorkoutData {
  id: string;
}

// --- Tipi per l'Utente ---

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