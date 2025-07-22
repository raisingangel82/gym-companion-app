import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSettings } from '../contexts/SettingsContext';
import { usePageAction } from '../contexts/PageActionContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RestTimerModal } from '../components/RestTimerModal';
import { ExerciseLogModal } from '../components/ExerciseLogModal';
import { Dumbbell, ImageOff, Undo2, Info } from 'lucide-react';
import type { Exercise, SetPerformance } from '../types';

type TimerPosition = { top: number; left: number; width: number; height: number; };

const ProgressDots: React.FC<{ total: number; current: number; performance: SetPerformance[] }> = ({ total, current, performance }) => ( <div className="flex justify-center items-center gap-2"> {Array.from({ length: total }).map((_, index) => ( <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${performance?.[index] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} ${index === current ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' : ''}`}/> ))} </div> );

export const WorkoutPage: React.FC = () => {
  const { activeWorkout, updateWorkout } = useWorkouts();
  const { restTime, autoRestTimer } = useSettings(); 
  const { registerAction } = usePageAction();
  
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [logModalState, setLogModalState] = useState<{ isOpen: boolean; ex?: Exercise; setIndex?: number }>({ isOpen: false });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const [timerPosition, setTimerPosition] = useState<TimerPosition | null>(null);

  const currentExercise = useMemo(() => activeWorkout?.exercises?.[currentExIndex], [activeWorkout, currentExIndex]);
  const nextSetIndex = useMemo(() => currentExercise?.performance?.length || 0, [currentExercise]);

  useEffect(() => {
    if (currentExercise && nextSetIndex < currentExercise.sets) {
      const action = () => setLogModalState({ isOpen: true, ex: currentExercise, setIndex: nextSetIndex });
      registerAction(action);
    } else { registerAction(null); }
    return () => registerAction(null);
  }, [currentExercise, nextSetIndex, registerAction]);

  const handleSavePerformance = async (performance: SetPerformance) => { if (!activeWorkout || !currentExercise || logModalState.setIndex === undefined) return; setLogModalState({ isOpen: false }); const updatedExercises = [...activeWorkout.exercises]; const exerciseToUpdate = { ...updatedExercises[currentExIndex] }; const newPerformance = [...(exerciseToUpdate.performance || [])]; newPerformance[logModalState.setIndex] = performance; exerciseToUpdate.performance = newPerformance; updatedExercises[currentExIndex] = exerciseToUpdate; await updateWorkout(activeWorkout.id, { exercises: updatedExercises }); if (autoRestTimer) { const rect = imageCardRef.current?.getBoundingClientRect(); if (rect) setTimerPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height }); } };
  const handleUndoLastSet = () => { if (!activeWorkout || !currentExercise || !currentExercise.performance?.length) return; const updatedExercises = [...activeWorkout.exercises]; const exerciseToUpdate = { ...updatedExercises[currentExIndex] }; const newPerformance = [...(exerciseToUpdate.performance || [])]; newPerformance.pop(); exerciseToUpdate.performance = newPerformance; updatedExercises[currentExIndex] = exerciseToUpdate; updateWorkout(activeWorkout.id, { exercises: updatedExercises }); };
  
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const newIndex = Math.round(container.scrollTop / container.clientHeight);
        if (newIndex !== currentExIndex) setCurrentExIndex(newIndex);
      }
    };
    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll, { passive: true });
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [currentExIndex]);

  if (!activeWorkout) { return ( <div className="h-full flex flex-col items-center justify-center text-center p-8"> <Info size={48} className="text-primary mb-4" /> <h2 className="text-2xl font-bold">Nessun Allenamento Attivo</h2> <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm"> Vai nella sezione "Gestisci" per selezionare una delle tue schede e renderla attiva. </p> </div> ); }

  return (
    <>
      <div ref={scrollContainerRef} className="h-full overflow-y-auto snap-y snap-mandatory">
        {activeWorkout.exercises.map((exercise, exIndex) => (
          <div key={exIndex} className="h-full w-full snap-start flex-shrink-0 flex flex-col p-4 gap-4">
            <h2 className="flex-shrink-0 text-xl font-bold text-center truncate px-2">{exercise.name}</h2>
            <div ref={exIndex === currentExIndex ? imageCardRef : null} className="flex-grow flex items-center justify-center rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 min-h-0">
              {exercise.imageUrl ? ( <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> ) : ( <div className="text-gray-400 dark:text-gray-500"><ImageOff size={48} /></div> )}
            </div>
            <div className="flex-shrink-0 flex flex-col gap-4">
              <Card className="p-4 flex flex-col gap-4 items-center">
                <ProgressDots total={exercise.sets} current={exIndex === currentExIndex ? nextSetIndex : 0} performance={exercise.performance || []} />
                <div className="w-full flex justify-around text-center">
                  <div><p className="text-sm text-gray-500">SETS</p><p className="text-2xl font-bold">{exercise.sets}</p></div>
                  <div><p className="text-sm text-gray-500">REPS</p><p className="text-2xl font-bold">{exercise.reps}</p></div>
                  <div><p className="text-sm text-gray-500">PESO</p><p className="text-2xl font-bold">{exercise.weight || 0}<span className="text-base">kg</span></p></div>
                </div>
              </Card>
              <Button onClick={handleUndoLastSet} variant="outline" disabled={exIndex !== currentExIndex || !exercise.performance?.length}> <Undo2 size={16} className="mr-2" /> Annulla Ultimo Set </Button>
            </div>
          </div>
        ))}
      </div>
      <RestTimerModal position={timerPosition} duration={restTime} onClose={() => setTimerPosition(null)} />
      {logModalState.isOpen && logModalState.ex && logModalState.setIndex !== undefined && ( <ExerciseLogModal isOpen={logModalState.isOpen} onClose={() => setLogModalState({ isOpen: false })} onSave={handleSavePerformance} exercise={logModalState.ex} setIndex={logModalState.setIndex} /> )}
    </>
  );
};