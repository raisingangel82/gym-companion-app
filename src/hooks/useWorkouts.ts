// src/hooks/useWorkouts.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { onWorkoutsSnapshot, addWorkout, updateWorkout, deleteWorkout } from '../services/firestore';
import type { Workout, WorkoutData } from '../types';
import { arrayUnion } from 'firebase/firestore';

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(() => {
    return localStorage.getItem('activeWorkoutId');
  });

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    
    const unsubscribe = onWorkoutsSnapshot(
      (workoutsData) => {
        setWorkouts(workoutsData);
        if (activeWorkoutId && !workoutsData.some(w => w.id === activeWorkoutId)) {
          setActiveWorkoutId(null);
          localStorage.removeItem('activeWorkoutId');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Impossibile caricare i dati degli allenamenti:", error.message);
        setIsLoading(false);
      }
    );
      
    return () => unsubscribe();
  }, [user, activeWorkoutId]);

  /**
   * Imposta una scheda come attiva e salva la scelta nel localStorage.
   * @param id L'ID della scheda da attivare.
   */
  const handleSetActiveWorkout = (id: string) => {
    setActiveWorkoutId(id);
    localStorage.setItem('activeWorkoutId', id);
  };

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId) || null;

  /**
   * Registra il completamento dell'allenamento attivo, aggiungendo la data odierna alla sua cronologia.
   */
  const completeActiveWorkout = async () => {
    if (!activeWorkout) return;
    const historyEntry = { date: new Date().toISOString() };
    try {
        await updateWorkout(activeWorkout.id, {
            history: arrayUnion(historyEntry)
        });
        alert('Allenamento salvato nella cronologia!');
    } catch (error) {
        console.error("Errore nel salvare il completamento dell'allenamento:", error);
        alert("Si è verificato un errore nel salvataggio.");
    }
  };

  return {
    workouts,
    isLoading,
    activeWorkout,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    setActiveWorkout: handleSetActiveWorkout,
    completeActiveWorkout,
  };
};