// src/components/RestTimerModal.tsx
import React, { useState, useEffect } from 'react';

interface RestTimerModalProps {
    isOpen: boolean;
    duration: number;
    onClose: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({ isOpen, duration, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(duration);
            return;
        }
        if (timeLeft <= 0) {
            onClose();
            return;
        }
        const intervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [isOpen, timeLeft, duration, onClose]);

    if (!isOpen) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        // FIX: Il contenitore ora ha `bottom-24` (96px), quindi si ferma SOPRA la BottomBar.
        // Il blur non coprirà mai più il pulsante centrale.
        <div className="fixed inset-x-0 top-0 bottom-24 bg-black bg-opacity-50 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-4">
            <div className="text-center">
                <p className="text-lg text-gray-300 mb-2">Riposo</p>
                <p className="text-8xl font-mono font-bold tracking-tighter">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </p>
            </div>
            
            <button 
                onClick={onClose} 
                className="mt-8 px-12 py-4 bg-red-600/80 rounded-lg text-lg font-bold"
            >
                Salta
            </button>
        </div>
    );
};