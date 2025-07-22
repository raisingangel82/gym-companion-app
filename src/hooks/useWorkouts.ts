// src/hooks/useWorkouts.ts
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Le funzioni ora vengono chiamate direttamente, senza alias
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
    // Il listener si attiva solo se c'è un utente
    if (!user) {
      setWorkouts([]); // Pulisce i dati al logout
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // FIX: onWorkoutsSnapshot ora viene chiamato nel modo corretto, come definito nel tuo file
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
  }, [user]); // Rimosso activeWorkoutId dalle dipendenze per evitare loop

  const handleSetActiveWorkout = (id: string | null) => {
    if (id) {
      setActiveWorkoutId(id);
      localStorage.setItem('activeWorkoutId', id);
    } else {
      setActiveWorkoutId(null);
      localStorage.removeItem('activeWorkoutId');
    }
  };

  const activeWorkout = useMemo(() => workouts.find(w => w.id === activeWorkoutId) || null, [workouts, activeWorkoutId]);

  const saveSessionToHistory = async (workoutToSave: Workout | null) => {
    if (!workoutToSave) return;
    const performedExercises = workoutToSave.exercises.filter(ex => ex.performance && ex.performance.length > 0);
    if (performedExercises.length === 0) {
      alert("Nessun set registrato. Allenati prima di salvare la sessione!");
      return;
    }

    const historyEntry = { date: new Date().toISOString(), exercises: performedExercises };
    const cleanedExercises = workoutToSave.exercises.map(({ performance, ...rest }) => rest);

    try {
        // FIX: updateWorkout chiamato senza user.uid
        await updateWorkout(workoutToSave.id, {
            history: arrayUnion(historyEntry),
            exercises: cleanedExercises,
        });
        
        // L'aggiornamento dello stato locale ora è gestito dal listener onSnapshot,
        // quindi non è più necessario farlo manualmente qui.
        alert('Allenamento salvato con successo nella cronologia!');
    } catch (error) {
        console.error("Errore nel salvare la sessione:", error);
        alert("Si è verificato un errore nel salvataggio.");
    }
  };

  return {
    workouts,
    isLoading,
    activeWorkout,
    addWorkout,      // Ora sono le funzioni originali
    updateWorkout,   // che non richiedono l'ID utente
    deleteWorkout,
    setActiveWorkout: handleSetActiveWorkout,
    saveSessionToHistory,
  };
};