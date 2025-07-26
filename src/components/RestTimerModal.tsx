import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';
import { useTimer } from '../contexts/TimerContext';
import { Button } from './ui/Button';
import { Volume2, VolumeX, Plus, BellOff } from 'lucide-react';

// Suono di allarme codificato in Base64 per non dover gestire file esterni
const ALARM_SOUND_DATA_URL = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAATEfAAAEAwAhwAqJFWIWEEE3iBAm9QkIdQy4g1g1cxRzE7eQy4sBSo0b5K1YqCFyp9aAHwslM1dFCSqV/AMs1A1e+b86mhZpE0VNjX49xWX/+lA0PPp2G20Ivv/8/4g5bvwAD1ABQ7jAaD2Y5kE8RkMppNOp1Pp9RrMh5s4pkaRpJR9M5VLLZfNa9Hp9Xl851ms1mu9Z2uv2+12+4GA3+/5/A6Pj8fn8/v9/wBcQEHBCEhCwcHISEpCwsnIyEpKSspLTMvMTc5Ozs/QUNFSEtNTc5PUVNWVVdZW1t7g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+sgAADgMBAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wCECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wP/7QMQBAAACAADYf/z/C/8A/3//9//2/+oADAEABIAAERIRFRwGAAz/8AADAQADAAACAAADCgCAgEBAgECAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC-";

export const RestTimerModal: React.FC = () => {
    const { activeTheme } = useTheme();
    const { isTimerActive, timeLeft, initialDuration, stopTimer, addTime } = useTimer();
    const [isMuted, setIsMuted] = useState(false);
    const [isAlarmRinging, setIsAlarmRinging] = useState(false);
    
    // MODIFICA: Aggiunto un riferimento all'elemento audio
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (timeLeft <= 0 && isTimerActive) {
            setIsAlarmRinging(true);
        }
        if (!isTimerActive) {
            setIsAlarmRinging(false);
        }
    }, [timeLeft, isTimerActive]);

    useEffect(() => {
        const alarmAudio = audioRef.current;
        if (!alarmAudio) return;

        let alarmInterval: NodeJS.Timeout | null = null;
        if (isAlarmRinging && !isMuted) {
            alarmAudio.currentTime = 0;
            alarmAudio.play().catch(e => console.error("Errore riproduzione audio:", e));
            alarmInterval = setInterval(() => {
                alarmAudio.currentTime = 0;
                alarmAudio.play().catch(e => console.error("Errore riproduzione audio:", e));
            }, 1200);
        } else {
            alarmAudio.pause();
        }
        
        return () => {
            if (alarmInterval) {
                clearInterval(alarmInterval);
            }
        };
    }, [isAlarmRinging, isMuted]);

    const handleSilenceAlarm = () => {
        setIsAlarmRinging(false);
        stopTimer();
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

    return (
        <Transition
            as={Fragment}
            show={isTimerActive}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-x-0 top-20 bottom-24 z-50 flex flex-col items-center justify-center text-white p-4 bg-black/80 backdrop-blur-md">
                {/* MODIFICA: Aggiunto l'elemento audio nascosto */}
                <audio ref={audioRef} src={ALARM_SOUND_DATA_URL} loop={false} muted={isMuted} />
                
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div 
                        className={`h-full ${activeTheme.bgClass}`}
                        style={{ width: `${progress}%`, transition: 'width 1s linear' }}
                    ></div>
                </div>

                <div className="text-center">
                    <p className="text-2xl text-gray-300 mb-2">{isAlarmRinging ? "Fine Riposo!" : "Riposo"}</p>
                    <p className="text-8xl md:text-9xl font-mono font-bold tracking-tighter">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </p>
                </div>
                
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full px-4 flex items-center justify-center gap-4">
                    {isAlarmRinging ? (
                        <>
                            <Button onClick={stopTimer} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-3" aria-label="Salta e chiudi timer">
                                Salta
                            </Button>
                            <Button onClick={handleSilenceAlarm} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-4 flex items-center font-bold text-lg scale-110 shadow-lg" aria-label="Tacita allarme e chiudi">
                                <BellOff size={24} className="mr-2" /> TACITA
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => addTime(15)} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-full p-4 flex items-center" aria-label="Aggiungi 15 secondi">
                                <Plus size={20} className="mr-1"/> 15s
                            </Button>
                            <Button onClick={stopTimer} className={`px-8 py-4 text-white font-semibold rounded-full ${activeTheme.bgClass} hover:opacity-90 scale-110`} aria-label="Salta riposo">
                                Salta
                            </Button>
                            <Button onClick={() => setIsMuted(!isMuted)} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-full p-4" aria-label={isMuted ? "Riattiva suono" : "Disattiva suono"}>
                                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Transition>
    );
};