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
import { ExerciseSubstitutionModal } from '../components/ExerciseSubstitutionModal';
import { Info, ImageOff, Undo2, Save, Repeat, HeartPulse } from 'lucide-react';
import type { Exercise, SetPerformance } from '../types';

const ProgressDots: React.FC<{ total: number; current: number; performance: SetPerformance[] }> = ({ total, current, performance }) => (
    <div className="flex justify-center items-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
            <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm ${performance?.[index] ? 'bg-white' : 'bg-white/30'} ${index === current ? 'ring-2 ring-white ring-offset-2 ring-offset-black/20' : ''}`} />
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
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [timerPosition, setTimerPosition] = useState<{ top: number; left: number; width: number; height: number; } | null>(null);

    const hasPerformanceData = useMemo(() => activeWorkout?.exercises.some(ex => ex.performance && ex.performance.length > 0), [activeWorkout]);

    useEffect(() => {
        const currentVisibleExercise = activeWorkout?.exercises?.[currentExIndex];
        if (currentVisibleExercise) {
            const nextSetIndex = currentVisibleExercise.performance?.length || 0;
            if (nextSetIndex < (currentVisibleExercise.sets || 1)) {
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

    // --- MODIFICA CON LOG DI DEBUG ---
    const handleSavePerformance = async (performance: SetPerformance) => {
        console.log("🟢 1. handleSavePerformance ESEGUITA.");
        const exerciseToUpdate = logModalState.ex;
        const setIndexToUpdate = logModalState.setIndex;

        if (!activeWorkout || !exerciseToUpdate || setIndexToUpdate === undefined) {
            console.error("🔴 ERRORE: Dati mancanti (workout, esercizio o set index).");
            return;
        }

        console.log(`🟡 2. Dati pronti per l'aggiornamento: Esercizio "${exerciseToUpdate.name}", Set #${setIndexToUpdate + 1}`);
        const updatedExercises = [...activeWorkout.exercises];
        const exerciseIndexInWorkout = updatedExercises.findIndex(ex => ex.name === exerciseToUpdate.name);

        if (exerciseIndexInWorkout === -1) {
            console.error("🔴 ERRORE: Esercizio non trovato nell'array del workout attivo.");
            return;
        }

        const newPerformance = [...(exerciseToUpdate.performance || [])];
        newPerformance[setIndexToUpdate] = performance;
        updatedExercises[exerciseIndexInWorkout] = { ...exerciseToUpdate, performance: newPerformance };
        
        console.log("🟡 3. Sto per chiamare 'updateWorkout' per salvare su Firestore...");
        try {
            await updateWorkout(activeWorkout.id, { exercises: updatedExercises });
            console.log("🟢 4. 'updateWorkout' completato con SUCCESSO.");
        } catch (error) {
            console.error("🔴 ERRORE durante la chiamata a updateWorkout:", error);
            // Lancia l'errore per farlo catturare dal modale
            throw error;
        }
        
        if (autoRestTimer) {
            console.log("🟡 5. Il timer automatico è attivo. Calcolo posizione...");
            const cardElement = scrollContainerRef.current?.children[currentExIndex];
            const rect = cardElement?.getBoundingClientRect();
            if (rect) {
                setTimerPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
                console.log("🟢 6. Timer attivato.");
            } else {
                console.warn("🟡 Attenzione: Impossibile trovare l'elemento della card per posizionare il timer.");
            }
        } else {
            console.log("⚪️ Il timer automatico non è attivo.");
        }
    };
    // --- FINE MODIFICA ---

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
                        <div key={exIndex} data-index={exIndex} className="h-full w-full snap-start flex-shrink-0 p-4 grid grid-rows-[1fr_auto]">
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
                                    <div className="relative z-10 flex flex-col h-full p-4 justify-between">
                                        <h2 className="text-2xl font-bold text-shadow-lg">{exercise.name}</h2>
                                        <div className="space-y-4">
                                            {exercise.type === 'cardio' ? (
                                                <div className="text-center">
                                                    <HeartPulse size={24} className="mx-auto mb-2 text-red-400" />
                                                    <p className="font-mono">{exercise.duration} min</p>
                                                </div>
                                            ) : (
                                                <ProgressDots
                                                    total={exercise.sets || 0}
                                                    current={currentExercisePerformance.length}
                                                    performance={currentExercisePerformance}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className="row-start-2 row-end-3 pt-4">
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
            <RestTimerModal position={timerPosition} duration={restTime} onClose={() => setTimerPosition(null)} />
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