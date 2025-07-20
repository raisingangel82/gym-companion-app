// src/pages/StatsPage.tsx

import React from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { Card } from '../components/ui/Card';
import { Calendar, CheckSquare } from 'lucide-react';

export const StatsPage: React.FC = () => {
  const { workouts, isLoading } = useWorkouts();

  // Questa logica complessa fa una cosa semplice:
  // 1. Prende tutte le schede (workouts).
  // 2. Per ogni scheda, prende la sua cronologia (w.history).
  // 3. Appiattisce tutte le cronologie in un unico grande array.
  // 4. Aggiunge il nome della scheda a ogni voce della cronologia.
  // 5. Ordina l'array per data, dal più recente al più vecchio.
  const workoutHistory = workouts
    .flatMap(w => w.history?.map(h => ({ ...h, workoutName: w.name })) || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return <p className="p-4 text-center">Caricamento statistiche...</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Statistiche</h1>
        <p className="text-gray-500 dark:text-gray-400">La cronologia dei tuoi allenamenti completati.</p>
      </header>
      
      {workoutHistory.length === 0 ? (
        <Card className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400" />
            <h3 className="text-xl font-semibold mt-4">Nessun Allenamento Completato</h3>
            <p className="text-gray-500 mt-2">Completa un allenamento per vederlo registrato qui.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {workoutHistory.map((entry, index) => (
            <Card key={index} className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold">{entry.workoutName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {/* Formatta la data per renderla più leggibile */}
                  {new Date(entry.date).toLocaleDateString('it-IT', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
