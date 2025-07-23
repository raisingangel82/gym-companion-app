import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Save } from 'lucide-react';

export interface SessionLogData {
  sessionNotes?: string;
  doms: number;
  sleepQuality: number;
  stressLevel: number;
}

interface SessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SessionLogData) => void;
}

const RatingSelector: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  const { activeTheme } = useTheme();
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: 5 }).map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => onChange(ratingValue)}
            className={`w-10 h-10 rounded-full text-lg font-bold transition-all ${
              ratingValue <= value
                ? `text-white ${activeTheme.bgClass}`
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {ratingValue}
          </button>
        );
      })}
    </div>
  );
};

export const SessionLogModal: React.FC<SessionLogModalProps> = ({ isOpen, onClose, onSave }) => {
  const { activeTheme } = useTheme(); // Hook del tema per il pulsante
  const [sessionNotes, setSessionNotes] = useState('');
  const [doms, setDoms] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);

  const handleSave = () => {
    onSave({
      sessionNotes: sessionNotes.trim(),
      doms,
      sleepQuality,
      stressLevel,
    });
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                  Feedback Allenamento
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Valuta la sessione appena conclusa.
                </Dialog.Description>
                
                <main className="mt-6 space-y-6">
                  <div>
                    <Label className="text-center block mb-2">Dolori Muscolari (DOMS)</Label>
                    <RatingSelector value={doms} onChange={setDoms} />
                  </div>
                  <div>
                    <Label className="text-center block mb-2">Qualità del Sonno (notte scorsa)</Label>
                    <RatingSelector value={sleepQuality} onChange={setSleepQuality} />
                  </div>
                  <div>
                    <Label className="text-center block mb-2">Livello di Stress (oggi)</Label>
                    <RatingSelector value={stressLevel} onChange={setStressLevel} />
                  </div>
                  <div>
                    <Label htmlFor="session-notes">Note sulla Sessione</Label>
                    <Textarea 
                      id="session-notes"
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Come ti sei sentito? Energie, fastidi, ecc."
                      className="mt-1"
                    />
                  </div>
                </main>

                <footer className="mt-8 flex flex-col gap-3">
                  {/* BOTTONE CORRETTO */}
                  <Button 
                    onClick={handleSave} 
                    className={`w-full h-12 text-lg text-white ${activeTheme.bgClass} hover:opacity-90`}
                  >
                    <Save className="mr-2" size={20} />
                    Salva e Termina Allenamento
                  </Button>
                  <Button onClick={onClose} variant="ghost">Annulla</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};