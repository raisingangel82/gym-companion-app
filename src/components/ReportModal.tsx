import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, Zap, BarChartBig, Dumbbell, Target, Lightbulb, ChevronRight } from 'lucide-react';

// ======================================================================================
// 1. NUOVA INTERFACCIA DATI: Rispecchia l'output dettagliato dell'AI
// ======================================================================================
export interface ReportData {
  title: string;
  period: string;
  overallAnalysis: {
    summary: string;
    volumeTrend: { status: string; comment: string; };
    adherence: { level: string; comment: string; };
    muscleGroupBalance: { mostTrained: string[]; leastTrained: string[]; comment: string; };
  };
  exerciseDeepDive: Array<{
    exerciseName: string;
    performanceTrend: string;
    analysis: string;
    suggestion: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    primary: { title: string; why: string; how: string[]; };
    alternative: { title: string; why: string; how: string[]; };
  };
}


interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  isLoading: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportData, isLoading }) => {
  const { activeTheme } = useTheme();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-300">L'AI sta analizzando i tuoi dati...</p>
          <div className="flex justify-center items-center mt-4">
            <Sparkles size={24} className="text-primary animate-pulse" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Potrebbe volerci fino a un minuto.</p>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-300">Nessun dato disponibile per il report.</p>
        </div>
      );
    }
    
    // ======================================================================================
    // 2. NUOVO RENDERING: Sezioni dedicate per ogni parte del report dettagliato
    // ======================================================================================
    return (
      <div className="mt-4 space-y-6">
        {/* Titolo e Periodo */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reportData.title}</h2>
          <p className="text-sm font-medium text-primary">{reportData.period}</p>
        </div>

        {/* Sezione Analisi Generale */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BarChartBig size={20} /> Analisi Generale
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 border-l-4 border-primary pl-4">{reportData.overallAnalysis.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="font-semibold">Trend del Volume</p>
                  <p className="text-gray-600 dark:text-gray-300"><span className="font-bold">{reportData.overallAnalysis.volumeTrend.status}:</span> {reportData.overallAnalysis.volumeTrend.comment}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="font-semibold">Aderenza al Programma</p>
                  <p className="text-gray-600 dark:text-gray-300"><span className="font-bold">{reportData.overallAnalysis.adherence.level}:</span> {reportData.overallAnalysis.adherence.comment}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg col-span-1 md:col-span-2">
                  <p className="font-semibold">Bilanciamento Gruppi Muscolari</p>
                  <p className="text-gray-600 dark:text-gray-300">{reportData.overallAnalysis.muscleGroupBalance.comment}</p>
              </div>
          </div>
        </div>

        {/* Sezione Analisi Esercizi */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Dumbbell size={20} /> Analisi Esercizi Chiave
          </h3>
          <div className="space-y-3">
            {reportData.exerciseDeepDive.map((ex, index) => (
              <div key={index} className="text-sm border-l-4 border-gray-300 dark:border-gray-600 pl-4">
                <p className="font-bold text-gray-900 dark:text-white">{ex.exerciseName}</p>
                <p className="font-semibold text-primary">{ex.performanceTrend}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1"><span className="font-semibold">Analisi:</span> {ex.analysis}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1"><span className="font-semibold">Suggerimento:</span> {ex.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Punti di Forza e Aree di Miglioramento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Zap size={16} className="text-green-500"/> Punti di Forza</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {Array.isArray(reportData.strengths) && reportData.strengths.map((point, index) => <li key={index}>{point}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Target size={16} className="text-yellow-500"/> Aree di Miglioramento</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {Array.isArray(reportData.weaknesses) && reportData.weaknesses.map((point, index) => <li key={index}>{point}</li>)}
              </ul>
            </div>
        </div>
        
        {/* Raccomandazioni */}
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Lightbulb size={20} /> Raccomandazioni Strategiche
            </h3>
            {/* Raccomandazione Primaria */}
            <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-bold text-primary">{reportData.recommendations.primary.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{reportData.recommendations.primary.why}</p>
                <ul className="mt-2 space-y-1 text-sm">
                    {reportData.recommendations.primary.how.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                           <ChevronRight size={16} className="text-primary mt-1 flex-shrink-0"/> <span>{step}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Raccomandazione Alternativa */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{reportData.recommendations.alternative.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{reportData.recommendations.alternative.why}</p>
            </div>
        </div>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles size={20} className="text-primary" />
                    Report Performance AI
                  </Dialog.Title>
                  
                  {renderContent()}

                </div>

                <footer className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end">
                  <Button onClick={onClose} className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`}>
                    Ho Capito, Grazie!
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