import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
// Rimuoviamo l'Input, non più usato per peso/reps
import { Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { NumberStepper } from './ui/NumberStepper'; // Importiamo il nuovo componente
import { RpeSelector } from './ui/RpeSelector';   // Importiamo il nuovo componente
import type { Exercise, SetPerformance } from '../types';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (performance: SetPerformance) => Promise<void>;
  exercise: Exercise;
  setIndex: number;
}

export const ExerciseLogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave, exercise, setIndex }) => {
  const { activeTheme } = useTheme();
  
  // MODIFICA: Stati ora numerici per coerenza con i nuovi componenti
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [level, setLevel] = useState(0);
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // MODIFICA: Inizializzazione degli stati numerici
        setWeight(Number(exercise.weight ?? 0));
        setReps(Number(exercise.reps ?? 0));
        setDuration(Number(exercise.duration ?? 0));
        setSpeed(Number(exercise.speed ?? 0));
        setLevel(Number(exercise.level ?? 0));
        setRpe(7);
        setNotes('');
        setIsSaving(false);
    }
  }, [isOpen, exercise]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const basePerformance: Partial<SetPerformance> = { rpe };
    if (notes.trim()) {
      basePerformance.notes = notes.trim();
    }
    
    let performanceData: SetPerformance;
    if (exercise.type === 'cardio') {
      performanceData = {
        ...basePerformance,
        duration, speed, level,
      } as SetPerformance;
    } else {
      performanceData = {
        ...basePerformance,
        weight, reps,
      } as SetPerformance;
    }

    try {
        await onSave(performanceData);
        onClose();
    } catch (error) {
        console.error("Errore durante il salvataggio dalla modale:", error);
        alert("Si è verificato un errore durante il salvataggio. Controlla la console.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isSaving && onClose()}>
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
                      <div className="grid grid-cols-1 gap-4">
                        <div><Label className="dark:text-gray-300 text-center mb-1">Durata (min)</Label><NumberStepper value={duration} onChange={setDuration} step={1} /></div>
                        <div><Label className="dark:text-gray-300 text-center mb-1">Velocità</Label><NumberStepper value={speed} onChange={setSpeed} step={0.5} /></div>
                        <div><Label className="dark:text-gray-300 text-center mb-1">Livello</Label><NumberStepper value={level} onChange={setLevel} step={1} /></div>
                      </div>
                    </div>
                  ) : (
                    // MODIFICA: Sostituzione degli Input con i NumberStepper
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="dark:text-gray-300 text-center mb-1">Peso (kg)</Label><NumberStepper value={weight} onChange={setWeight} step={2.5} /></div>
                      <div><Label className="dark:text-gray-300 text-center mb-1">Reps</Label><NumberStepper value={reps} onChange={setReps} step={1} /></div>
                    </div>
                  )}
                  <div>
                    <Label className="dark:text-gray-300">Sforzo Percepito (RPE): <span className="font-bold">{rpe}</span></Label>
                    {/* MODIFICA: Sostituzione del range slider con il RpeSelector */}
                    <div className="mt-2"><RpeSelector value={rpe} onChange={setRpe} /></div>
                  </div>
                  <div>
                    <Label htmlFor="notes" className="dark:text-gray-300">Note</Label>
                    <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sensazioni, fastidi, ecc." className="mt-1" />
                  </div>
                </main>
                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col gap-2">
                  <Button onClick={handleSave} className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`} disabled={isSaving}>
                    <Save size={16} className="mr-2" /> {isSaving ? 'Salvataggio...' : 'Salva Performance'}
                  </Button>
                  <Button variant="ghost" onClick={() => !isSaving && onClose()} className="dark:text-gray-200">Annulla</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};