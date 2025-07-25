import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, PlusCircle, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
// 'ExerciseFinder' rimosso da qui
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
  const [findingImageForIndex, setFindingImageForIndex] = useState<number | null>(null); // Stato mantenuto per futura implementazione

  useEffect(() => {
    if (isOpen) {
      setName(workout?.name || '');
      setExercises(workout?.exercises.length ? workout.exercises : [{ name: '', type: 'strength', sets: 3, reps: '8-12', weight: 0 }]);
      setFindingImageForIndex(null);
    }
  }, [isOpen, workout]);

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    const exercise = { ...newExercises[index] };
    
    if (field === 'type') {
      if (value === 'strength') {
        exercise.duration = undefined;
        exercise.speed = undefined;
        exercise.level = undefined;
        exercise.sets = 3;
        exercise.reps = '8-12';
      } else {
        exercise.sets = undefined;
        exercise.reps = undefined;
        exercise.weight = undefined;
        exercise.duration = 20;
      }
    }

    (exercise as any)[field] = value;
    newExercises[index] = exercise;
    setExercises(newExercises);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', type: 'strength', sets: 3, reps: '8-12', weight: 0 }]);
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
    const workoutDataToSave: WorkoutData = {
      name: name,
      exercises: exercises.map(ex => ({...ex, type: ex.type || 'strength'})) as Exercise[],
      createdAt: workout?.createdAt || new Date(),
      history: workout?.history || [],
    };
    onSave(workoutDataToSave);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
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
                    <label htmlFor="workout-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Scheda</label>
                    <Input id="workout-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Giorno A - Spinta" />
                  </div>
                  
                  <div className="space-y-4">
                    {exercises.map((ex, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 space-y-2">
                        <div className="flex items-center gap-2">
                           <Input value={ex.name ?? ''} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} placeholder={`Esercizio ${index + 1}`} className="flex-grow"/>
                           <select value={ex.type || 'strength'} onChange={(e) => handleExerciseChange(index, 'type', e.target.value)} className="bg-gray-200 dark:bg-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500">
                             <option value="strength">Forza</option>
                             <option value="cardio">Cardio</option>
                           </select>
                           <div className="flex-shrink-0 flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleMoveExercise(index, 'up')} disabled={index === 0} className="text-gray-500"><ArrowUp size={16}/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleMoveExercise(index, 'down')} disabled={index === exercises.length - 1} className="text-gray-500"><ArrowDown size={16}/></Button>
                            <Button variant="ghost" size="icon" onClick={() => {}} className="text-sky-500"><ImageIcon size={16} /></Button>
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
                          <div className="grid grid-cols-3 gap-2">
                            <Input type="number" value={ex.sets ?? ''} onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))} placeholder="Sets" />
                            <Input value={ex.reps ?? ''} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} placeholder="Reps" />
                            <Input type="number" value={ex.weight ?? ''} onChange={(e) => handleExerciseChange(index, 'weight', Number(e.target.value))} placeholder="Peso (kg)" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button onClick={addExercise} variant="outline" className="w-full">
                    <PlusCircle size={16} className="mr-2" /> Aggiungi Esercizio
                  </Button>
                </main>
                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={onClose}>Annulla</Button>
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