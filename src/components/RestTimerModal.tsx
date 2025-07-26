import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';
import { useRestTimer } from '../contexts/RestTimerContext';
import { Button } from './ui/Button';
import { Plus, BellOff } from 'lucide-react';

export const RestTimerModal: React.FC = () => {
    const { activeTheme } = useTheme();
    // 1. Recupera i nuovi stati e funzioni dal contesto, inclusi 'isAlarming' e 'stopAlarm'
    const { isTimerActive, isAlarming, timeLeft, initialDuration, stopTimer, addTime, stopAlarm } = useRestTimer();

    // Calcoli per la UI
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

    // 2. Il modale ora è visibile se il timer è attivo OPPURE se l'allarme sta suonando
    return (
        <Transition
            as={Fragment}
            show={isTimerActive || isAlarming}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-x-0 top-20 bottom-24 z-50 flex flex-col items-center justify-center text-white p-4 bg-black/80 backdrop-blur-md">
                {/* Barra di progresso (visibile solo durante il timer attivo) */}
                {isTimerActive && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                        <div 
                            className={`h-full ${activeTheme.bgClass}`}
                            style={{ width: `${progress}%`, transition: 'width 1s linear' }}
                        ></div>
                    </div>
                )}

                <div className="text-center">
                    {/* 3. Usa lo stato 'isAlarming' dal contesto per cambiare il testo */}
                    <p className="text-2xl text-gray-300 mb-2">{isAlarming ? "Fine Riposo!" : "Riposo"}</p>
                    <p className="text-8xl md:text-9xl font-mono font-bold tracking-tighter">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </p>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full px-4 flex items-center justify-center gap-4">
                    {/* 4. Usa 'isAlarming' per mostrare i pulsanti corretti */}
                    {isAlarming ? (
                        // --- VISTA ALLARME ---
                        <>
                            <Button
                                onClick={stopAlarm} // Pulsante secondario per chiudere
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-3"
                                aria-label="Chiudi timer"
                            >
                                Salta
                            </Button>
                            <Button
                                onClick={stopAlarm} // 5. Il pulsante principale ora chiama 'stopAlarm'
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-4 flex items-center font-bold text-lg scale-110 shadow-lg"
                                aria-label="Tacita allarme e chiudi"
                            >
                                <BellOff size={24} className="mr-2" /> TACITA
                            </Button>
                        </>
                    ) : (
                        // --- VISTA TIMER ATTIVO ---
                        <>
                            <Button
                                onClick={() => addTime(15)}
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-4 flex items-center"
                                aria-label="Aggiungi 15 secondi"
                            >
                                <Plus size={20} className="mr-1"/> 15s
                            </Button>
                            <Button
                                onClick={stopTimer} 
                                className={`px-8 py-4 text-white font-semibold rounded-full ${activeTheme.bgClass} hover:opacity-90 scale-110`}
                                aria-label="Salta riposo"
                            >
                                Salta
                            </Button>
                            {/* Il pulsante Mute è stato rimosso per semplificare e non entrare in conflitto
                                con la logica del suono gestita ora interamente dal contesto.
                                Può essere re-implementato in futuro modificando il contesto. */}
                        </>
                    )}
                </div>
            </div>
        </Transition>
    );
};