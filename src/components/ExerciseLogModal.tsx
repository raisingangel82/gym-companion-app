// src/components/ExerciseLogModal.tsx
import React, { useState, useEffect } from 'react';
import type { Exercise, SetPerformance } from '../types';
import { Plus, Minus } from 'lucide-react';

interface ExerciseLogModalProps { isOpen: boolean; onClose: () => void; onSave: (performance: SetPerformance) => void; exercise: Exercise; setIndex: number; }
const NumberStepper: React.FC<{ value: number; onChange: (v: number) => void; step: number }> = ({ value, onChange, step }) => (
    <div className="flex items-center justify-center gap-4">
        <button onClick={() => onChange(value - step)} className="h-14 w-14 flex items-center justify-center bg-gray-700 rounded-full text-white"><Minus size={28} /></button>
        <span className="text-4xl font-bold w-24 text-center">{value}</span>
        <button onClick={() => onChange(value + step)} className="h-14 w-14 flex items-center justify-center bg-gray-700 rounded-full text-white"><Plus size={28} /></button>
    </div>
);

export const ExerciseLogModal: React.FC<ExerciseLogModalProps> = ({ isOpen, onClose, onSave, exercise, setIndex }) => {
    const perf = exercise.performance?.[setIndex];
    const [reps, setReps] = useState(0);
    const [weight, setWeight] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            const initialReps = perf?.reps ?? parseInt(exercise.reps);
            const initialWeight = perf?.weight ? parseFloat(perf.weight) : parseFloat(exercise.weight);
            setReps(isNaN(initialReps) ? 0 : initialReps);
            setWeight(isNaN(initialWeight) ? 0 : initialWeight);
            setNotes(perf?.notes || '');
        }
    }, [isOpen, exercise, setIndex, perf]);
    
    if (!isOpen) return null;

    return (
        // FIX: Il contenitore principale si ferma a 96px (bottom-24) dal fondo.
        // Lo sfondo sfocato e il contenuto sono confinati in quest'area sicura.
        <div className="fixed inset-x-0 top-0 bottom-24 z-50 flex flex-col justify-end">
            <div onClick={onClose} className="absolute inset-0 bg-black bg-opacity-70"></div>
            <div className="relative z-10 bg-gray-800 text-white rounded-t-2xl p-4 mx-2">
                <h3 className="text-xl font-bold text-center mb-1">{exercise.name}</h3>
                <p className="text-gray-400 text-center mb-6">Registra Set {setIndex + 1}</p>
                <div className="space-y-6">
                    <div><label className="block text-center text-lg mb-2">Ripetizioni</label><NumberStepper value={reps} onChange={setReps} step={1} /></div>
                    <div><label className="block text-center text-lg mb-2">Peso (kg)</label><NumberStepper value={weight} onChange={setWeight} step={2.5} /></div>
                    <div><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Aggiungi una nota..." className="w-full bg-gray-700 rounded-lg p-3" rows={2} /></div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-4 bg-gray-600 rounded-lg font-bold">Annulla</button>
                    <button onClick={() => onSave({ reps, weight: weight.toString(), notes })} className="py-4 bg-green-600 rounded-lg font-bold">Salva</button>
                </div>
            </div>
        </div>
    );
};