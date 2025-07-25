import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { ThumbsUp, ThumbsDown, ClipboardCheck, Zap } from 'lucide-react';

// Definiamo la struttura dei dati del report
export interface ReportData {
  title: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendedOption: { title: string; why: string; how: string; };
  alternativeOption: { title: string; why: string; how: string; };
  nextStep: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  isLoading: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportData, isLoading }) => {
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
                <header className="bg-gray-50 dark:bg-gray-700/50 p-6">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ClipboardCheck /> {reportData?.title || 'Analisi Performance'}
                  </Dialog.Title>
                </header>
                
                <main className="p-6 max-h-[60vh] overflow-y-auto">
                  {isLoading && <div className="text-center p-8">Analisi in corso...</div>}
                  {reportData && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Sintesi Generale</h4>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">{reportData.summary}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                          <h4 className="font-semibold flex items-center gap-2 text-green-800 dark:text-green-300"><ThumbsUp size={18}/> Punti di Forza</h4>
                          <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-400">
                            {reportData.strengths.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
                          <h4 className="font-semibold flex items-center gap-2 text-red-800 dark:text-red-300"><ThumbsDown size={18}/> Aree di Miglioramento</h4>
                          <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-400">
                            {reportData.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2"><Zap size={20}/> Raccomandazione Strategica</h4>
                        <div className="mt-2 p-4 border-l-4 border-primary bg-gray-50 dark:bg-gray-700/50 rounded-r-lg">
                            <p className="font-bold">{reportData.recommendedOption.title}</p>
                            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{reportData.recommendedOption.why}</p>
                            <p className="mt-2 text-xs font-mono"><b>Come:</b> {reportData.recommendedOption.how}</p>
                        </div>
                         <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="font-bold">{reportData.alternativeOption.title}</p>
                            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{reportData.alternativeOption.why}</p>
                             <p className="mt-2 text-xs font-mono"><b>Come:</b> {reportData.alternativeOption.how}</p>
                        </div>
                      </div>
                       <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Prossimo Passo</h4>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">{reportData.nextStep}</p>
                      </div>
                    </div>
                  )}
                </main>
                <footer className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end">
                  <Button onClick={onClose}>Chiudi</Button>
                </footer>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};