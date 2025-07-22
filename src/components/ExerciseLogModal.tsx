import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Minus, Plus } from 'lucide-react';
import type { Exercise, SetPerformance } from '../types';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (performance: SetPerformance) => void;
  exercise: Exercise;
  setIndex: number;
}

const NumberStepper: React.FC<{ label: string; value: number; onChange: (value: number) => void; step: number; unit?: string }> = ({ label, value, onChange, step, unit }) => (
  <div className="text-center">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="flex items-center justify-center gap-4 mt-2">
      <Button onClick={() => onChange(value - step)} variant="outline" size="icon" className="rounded-full w-12 h-12"><Minus /></Button>
      <div className="text-4xl font-bold w-24 text-center tabular-nums">
        {value}{unit && <span className="text-xl ml-1">{unit}</span>}
      </div>
      <Button onClick={() => onChange(value + step)} variant="outline" size="icon" className="rounded-full w-12 h-12"><Plus /></Button>
    </div>
  </div>
);

export const ExerciseLogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave, exercise, setIndex }) => {
  const lastPerformance = exercise.performance?.[setIndex - 1] || exercise.performance?.[exercise.performance.length - 1];
  const targetReps = parseInt(String(exercise.reps).split(/[-|–]/)[0], 10) || 8;
  // FIX: Usa il peso target dall'esercizio se esiste
  const targetWeight = lastPerformance?.weight ?? exercise.weight ?? 0;

  const [reps, setReps] = useState(targetReps);
  const [weight, setWeight] = useState(targetWeight);

  useEffect(() => {
    if (isOpen) {
      setReps(lastPerformance?.reps ?? targetReps);
      setWeight(lastPerformance?.weight ?? targetWeight);
    }
  }, [isOpen, lastPerformance, targetReps, targetWeight]);

  const handleSave = () => {
    onSave({ reps, weight });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <header className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100">
                    Set {setIndex + 1} - {exercise.name}
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Obiettivo: {exercise.reps} reps @ {exercise.weight || 0}kg</p>
                </header>
                
                <main className="p-6 space-y-6">
                  <NumberStepper label="Ripetizioni" value={reps} onChange={setReps} step={1} />
                  {/* FIX: Rimosso unit="kg" per evitare duplicati */}
                  <NumberStepper label="Peso (kg)" value={weight} onChange={setWeight} step={2.5} />
                </main>

                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                  <Button onClick={handleSave} className="w-full h-12 text-lg">Salva Performance</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};