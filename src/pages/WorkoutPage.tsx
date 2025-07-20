// src/pages/WorkoutPage.tsx
import React, { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../data/exerciseTranslations'; // <-- Rinominato da 'translationMap'
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RestTimerModal } from '../components/RestTimerModal';
import { ExerciseLogModal } from '../components/ExerciseLogModal';
import { Dumbbell, CheckCircle, ImageOff } from 'lucide-react';
import type { Exercise, SetPerformance } from '../types';

export const WorkoutPage: React.FC = () => {
  const { activeWorkout, updateWorkout, completeActiveWorkout } = useWorkouts();
  const { activeTheme } = useTheme();
  const { restTime } = useSettings();
  
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<{ ex: Exercise, exIndex: number, setIndex: number } | null>(null);

  // <-- QUESTA FUNZIONE ORA SERVE SOLO COME FALLBACK
  const formatExerciseNameForUrl = (name: string) => {
    const lowerCaseName = name.toLowerCase().trim();
    const translatedName = translations[lowerCaseName] || lowerCaseName;
    return translatedName.replace(/ /g, '-').replace(/[()]/g, '');
  };

  const openLogModal = (ex: Exercise, exIndex: number, setIndex: number) => {
    setCurrentExercise({ ex, exIndex, setIndex });
    setLogModalOpen(true);
  };

  const handleSavePerformance = (performance: SetPerformance) => {
    if (!activeWorkout || !currentExercise) return;
    const { exIndex, setIndex } = currentExercise;
    const updatedExercises = [...activeWorkout.exercises];
    const exerciseToUpdate = { ...updatedExercises[exIndex] };
    if (!exerciseToUpdate.performance) {
      exerciseToUpdate.performance = [];
    }
    exerciseToUpdate.performance[setIndex] = performance;
    updatedExercises[exIndex] = exerciseToUpdate;
    updateWorkout(activeWorkout.id, { exercises: updatedExercises });
    setIsTimerOpen(true);
  };

  const completedSetsCount = (exercise: Exercise) => exercise.performance?.filter(p => p).length || 0;

  const isWorkoutComplete = activeWorkout?.exercises.every(ex => completedSetsCount(ex) === ex.sets);

  if (!activeWorkout) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Dumbbell size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold">Nessuna Scheda Selezionata</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Vai su "Gestisci Schede" per creare o selezionare una scheda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-8rem)] overflow-y-auto snap-y snap-mandatory">
        {isWorkoutComplete && (
           <div className="h-full w-full snap-start flex-shrink-0 flex flex-col p-4 items-center justify-center">
             <Card className="bg-green-50 dark:bg-green-900/50 border-green-500 text-center">
               <h3 className="text-xl font-bold text-green-800 dark:text-green-200">Ottimo Lavoro!</h3>
               <p className="text-green-600 dark:text-green-300">Hai completato tutti gli esercizi.</p>
               <Button onClick={completeActiveWorkout} className="mt-4 bg-green-600 hover:bg-green-700 text-white"><CheckCircle size={20}/> Completa e Salva Allenamento</Button>
             </Card>
           </div>
        )}
        {activeWorkout.exercises.map((exercise, exIndex) => {
          // <-- LOGICA IMMAGINE AGGIORNATA
          const fallbackImageUrl = `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/gif/${formatExerciseNameForUrl(exercise.name)}.gif`;
          const imageUrl = exercise.imageUrl || fallbackImageUrl;

          return (
            <div key={exIndex} className="h-full w-full snap-start flex-shrink-0 flex flex-col p-4">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <img 
                        src={imageUrl} 
                        alt={`Animazione per ${exercise.name}`}
                        className="w-full h-full object-cover"
                        // Mostra un'icona se l'immagine non carica
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
                    />
                    <div className="hidden absolute text-gray-400 dark:text-gray-500"><ImageOff size={48} /></div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{exercise.name}</h3>
                    <div className="flex items-center gap-4 text-sm font-mono my-2 text-gray-600 dark:text-gray-400">
                        <span>TARGET:</span>
                        <span>{exercise.sets} sets</span>
                        <span>{exercise.reps} reps</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                      <button
                        key={setIndex}
                        onClick={() => openLogModal(exercise, exIndex, setIndex)}
                        className={`h-12 flex flex-col items-center justify-center rounded-lg font-bold text-xs transition-colors ${
                          exercise.performance?.[setIndex]
                            ? `${activeTheme.bgClass} text-white`
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        aria-label={`Set ${setIndex + 1}`}
                      >
                        {exercise.performance?.[setIndex] ? 
                          <>
                            <span className="text-base">{exercise.performance[setIndex].reps}</span>
                            <span className="font-normal">{exercise.performance[setIndex].weight}kg</span>
                          </>
                          : 
                          <span>SET {setIndex + 1}</span>
                        }
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      
      <RestTimerModal isOpen={isTimerOpen} duration={restTime} onClose={() => setIsTimerOpen(false)} />
      
      {currentExercise && (
        <ExerciseLogModal
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          onSave={handleSavePerformance}
          exercise={currentExercise.ex}
          setIndex={currentExercise.setIndex}
        />
      )}
    </>
  );
};