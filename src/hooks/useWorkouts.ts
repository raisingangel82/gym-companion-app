import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { onWorkoutsSnapshot, addWorkout, updateWorkout, deleteWorkout } from '../services/firestore';
import type { Workout, WorkoutSession, SessionLogData } from '../types';
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
      setWorkouts([]);
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
  }, [user]);

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

  const saveSessionToHistory = async (workoutToSave: Workout | null, subjectiveData: SessionLogData) => {
    if (!workoutToSave) return;
    const performedExercises = workoutToSave.exercises.filter(ex => ex.performance && ex.performance.length > 0);
    if (performedExercises.length === 0) {
      alert("Nessun set registrato. Allenati prima di salvare la sessione!");
      return;
    }

    const historyEntry: WorkoutSession = { 
      date: new Date().toISOString(), 
      exercises: performedExercises,
      ...subjectiveData
    };
    
    const cleanedExercises = workoutToSave.exercises.map(({ performance, ...rest }) => rest);

    try {
        await updateWorkout(workoutToSave.id, {
            history: arrayUnion(historyEntry),
            exercises: cleanedExercises,
        } as any); // Correzione per l'errore di tipo FieldValue
    } catch (error) {
        console.error("Errore nel salvare la sessione:", error);
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
    saveSessionToHistory,
  };
};