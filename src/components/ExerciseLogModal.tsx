import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Exercise, SetPerformance } from '../types';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (performance: SetPerformance) => void;
  exercise: Exercise;
  setIndex: number;
}

export const ExerciseLogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave, exercise, setIndex }) => {
  const { activeTheme } = useTheme();
  
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [speed, setSpeed] = useState('');
  const [level, setLevel] = useState('');
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
        setWeight(String(exercise.weight ?? ''));
        setReps(String(exercise.reps ?? ''));
        setDuration(String(exercise.duration ?? ''));
        setSpeed(String(exercise.speed ?? ''));
        setLevel(String(exercise.level ?? ''));
        setRpe(7);
        setNotes('');
    }
  }, [isOpen, exercise]);

  const handleSave = () => {
    let performanceData: SetPerformance = { rpe, notes: notes.trim() ? notes.trim() : undefined };
    if (exercise.type === 'cardio') {
      performanceData = {
        ...performanceData,
        duration: parseFloat(duration) || 0,
        speed: parseFloat(speed) || 0,
        level: parseFloat(level) || 0,
      };
    } else {
      performanceData = {
        ...performanceData,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps, 10) || 0,
      };
    }
    onSave(performanceData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment}>
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <header className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100">
                    {exercise.type === 'cardio' ? `Registra ${exercise.name}` : `Set ${setIndex + 1} - ${exercise.name}`}
                  </Dialog.Title>
                </header>
                <main className="p-6 space-y-6">
                  {exercise.type === 'cardio' ? (
                    <div className="space-y-4">
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400">Inserisci i dati della tua sessione cardio.</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div><Label htmlFor="duration" className="dark:text-gray-300">Durata (min)</Label><Input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} /></div>
                        <div><Label htmlFor="speed" className="dark:text-gray-300">Velocità</Label><Input id="speed" type="number" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
                        <div><Label htmlFor="level" className="dark:text-gray-300">Livello</Label><Input id="level" type="number" value={level} onChange={e => setLevel(e.target.value)} /></div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="weight" className="dark:text-gray-300">Peso (kg)</Label><Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                      <div><Label htmlFor="reps" className="dark:text-gray-300">Reps</Label><Input id="reps" type="number" value={reps} onChange={e => setReps(e.target.value)} /></div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="rpe" className="dark:text-gray-300">Sforzo Percepito (RPE): <span className="font-bold">{rpe}</span></Label>
                    <input id="rpe" type="range" min="1" max="10" step="0.5" value={rpe} onChange={(e) => setRpe(parseFloat(e.target.value))} className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="dark:text-gray-300">Note</Label>
                    <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sensazioni, fastidi, ecc." className="mt-1" />
                  </div>
                </main>
                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col gap-2">
                  <Button onClick={handleSave} className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`}>
                    <Save size={16} className="mr-2" /> Salva Performance
                  </Button>
                  <Button variant="ghost" onClick={onClose}>Annulla</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};