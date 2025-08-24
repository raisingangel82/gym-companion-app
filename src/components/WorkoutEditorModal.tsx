import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, PlusCircle, Image as ImageIcon, ArrowUp, ArrowDown, Timer } from 'lucide-react';
import { ExerciseFinder } from './ExerciseFinder';
import { useTheme } from '../contexts/ThemeContext';
import type { Workout, WorkoutData, Exercise } from '../types';

interface EditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkoutData) => void;
  workout: Workout | null;
}

export const WorkoutEditorModal: React.FC<EditorProps> = ({ isOpen, onClose, onSave, workout }) => {
  const { activeTheme } = useTheme();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);
  const [findingImageForIndex, setFindingImageForIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(workout?.name || '');
      
      // CORREZIONE 1: Dichiariamo esplicitamente il tipo di 'initialExercises'
      const initialExercises: Partial<Exercise>[] = workout?.exercises.length 
        ? workout.exercises.map(ex => ({ ...ex, restTimerType: ex.restTimerType || 'primary' }))
        : [{ name: '', type: 'strength', sets: 3, reps: '8-12', weight: 0, restTimerType: 'primary' }];
      
      setExercises(initialExercises);
      setFindingImageForIndex(null);
    }
  }, [isOpen, workout]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    const exercise = { ...newExercises[index] };
    
    if (field === 'type') {
      if (value === 'strength') {
        exercise.duration = undefined; exercise.speed = undefined; exercise.level = undefined;
        exercise.sets = 3; exercise.reps = '8-12';
        exercise.restTimerType = exercise.restTimerType || 'primary';
      } else {
        exercise.sets = undefined; exercise.reps = undefined; exercise.weight = undefined;
        exercise.duration = 20;
        exercise.restTimerType = undefined;
      }
    }
    (exercise as any)[field] = value;
    newExercises[index] = exercise;
    setExercises(newExercises);
  };

  const handleImageSelected = (index: number, imageUrl: string) => {
    handleExerciseChange(index, 'imageUrl', imageUrl);
    setFindingImageForIndex(null);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', type: 'strength', sets: 3, reps: '8-12', weight: 0, restTimerType: 'primary' }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };
  
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === exercises.length - 1)) return;
    const newExercises = [...exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!name.trim()) return alert("Il nome della scheda non può essere vuoto.");
    
    const validExercises = exercises.filter(ex => ex.name && ex.name.trim() !== '');

    const finalizedExercises = validExercises.map(ex => {
      const baseExercise: Partial<Exercise> = {
        name: ex.name!,
        type: ex.type || 'strength',
        // CORREZIONE 2: Sostituiamo 'null' con 'undefined' per allinearci al tipo
        imageUrl: ex.imageUrl || undefined,
        performance: ex.performance || [],
      };

      if (baseExercise.type === 'cardio') {
        return { ...baseExercise, duration: ex.duration || 0, speed: ex.speed || 0, level: ex.level || 0 };
      } else {
        return { ...baseExercise, sets: ex.sets || 0, reps: ex.reps || '0', weight: ex.weight || 0, restTimerType: ex.restTimerType || 'primary' };
      }
    }) as Exercise[];

    if (finalizedExercises.length === 0) return alert("La scheda deve contenere almeno un esercizio valido.");

    const workoutDataToSave: WorkoutData = {
      name: name,
      exercises: finalizedExercises,
      createdAt: workout?.createdAt || new Date(),
      history: workout?.history || [],
    };
    
    onSave(workoutDataToSave);
  };

  const selectClassName = "bg-gray-200 dark:bg-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}><div className="fixed inset-0 bg-black/30 backdrop-blur-sm" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}>
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <header className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100">
                    {workout ? 'Modifica Scheda' : 'Crea Nuova Scheda'}
                  </Dialog.Title>
                </header>
                
                <main className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                   <div>
                    <label htmlFor="workout-name-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Scheda</label>
                    <Input id="workout-name-editor" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Giorno A - Spinta" />
                  </div>

                  <div className="space-y-4">
                    {exercises.map((ex, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 space-y-2">
                        <div className="flex items-center gap-2">
                           <Input value={ex.name ?? ''} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} placeholder={`Esercizio ${index + 1}`} className="flex-grow"/>
                           <select value={ex.type || 'strength'} onChange={(e) => handleExerciseChange(index, 'type', e.target.value)} className={selectClassName}>
                             <option value="strength">Forza</option>
                             <option value="cardio">Cardio</option>
                           </select>
                           <div className="flex-shrink-0 flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleMoveExercise(index, 'up')} disabled={index === 0} className="text-gray-500"><ArrowUp size={16}/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleMoveExercise(index, 'down')} disabled={index === exercises.length - 1} className="text-gray-500"><ArrowDown size={16}/></Button>
                            <Button variant="ghost" size="icon" onClick={() => setFindingImageForIndex(findingImageForIndex === index ? null : index)} className="text-sky-500"><ImageIcon size={16} /></Button>
                            <Button variant="ghost" size="icon" onClick={() => removeExercise(index)} className="text-red-500"><Trash2 size={16} /></Button>
                          </div>
                        </div>
                        {ex.type === 'cardio' ? (
                          <div className="grid grid-cols-3 gap-2">
                             <Input type="number" value={ex.duration ?? ''} onChange={(e) => handleExerciseChange(index, 'duration', Number(e.target.value))} placeholder="Durata (min)" />
                             <Input type="number" value={ex.speed ?? ''} onChange={(e) => handleExerciseChange(index, 'speed', Number(e.target.value))} placeholder="Velocità" />
                             <Input type="number" value={ex.level ?? ''} onChange={(e) => handleExerciseChange(index, 'level', Number(e.target.value))} placeholder="Livello" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            <Input type="number" value={ex.sets ?? ''} onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))} placeholder="Sets" />
                            <Input value={ex.reps ?? ''} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} placeholder="Reps" />
                            <Input type="number" value={ex.weight ?? ''} onChange={(e) => handleExerciseChange(index, 'weight', Number(e.target.value))} placeholder="Peso (kg)" />
                            <div className="relative">
                               <Timer size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                               <select 
                                 value={ex.restTimerType || 'primary'} 
                                 onChange={(e) => handleExerciseChange(index, 'restTimerType', e.target.value as 'primary' | 'secondary')} 
                                 className={`${selectClassName} w-full pl-8`}
                                 title="Seleziona tipo di riposo"
                               >
                                 <option value="primary">Principale</option>
                                 <option value="secondary">Secondario</option>
                               </select>
                            </div>
                          </div>
                        )}
                        {findingImageForIndex === index && (
                          <ExerciseFinder 
                            exerciseName={ex.name ?? ''}
                            onImageSelected={(imageUrl) => handleImageSelected(index, imageUrl)}
                            onClose={() => setFindingImageForIndex(null)}
                            activeTheme={activeTheme}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                   <Button onClick={addExercise} variant="outline" className="w-full dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                    <PlusCircle size={16} className="mr-2" /> Aggiungi Esercizio
                  </Button>
                </main>
                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={onClose} className="dark:text-gray-200">Annulla</Button>
                  <Button onClick={handleSave} className={`text-white ${activeTheme.bgClass} hover:opacity-90`}>Salva Scheda</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};