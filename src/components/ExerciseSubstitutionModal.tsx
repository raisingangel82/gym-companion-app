import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Label } from './ui/Label';
import type { Exercise } from '../types';
import { Sparkles } from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseToSubstitute: Exercise | null;
}

type SubstitutionReason = 'occupied' | 'discomfort' | 'variety';
type AIResponse = {
  quickAnalysis: string;
  primarySolution: { exerciseName: string; why: string; instructions: string; };
  secondarySolution: { exerciseName: string; why: string; instructions: string; };
} | null;

const reasons: { id: SubstitutionReason; label: string }[] = [
    { id: 'occupied', label: 'Attrezzo Occupato' },
    { id: 'discomfort', label: 'Leggero Fastidio' },
    { id: 'variety', label: 'Voglio una Variante' },
];

export const ExerciseSubstitutionModal: React.FC<SubstitutionModalProps> = ({ isOpen, onClose, exerciseToSubstitute }) => {
  const { activeTheme } = useTheme();
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<SubstitutionReason | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse>(null);

  const handleClose = () => {
    onClose();
    // Resetta lo stato interno del modale quando viene chiuso
    setTimeout(() => {
        setSelectedReason(null);
        setAiResponse(null);
    }, 300); // Ritardo per permettere l'animazione di chiusura
  };

  const handleFindAlternatives = async () => {
    if (!selectedReason || !exerciseToSubstitute || !user) return;
    
    setIsLoading(true);
    setAiResponse(null);
    try {
      const functions = getFunctions();
      const getExerciseSubstitution = httpsCallable(functions, 'getExerciseSubstitution');
      
      const userProfile = { goal: user.goal, experience: user.experience, injuries: user.injuries };
      const result = await getExerciseSubstitution({ userProfile, exerciseToSubstitute, reason: selectedReason });
      
      setAiResponse(result.data as AIResponse);

    } catch (error) {
      console.error("Errore chiamando la funzione AI:", error);
      alert("Si è verificato un errore nel contattare l'AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} /* ... */ >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} /* ... */ >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100">
                    Sostituisci Esercizio
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Sostituisci <span className="font-bold text-gray-800 dark:text-gray-200">{exerciseToSubstitute?.name}</span> con un'alternativa AI.
                  </p>

                  {!aiResponse && (
                    <div className="mt-4">
                      <Label className="text-gray-800 dark:text-gray-200">Perché vuoi sostituirlo?</Label>
                      <div className="mt-2 flex flex-col gap-2">
                        {reasons.map((reason) => (
                          <button
                            key={reason.id}
                            onClick={() => setSelectedReason(reason.id)}
                            className={`w-full p-3 rounded-lg text-left font-medium transition-all ${
                                selectedReason === reason.id 
                                ? `text-white ${activeTheme.bgClass} ring-2 ring-offset-2 dark:ring-offset-gray-800 ${activeTheme.ringClass}`
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoading && <div className="text-center p-8">Caricamento alternative...</div>}

                  {aiResponse && (
                    <div className="mt-4 space-y-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm italic text-gray-600 dark:text-gray-300">{aiResponse.quickAnalysis}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">Soluzione Primaria</h4>
                        <p className="font-semibold text-primary">{aiResponse.primarySolution.exerciseName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{aiResponse.primarySolution.why}</p>
                        <p className="mt-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">ISTRUZIONI: {aiResponse.primarySolution.instructions}</p>
                      </div>
                       <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">Soluzione Secondaria</h4>
                        <p className="font-semibold text-primary">{aiResponse.secondarySolution.exerciseName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{aiResponse.secondarySolution.why}</p>
                        <p className="mt-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">ISTRUZIONI: {aiResponse.secondarySolution.instructions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={handleClose}>Chiudi</Button>
                  {!aiResponse && (
                    <Button onClick={handleFindAlternatives} className={`text-white ${activeTheme.bgClass} hover:opacity-90`} disabled={!selectedReason || isLoading}>
                      <Sparkles size={16} className="mr-2"/>
                      {isLoading ? 'Analizzo...' : 'Trova Alternative'}
                    </Button>
                  )}
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};