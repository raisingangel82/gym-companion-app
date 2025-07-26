import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSettings } from '../contexts/SettingsContext';
import { usePageAction } from '../contexts/PageActionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRestTimer } from '../contexts/RestTimerContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ExerciseLogModal } from '../components/ExerciseLogModal';
import { SessionLogModal, type SessionLogData } from '../components/SessionLogModal';
import { ExerciseSubstitutionModal } from '../components/ExerciseSubstitutionModal';
import { PerformanceSummary } from '../components/PerformanceSummary'; // MODIFICA: Import del nuovo componente
import { Info, ImageOff, Undo2, Save, Repeat } from 'lucide-react';
import type { Exercise, SetPerformance } from '../types';

// ProgressDots non è più necessario qui, la logica è in PerformanceSummary
// const ProgressDots: React.FC ...

export const WorkoutPage: React.FC = () => {
    const { activeWorkout, updateWorkout, saveSessionToHistory } = useWorkouts();
    const { restTime, autoRestTimer } = useSettings();
    const { registerAction } = usePageAction();
    const { activeTheme } = useTheme();
    const { startTimer } = useRestTimer();

    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [logModalState, setLogModalState] = useState<{ isOpen: boolean; ex?: Exercise; setIndex?: number }>({ isOpen: false });
    const [isSessionLogModalOpen, setIsSessionLogModalOpen] = useState(false);
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const hasPerformanceData = useMemo(() => activeWorkout?.exercises.some(ex => ex.performance && ex.performance.length > 0), [activeWorkout]);

    useEffect(() => {
        const currentVisibleExercise = activeWorkout?.exercises?.[currentExIndex];
        if (currentVisibleExercise) {
            const nextSetIndex = currentVisibleExercise.performance?.length || 0;
            const totalSets = currentVisibleExercise.type === 'strength' ? (currentVisibleExercise.sets || 0) : 1;
            if (nextSetIndex < totalSets) {
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
        const exerciseToUpdate = logModalState.ex;
        const setIndexToUpdate = logModalState.setIndex;
        if (!activeWorkout || !exerciseToUpdate || setIndexToUpdate === undefined) return;
        
        const updatedExercises = [...activeWorkout.exercises];
        const exerciseIndexInWorkout = updatedExercises.findIndex(ex => ex.name === exerciseToUpdate.name);
        if (exerciseIndexInWorkout === -1) return;
        
        const newPerformance = [...(exerciseToUpdate.performance || [])];
        newPerformance[setIndexToUpdate] = performance;
        updatedExercises[exerciseIndexInWorkout] = { ...exerciseToUpdate, performance: newPerformance };
        
        try {
            await updateWorkout(activeWorkout.id, { exercises: updatedExercises });
        } catch (error) {
            console.error("ERRORE durante la chiamata a updateWorkout:", error);
            throw error;
        }
        
        if (autoRestTimer) {
            startTimer(restTime);
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
            }, { root: scrollContainerRef.current, threshold: 0.5 }
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

    const currentExerciseForSubstitution = activeWorkout?.exercises[currentExIndex] || null;

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
                    const cardBgClass = 'bg-black';

                    return (
                        // MODIFICA LAYOUT: La griglia ora ha 3 righe: Card (1fr), Riepilogo (auto), Bottoni (auto)
                        <div key={exIndex} data-index={exIndex} className="h-full w-full snap-start flex-shrink-0 p-4 grid grid-rows-[1fr_auto_auto]">
                            <div className="row-start-1 row-end-2 overflow-hidden">
                                <Card className={`h-full w-full flex flex-col overflow-hidden relative text-white ${cardBgClass}`}>
                                    {exercise.imageUrl ? (
                                        <img src={exercise.imageUrl} alt={exercise.name} className="absolute inset-0 w-full h-full object-fit dark:invert" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <ImageOff size={48} className="text-gray-400 dark:text-gray-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                                    <div className="relative z-10 flex flex-col h-full p-4 justify-start">
                                        <h2 className="text-2xl font-bold text-shadow-lg">{exercise.name}</h2>
                                    </div>
                                </Card>
                            </div>
                            
                            {/* MODIFICA: Nuova riga per il riepilogo della performance */}
                            <div className="row-start-2 row-end-3 py-3">
                                <PerformanceSummary exercise={exercise} performance={currentExercisePerformance} />
                            </div>

                            {/* MODIFICA: Riga dei bottoni spostata alla terza riga della griglia */}
                            <div className="row-start-3 row-end-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <Button onClick={handleUndoLastSet} variant="secondary" disabled={!currentExercisePerformance.length || currentExIndex !== exIndex}>
                                        <Undo2 size={16} className="mr-2" /> Annulla
                                    </Button>
                                    <Button onClick={() => setIsSubstitutionModalOpen(true)} variant="outline" title="Sostituisci esercizio con AI">
                                        <Repeat size={16} className="mr-2" /> Sostituisci
                                    </Button>
                                    <Button onClick={() => setIsSessionLogModalOpen(true)} className={`text-white hover:opacity-90 ${activeTheme.bgClass}`} disabled={!hasPerformanceData}>
                                        <Save size={16} className="mr-2" /> Termina
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
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
            <ExerciseSubstitutionModal
                isOpen={isSubstitutionModalOpen}
                onClose={() => setIsSubstitutionModalOpen(false)}
                exerciseToSubstitute={currentExerciseForSubstitution}
            />
        </>
    );
};