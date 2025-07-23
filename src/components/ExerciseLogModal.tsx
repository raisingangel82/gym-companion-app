import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';
import type { Exercise, SetPerformance } from '../types';

// Importa i componenti UI dal percorso corretto
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (performance: SetPerformance) => void;
  exercise: Exercise;
  setIndex: number;
}

export const ExerciseLogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave, exercise, setIndex }) => {
  const { activeTheme } = useTheme();

  const lastPerformance = exercise.performance?.[setIndex - 1] || exercise.performance?.[exercise.performance.length - 1];
  
  // Usa il valore numerico dal tipo Exercise se esiste
  const targetWeight = lastPerformance?.weight ?? (typeof exercise.weight === 'number' ? exercise.weight : 0);
  const targetReps = lastPerformance?.reps ?? (parseInt(String(exercise.reps).split(/[-|–]/)[0], 10) || 8);

  const [weight, setWeight] = useState(targetWeight);
  const [reps, setReps] = useState(targetReps);
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWeight(lastPerformance?.weight ?? targetWeight);
      setReps(lastPerformance?.reps ?? targetReps);
      setRpe(lastPerformance?.rpe ?? 7);
      setNotes(lastPerformance?.notes ?? '');
    }
  }, [isOpen, lastPerformance, targetReps, targetWeight]);

  const handleSave = () => {
    onSave({ 
      weight: Number(weight), 
      reps: Number(reps), 
      rpe: Number(rpe), 
      notes: notes.trim() 
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <header className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100">
                    Set {setIndex + 1} - {exercise.name}
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Obiettivo: {exercise.reps} reps @ {exercise.weight}kg</p>
                </header>
                
                <main className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reps-input">Ripetizioni</Label>
                      <Input id="reps-input" type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label htmlFor="weight-input">Peso (kg)</Label>
                      <Input id="weight-input" type="number" step="0.5" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="rpe">Sforzo Percepito (RPE): <span className="font-bold">{rpe}</span></Label>
                    <input
                        id="rpe"
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={rpe}
                        onChange={(e) => setRpe(Number(e.target.value))}
                        className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Note</Label>
                    <Textarea 
                      id="notes" 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="Sensazioni, fastidi, ecc." 
                      className="mt-1"
                    />
                  </div>
                </main>

                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col gap-3">
                  <Button onClick={handleSave} className={`w-full h-12 text-lg text-white ${activeTheme.bgClass} hover:opacity-90`}>
                    Salva Performance
                  </Button>
                  <Button onClick={onClose} variant="ghost" className="w-full">
                    Annulla
                  </Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};