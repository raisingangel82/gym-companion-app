import React, { useState, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button'; // Importa il componente Button

type TimerPosition = { top: number; left: number; width: number; height: number; };

interface RestTimerModalProps {
    position: TimerPosition | null;
    duration: number;
    onClose: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({ position, duration, onClose }) => {
    const { activeTheme } = useTheme();
    const [timeLeft, setTimeLeft] = useState(duration);
    const [lastPosition, setLastPosition] = useState<TimerPosition | null>(position);

    useEffect(() => {
        if (position) {
            setLastPosition(position);
        }
    }, [position]);

    useEffect(() => {
        if (!position) {
            setTimeLeft(duration);
            return;
        }
        if (timeLeft <= 0) {
            onClose();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [position, timeLeft, duration, onClose]);
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = (timeLeft / duration) * 100;

    return (
        <Transition
            as={Fragment}
            show={!!position}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div
                className="fixed z-40 flex flex-col items-center justify-center text-white p-4 rounded-lg overflow-hidden"
                style={{
                    top: lastPosition?.top,
                    left: lastPosition?.left,
                    width: lastPosition?.width,
                    height: lastPosition?.height,
                }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div 
                    className={`absolute bottom-0 left-0 h-1 ${activeTheme.bgClass} opacity-70`}
                    style={{ width: `${progress}%` }}
                ></div>
                <div className="relative z-10 text-center">
                    <p className="text-lg text-gray-300 mb-2">Riposo</p>
                    <p className="text-6xl md:text-8xl font-mono font-bold tracking-tighter">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </p>
                </div>
                {/* BOTTONE CORRETTO */}
                <Button
                    onClick={onClose} 
                    className={`relative z-10 mt-8 px-8 py-3 text-white font-semibold ${activeTheme.bgClass} hover:opacity-90`}
                >
                    Salta
                </Button>
            </div>
        </Transition>
    );
};