import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { UserProfile } from '../types';
import { Button } from './ui/Button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Step1_UserData } from './onboarding/Step1_UserData';
import { Step2_Goals } from './onboarding/Step2_Goals';
import { Step3_Health } from './onboarding/Step3_Health';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: UserProfile) => void;
}

const TOTAL_STEPS = 3;

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { activeTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserProfile>({});

  const handleNext = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleDataChange = (data: Partial<UserProfile>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = () => {
    onComplete(userData);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1_UserData data={userData} onDataChange={handleDataChange} />;
      case 2:
        return <Step2_Goals data={userData} onDataChange={handleDataChange} />;
      case 3:
        return <Step3_Health data={userData} onDataChange={handleDataChange} />;
      default:
        return <Step1_UserData data={userData} onDataChange={handleDataChange} />;
    }
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all flex flex-col">
                <header className="p-6">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                    Crea il tuo Profilo
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Passo {step} di {TOTAL_STEPS}
                  </p>
                </header>
                <main className="px-6 py-4 flex-grow min-h-[300px]">
                  {renderStepContent()}
                </main>
                <footer className="bg-gray-50 dark:bg-gray-700/50 p-4 flex justify-between items-center">
                  <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                    <ArrowLeft size={16} className="mr-2" />
                    Indietro
                  </Button>
                  {step < TOTAL_STEPS ? (
                     <Button onClick={handleNext} className={`text-white ${activeTheme.bgClass}`}>
                       Avanti
                       <ArrowRight size={16} className="ml-2" />
                     </Button>
                  ) : (
                    <Button onClick={handleComplete} className={`text-white ${activeTheme.bgClass}`}>
                      Completa Profilo
                      <Check size={16} className="ml-2" />
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