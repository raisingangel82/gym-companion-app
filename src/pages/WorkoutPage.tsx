// src/pages/WorkoutPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
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
import { PerformanceSummary } from '../components/PerformanceSummary';
import { SetProgressBar } from '../components/SetProgressBar';
import { CompletionDots } from '../components/CompletionDots';
import { Info, Undo2, Repeat, Save, PlusCircle, ArrowLeft, ChevronLeft } from 'lucide-react';
// ASSUMIAMO CHE IL TUO FILE types.ts ABBIA ORA Exercise CON ID OBBLIGATORIO
import type { Exercise, SetPerformance, WorkoutSession } from '../types'; 
import {
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line,
} from 'recharts';


// ===================================================================================
// GRAFICO PERFORMANCE (Logica sdoppiata per Forza e Cardio)
// ===================================================================================
interface SessionData {
  date: string;
  originalDate: string; // Data ISO per l'ordinamento
  performance: SetPerformance[];
}

// CORREZIONE TS7053: Re-aggiunta la index signature
interface ChartDataPoint {
  name: string;
  [key: string]: string | number | null; // Consente chiavi dinamiche come le date
}

interface PerformanceChartProps {
  sessions: SessionData[];
  targetSets: number;
  colors: string[];
  exerciseType: Exercise['type'];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ sessions, targetSets, exerciseType, colors }) => {
  const { theme, activeTheme } = useTheme();
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';

  if (!sessions.some(s => s.performance.length > 0)) {
    return <div className="flex items-center justify-center h-full text-gray-400">Registra un set per vedere il grafico</div>;
  }

  // --- GRAFICO PER ESERCIZI CARDIO ---
  if (exerciseType === 'cardio') {
    const cardioChartData = useMemo(() => {
      return sessions
        .map(session => {
          const perf = session.performance[0]; // Per il cardio, consideriamo solo il primo (e unico) set
          if (!perf) return null;
          const performanceValue = (perf.duration || 0) * (perf.speed || 0) * (perf.level || 0);
          return {
            date: session.date,
            performance: performanceValue > 0 ? performanceValue : null,
            originalDate: new Date(session.originalDate), // Oggetto Date per l'ordinamento
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
    }, [sessions]);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={cardioChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 12 }} />
          <YAxis
              tick={{ fill: axisColor, fontSize: 12 }}
              domain={['dataMin', 'auto']}
              tickFormatter={(value) => new Intl.NumberFormat('it-IT').format(value)}
          />
          <Tooltip
            contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB', borderRadius: '0.5rem' }}
            labelStyle={{ color: axisColor }}
          />
          <Line
            type="monotone"
            dataKey="performance"
            name="Performance"
            stroke={activeTheme.hex}
            strokeWidth={3}
            connectNulls
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // --- GRAFICO PER ESERCIZI DI FORZA (Default) ---
  const strengthChartData = useMemo(() => {
    const xAxisSets = Array.from({ length: targetSets }, (_, i) => `Set ${i + 1}`);
    const data: ChartDataPoint[] = xAxisSets.map(setName => ({ name: setName })); // Usa ChartDataPoint
    sessions.forEach(session => {
      session.performance.forEach((set, setIndex) => {
        if (setIndex < targetSets) {
          const volume = (set.reps || 0) * (set.weight || 0);
          data[setIndex][session.date] = volume > 0 ? volume : null;
        }
      });
    });
    return data;
  }, [sessions, targetSets]);

  const sessionKeys = sessions.map(s => s.date);
  const lineName = 'Volume (kg)';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={strengthChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis
            tick={{ fill: axisColor, fontSize: 12 }}
            domain={[(dataMin: number) => (dataMin > 0 ? Math.floor(dataMin * 0.9) : 0), 'auto']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB', borderRadius: '0.5rem' }}
          labelStyle={{ color: axisColor }}
        />
        {sessionKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={`${key} (${lineName})`}
            stroke={colors[index] || '#cccccc'}
            strokeWidth={key === 'Oggi' ? 3 : 2}
            connectNulls
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};


// ===================================================================================
// VISTA DI DETTAGLIO
// ===================================================================================
interface ExerciseDetailViewProps {
  exercise: Exercise;
  activeWorkoutHistory: WorkoutSession[];
  onUndoLastSet: () => void;
  onOpenSubstitutionModal: () => void;
  onGoBack: () => void;
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ exercise, activeWorkoutHistory, onUndoLastSet, onOpenSubstitutionModal, onGoBack }) => {
  const { activeTheme } = useTheme();
  
  const sessionsToDisplay = useMemo(() => {
    // Aggiungo la data originale per permettere l'ordinamento cronologico nel grafico cardio
    const todaySession = { date: 'Oggi', originalDate: new Date().toISOString(), performance: exercise.performance || [] };
    const recentHistory = activeWorkoutHistory
      .map(session => ({
        date: new Date(session.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
        originalDate: session.date,
        performance: session.exercises.find(e => e.id === exercise.id)?.performance || [],
      }))
      .filter(entry => entry.performance.length > 0)
      .slice(-2);
    return [todaySession, ...recentHistory];
  }, [exercise, activeWorkoutHistory]);

  const sessionColors = useMemo(() => {
    const predefined = ['#82ca9d', '#ffc658'];
    return [activeTheme.hex, ...predefined];
  }, [activeTheme.hex]);

  return (
    <div className="px-4 pt-4 pb-28 space-y-6">
      <div>
        <div className="relative flex justify-center items-center">
          <button onClick={onGoBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={24} /></button>
          <h1 className="text-3xl font-bold text-center px-10 truncate">{exercise.name}</h1>
        </div>
      </div>
      <Card className="p-3">
        <PerformanceSummary exercise={exercise} performance={exercise.performance || []} />
        <div className="mt-3">
          <SetProgressBar exercise={exercise} />
        </div>
      </Card>
      <div>
        <h2 className="text-xl font-bold mb-3">Storico Confrontato</h2>
        <div className="flex flex-row gap-4">
          {sessionsToDisplay.map((session, idx) => (
            <Card key={idx} className="flex-1 flex flex-col p-3" style={{ borderTop: `4px solid ${sessionColors[idx]}` }}>
              <h3 className="font-bold text-center mb-2">{session.date}</h3>
              <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                {session.performance.length > 0 ? session.performance.map((p, pIdx) => (
                  <div key={pIdx} className="border-b border-gray-200 dark:border-gray-700 pb-1 last:border-b-0">
                    {exercise.type === 'cardio' ? (
                      <p>
                        {p.duration}' <span className="text-xs opacity-70"> D</span> / {p.speed} <span className="text-xs opacity-70">V</span> / {p.level} <span className="text-xs opacity-70">L</span>
                      </p>
                    ) : (
                      <p>
                        <span className="font-semibold">{p.reps} reps</span> @ {p.weight}kg
                      </p>
                    )}
                  </div>
                )) : (<p className="text-center italic mt-2">Nessun dato</p>)}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-3">Andamento Performance</h2>
        <div className="h-80">
          <Card className="h-full w-full p-2">
              {/* Target sets per cardio può essere 1 perché si fa un solo "set" per sessione */}
              <PerformanceChart sessions={sessionsToDisplay} targetSets={exercise.type === 'cardio' ? 1 : (exercise.sets || 1)} colors={sessionColors} exerciseType={exercise.type} />
          </Card>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={onUndoLastSet} variant="secondary" disabled={!exercise.performance || exercise.performance.length === 0}><Undo2 size={16} className="mr-2" /> Annulla</Button>
          <Button onClick={onOpenSubstitutionModal} className={`text-white ${activeTheme.bgClass}`} title="Sostituisci esercizio"><Repeat size={16} className="mr-2" /> Sostituisci</Button>
        </div>
      </div>
    </div>
  );
};


// ===================================================================================
// PAGINA PRINCIPALE
// ===================================================================================
export const WorkoutPage: React.FC = () => {
    const { activeWorkout, updateWorkout, saveSessionToHistory } = useWorkouts();
    const { restTimePrimary, restTimeSecondary, autoRestTimer } = useSettings();
    const { setActionConfig } = usePageAction();
    const { startTimer } = useRestTimer();

    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [logModalState, setLogModalState] = useState<{ isOpen: boolean; ex?: Exercise; setIndex?: number; exerciseIndex?: number; }>({ isOpen: false });
    const [isSessionLogModalOpen, setIsSessionLogModalOpen] = useState(false);
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);

    useEffect(() => {
        if (!activeWorkout) { setActionConfig(null); return; }
        if (!selectedExercise) {
            const action = () => setIsSessionLogModalOpen(true);
            setActionConfig({ onClick: action, icon: Save, label: 'Termina', disabled: false });
        } else {
            const exerciseIndex = activeWorkout.exercises.findIndex(e => e.id === selectedExercise.id);
            const currentExercise = activeWorkout.exercises[exerciseIndex];
            // Per cardio, il "nextSetIndex" è sempre 0 se non ancora registrato, o 1 se già registrato
            // Per forza, è la lunghezza dell'array performance
            const nextSetIndex = currentExercise.performance?.length || 0;
            // Per cardio, consideriamo "1 set" per sessione, per forza è il numero di set definiti
            const totalSets = currentExercise.type === 'strength' ? (currentExercise.sets || 0) : 1; 

            if (nextSetIndex < totalSets || currentExercise.type === 'cardio' && nextSetIndex === 0) {
                 // Per cardio, se nextSetIndex è 0, significa che non è ancora stato registrato.
                 // Il setIndex per la modal sarà sempre 0 per il cardio.
                const setIndexForCardio = currentExercise.type === 'cardio' ? 0 : nextSetIndex;
                const action = () => setLogModalState({ isOpen: true, ex: currentExercise, setIndex: setIndexForCardio, exerciseIndex: exerciseIndex });
                setActionConfig({ onClick: action, icon: PlusCircle, label: 'Esegui', disabled: false });
            } else {
                const action = () => setSelectedExercise(null);
                setActionConfig({ onClick: action, icon: ArrowLeft, label: 'Indietro', disabled: false });
            }
        }
        return () => setActionConfig(null);
    }, [selectedExercise, activeWorkout, setActionConfig, autoRestTimer, restTimePrimary, restTimeSecondary, startTimer]); // Aggiunti a dependencies per completezza

    const handleSavePerformance = async (performance: SetPerformance) => {
        const { ex: exerciseToUpdate, setIndex: setIndexToUpdate, exerciseIndex: exerciseIndexToUpdate } = logModalState;
        if (!activeWorkout || !exerciseToUpdate || setIndexToUpdate === undefined || exerciseIndexToUpdate === undefined) return;
        const updatedExercises = [...activeWorkout.exercises];
        let newPerformance = [...(exerciseToUpdate.performance || [])];
        
        // Per cardio, sovrascriviamo sempre il "primo" (e unico) set per quella sessione
        if (exerciseToUpdate.type === 'cardio') {
            newPerformance = [performance]; // Rimuovi i set precedenti per questa sessione e aggiungi solo il nuovo
        } else {
            newPerformance[setIndexToUpdate] = performance;
        }

        const updatedExercise = { ...exerciseToUpdate, performance: newPerformance };
        updatedExercises[exerciseIndexToUpdate] = updatedExercise;
        setSelectedExercise(updatedExercise);
        try {
            await updateWorkout(activeWorkout.id, { exercises: updatedExercises, _lastUpdated: new Date() });
            if (autoRestTimer && updatedExercise.type === 'strength') {
                const duration = updatedExercise.restTimerType === 'secondary' ? restTimeSecondary : restTimePrimary;
                startTimer(duration);
            }
        } catch (error) { console.error("ERRORE durante la chiamata a updateWorkout:", error); throw error; }
    };
    
    const handleUndoLastSet = () => {
        if (!activeWorkout || !selectedExercise) return;
        const exerciseIndex = activeWorkout.exercises.findIndex(e => e.id === selectedExercise.id);
        const exerciseToUpdate = activeWorkout.exercises[exerciseIndex];
        if (!exerciseToUpdate?.performance?.length) return;
        const updatedExercises = [...activeWorkout.exercises];
        const newPerformance = [...exerciseToUpdate.performance];
        newPerformance.pop(); // Rimuovi l'ultimo set
        const updatedExercise = { ...exerciseToUpdate, performance: newPerformance };
        updatedExercises[exerciseIndex] = updatedExercise;
        setSelectedExercise(updatedExercise);
        updateWorkout(activeWorkout.id, { exercises: updatedExercises, _lastUpdated: new Date() });
    };

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
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Vai nella sezione "Gestisci" per selezionare una delle tue schede e renderla attiva.</p>
            </div>
        );
    }
    
    const renderModals = () => (
        <>
            {logModalState.isOpen && logModalState.ex && logModalState.setIndex !== undefined && (
                <ExerciseLogModal isOpen={logModalState.isOpen} onClose={() => setLogModalState({ isOpen: false })} onSave={handleSavePerformance} exercise={logModalState.ex} setIndex={logModalState.setIndex} />
            )}
            <SessionLogModal isOpen={isSessionLogModalOpen} onClose={() => setIsSessionLogModalOpen(false)} onSave={handleSaveSession} />
            <ExerciseSubstitutionModal isOpen={isSubstitutionModalOpen} onClose={() => setIsSubstitutionModalOpen(false)} exerciseToSubstitute={selectedExercise} />
        </>
    );

    return (
        <div className="h-full w-full">
            {selectedExercise ? (
                <ExerciseDetailView exercise={selectedExercise} activeWorkoutHistory={activeWorkout.history || []} onUndoLastSet={handleUndoLastSet} onOpenSubstitutionModal={() => setIsSubstitutionModalOpen(true)} onGoBack={() => setSelectedExercise(null)} />
            ) : (
                <div className="h-full overflow-y-auto p-4 space-y-3">
                  <h1 className="text-2xl font-bold px-2">{activeWorkout.name}</h1>
                  {activeWorkout.exercises.map((exercise) => (
                      <Card key={exercise.id} onClick={() => setSelectedExercise(exercise)} className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg">{exercise.name}</h3>
                              <CompletionDots exercise={exercise} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {exercise.type === 'strength' && `${exercise.sets} serie × ${exercise.reps} reps @ ${exercise.weight || '-'}kg`}
                            {exercise.type === 'cardio' && `${exercise.duration} min`}
                          </p>
                      </Card>
                  ))}
                </div>
            )}
            {renderModals()}
        </div>
    );
};