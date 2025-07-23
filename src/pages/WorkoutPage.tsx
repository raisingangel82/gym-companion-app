import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSettings } from '../contexts/SettingsContext';
import { usePageAction } from '../contexts/PageActionContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RestTimerModal } from '../components/RestTimerModal';
import { ExerciseLogModal } from '../components/ExerciseLogModal';
import { SessionLogModal, type SessionLogData } from '../components/SessionLogModal';
import { Info, ImageOff, Undo2, Save } from 'lucide-react';
import type { Exercise, SetPerformance } from '../types';

const ProgressDots: React.FC<{ total: number; current: number; performance: SetPerformance[] }> = ({ total, current, performance }) => (
  <div className="flex justify-center items-center gap-2">
    {Array.from({ length: total }).map((_, index) => (
      <div
        key={index}
        className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
          performance?.[index] ? 'bg-white' : 'bg-white/30'
        } ${index === current ? 'ring-2 ring-white ring-offset-2 ring-offset-black/20' : ''}`}
      />
    ))}
  </div>
);

export const WorkoutPage: React.FC = () => {
  const { activeWorkout, updateWorkout, saveSessionToHistory } = useWorkouts();
  const { restTime, autoRestTimer } = useSettings(); 
  const { registerAction } = usePageAction();
  const { activeTheme } = useTheme();
  
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [logModalState, setLogModalState] = useState<{ isOpen: boolean; ex?: Exercise; setIndex?: number }>({ isOpen: false });
  const [isSessionLogModalOpen, setIsSessionLogModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [timerPosition, setTimerPosition] = useState<{ top: number; left: number; width: number; height: number; } | null>(null);

  const hasPerformanceData = useMemo(() => activeWorkout?.exercises.some(ex => ex.performance && ex.performance.length > 0), [activeWorkout]);

  useEffect(() => {
    const currentVisibleExercise = activeWorkout?.exercises?.[currentExIndex];
    if (currentVisibleExercise) {
      const nextSetIndex = currentVisibleExercise.performance?.length || 0;
      if (nextSetIndex < currentVisibleExercise.sets) {
        const action = () => setLogModalState({ isOpen: true, ex: currentVisibleExercise, setIndex: nextSetIndex });
        registerAction(action);
      } else {
        registerAction(null);
      }
    } else {
      registerAction(null);
    }
    return () => registerAction(null);
  }, [currentExIndex, activeWorkout, registerAction]);

  const handleSavePerformance = async (performance: SetPerformance) => {
    if (!activeWorkout) return;
    const exerciseToUpdate = activeWorkout.exercises[currentExIndex];
    if (!exerciseToUpdate || logModalState.setIndex === undefined) return;
    setLogModalState({ isOpen: false });
    const updatedExercises = [...activeWorkout.exercises];
    const newPerformance = [...(exerciseToUpdate.performance || [])];
    newPerformance[logModalState.setIndex] = performance;
    updatedExercises[currentExIndex] = { ...exerciseToUpdate, performance: newPerformance };
    await updateWorkout(activeWorkout.id, { exercises: updatedExercises });
    if (autoRestTimer) {
      const cardElement = scrollContainerRef.current?.children[currentExIndex];
      const rect = cardElement?.getBoundingClientRect();
      if (rect) { setTimerPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height }); }
    }
  };

  const handleUndoLastSet = () => {
    if (!activeWorkout) return;
    const exerciseToUpdate = activeWorkout.exercises[currentExIndex];
    if (!exerciseToUpdate?.performance?.length) return;
    const updatedExercises = [...activeWorkout.exercises];
    const newPerformance = [...exerciseToUpdate.performance];
    newPerformance.pop();
    updatedExercises[currentExIndex] = { ...exerciseToUpdate, performance: newPerformance };
    updateWorkout(activeWorkout.id, { exercises: updatedExercises });
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntry = entries.find(entry => entry.isIntersecting);
        if (intersectingEntry) {
          const newIndex = parseInt(intersectingEntry.target.getAttribute('data-index') || '0', 10);
          setCurrentExIndex(newIndex);
        }
      },
      { root: scrollContainerRef.current, threshold: 0.5 }
    );
    const elements = Array.from(scrollContainerRef.current?.children || []);
    elements.forEach(el => observer.observe(el));
    return () => { elements.forEach(el => observer.unobserve(el)); };
  }, [activeWorkout]);

  const handleSaveSession = (subjectiveData: SessionLogData) => {
    if (!activeWorkout) return;
    saveSessionToHistory(activeWorkout, subjectiveData);
    setIsSessionLogModalOpen(false);
  };

  if (!activeWorkout) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Info size={48} className="text-primary mb-4" />
        <h2 className="text-2xl font-bold">Nessun Allenamento Attivo</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Vai nella sezione "Gestisci" per selezionare una delle tue schede e renderla attiva.
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={scrollContainerRef} className="h-full overflow-y-auto snap-y snap-mandatory">
        {activeWorkout.exercises.map((exercise, exIndex) => {
          const currentExercisePerformance = exercise.performance || [];
          return (
            <div key={exIndex} data-index={exIndex} className="h-full w-full snap-start flex-shrink-0 p-4 flex flex-col">
              <Card className="flex-grow w-full flex flex-col overflow-hidden relative text-white dark:bg-black">
                {exercise.imageUrl ? (
                  <img src={exercise.imageUrl} alt={exercise.name} className="absolute inset-0 w-full h-full object-contain dark:invert" referrerPolicy="no-referrer" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ImageOff size={48} className="text-gray-400 dark:text-gray-600"/>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                <div className="relative z-10 flex flex-col h-full p-4 justify-between">
                  <h2 className="text-2xl font-bold text-shadow-lg">{exercise.name}</h2>
                  <div className="space-y-4">
                    <ProgressDots total={exercise.sets} current={currentExercisePerformance.length} performance={currentExercisePerformance} />
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button onClick={handleUndoLastSet} variant="secondary" disabled={!currentExercisePerformance.length || currentExIndex !== exIndex}>
                  <Undo2 size={16} className="mr-2" /> Annulla Set
                </Button>
                <Button onClick={() => setIsSessionLogModalOpen(true)} className={`text-white hover:opacity-90 ${activeTheme.bgClass}`} disabled={!hasPerformanceData}>
                  <Save size={16} className="mr-2" /> Termina
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <RestTimerModal position={timerPosition} duration={restTime} onClose={() => setTimerPosition(null)} />
      
      {/* CORREZIONE APPLICATA QUI SOTTO */}
      {logModalState.isOpen && logModalState.ex && logModalState.setIndex !== undefined && (
        <ExerciseLogModal 
          isOpen={logModalState.isOpen} 
          onClose={() => setLogModalState({ isOpen: false })} 
          onSave={handleSavePerformance} 
          exercise={logModalState.ex} 
          setIndex={logModalState.setIndex} 
        />
      )}
      
      <SessionLogModal
        isOpen={isSessionLogModalOpen}
        onClose={() => setIsSessionLogModalOpen(false)}
        onSave={handleSaveSession}
      />
    </>
  );
};