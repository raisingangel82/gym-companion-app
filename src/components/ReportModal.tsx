import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeContext'; // MODIFICA: Importato per usare il tema
import { Sparkles, Zap } from 'lucide-react';

export interface ReportData {
  title: string;
  summary: string;
  positivePoints: string[];
  improvementAreas: string[];
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  isLoading: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportData, isLoading }) => {
  // MODIFICA: Aggiunto il hook per il tema
  const { activeTheme } = useTheme();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles size={20} className="text-primary" />
                    Report Performance AI
                  </Dialog.Title>
                  
                  {isLoading && (
                    <div className="text-center p-8">
                      <p className="text-gray-600 dark:text-gray-300">L'AI sta analizzando i tuoi dati...</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Potrebbe volerci un minuto.</p>
                    </div>
                  )}

                  {reportData && (
                    <div className="mt-4 space-y-4">
                      {/* MODIFICA: Aggiunte classi per il tema scuro */}
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{reportData.title}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{reportData.summary}</p>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Zap size={16} className="text-green-500"/> Punti di Forza</h3>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {reportData.positivePoints.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Zap size={16} className="text-yellow-500"/> Aree di Miglioramento</h3>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {reportData.improvementAreas.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end">
                  {/* MODIFICA: Aggiunte classi per il colore del tema */}
                  <Button onClick={onClose} className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`}>
                    Capito!
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