import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { ExerciseFinder } from './ExerciseFinder';
import type { Workout, WorkoutData, Exercise } from '../types';

interface EditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkoutData) => void;
  workout: Workout | null;
}

export const WorkoutEditorModal: React.FC<EditorProps> = ({ isOpen, onClose, onSave, workout }) => {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);
  const [findingImageForIndex, setFindingImageForIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(workout?.name || '');
      setExercises(workout?.exercises.length ? workout.exercises : [{ name: '', sets: 3, reps: '8-12', weight: 0 }]);
      setFindingImageForIndex(null);
    }
  }, [isOpen, workout]);

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises];
    const exercise = { ...newExercises[index] };
    (exercise as any)[field] = value;
    newExercises[index] = exercise;
    setExercises(newExercises);
  };

  const handleImageSelected = (index: number, imageUrl: string) => {
    handleExerciseChange(index, 'imageUrl', imageUrl);
    setFindingImageForIndex(null);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '8-12', weight: 0 }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Il nome della scheda non può essere vuoto.");
      return;
    }
    onSave({ name, exercises: exercises as Exercise[] });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
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
                        <div className="flex justify-between items-center gap-2">
                          <Input value={ex.name || ''} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} placeholder={`Esercizio ${index + 1}`} className="flex-grow"/>
                          <Button variant="ghost" onClick={() => setFindingImageForIndex(findingImageForIndex === index ? null : index)} size="icon" className="text-sky-500"><ImageIcon size={16} /></Button>
                          <Button onClick={() => removeExercise(index)} variant="ghost" size="icon" className="text-red-500"><Trash2 size={16} /></Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input type="number" value={ex.sets || ''} onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))} placeholder="Sets" />
                          <Input value={ex.reps || ''} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} placeholder="Reps" />
                          {/* CAMPO PESO CORRETTO */}
                          <Input type="number" value={ex.weight || ''} onChange={(e) => handleExerciseChange(index, 'weight', Number(e.target.value))} placeholder="Peso (kg)" />
                        </div>
                        {findingImageForIndex === index && (
                          <ExerciseFinder 
                            exerciseName={ex.name}
                            onImageSelected={(imageUrl) => handleImageSelected(index, imageUrl)}
                            onClose={() => setFindingImageForIndex(null)}
                          />
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
                  <Button onClick={handleSave}>Salva Scheda</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};