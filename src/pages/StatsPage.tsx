import React, { useMemo, useState, useEffect } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePageAction } from '../contexts/PageActionContext';
import { Card } from '../components/ui/Card';
import { ProModal } from '../components/ProModal';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Workout, Exercise, SetPerformance } from '../types';

interface ChartDataPoint {
  date: string;
  volume: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
};

export const StatsPage: React.FC = () => {
  const { workouts } = useWorkouts();
  const { registerAction } = usePageAction();
  
  const [proModalOpen, setProModalOpen] = useState(false);

  const exerciseStats = useMemo(() => {
    const stats: Record<string, ChartDataPoint[]> = {};
    workouts.forEach(workout => {
      workout.history?.forEach(session => {
        if (!session.date || !session.exercises) return;
        session.exercises.forEach(exercise => {
          if (!exercise.performance || exercise.performance.length === 0) return;
          const totalVolume = exercise.performance.reduce((sum, set) => sum + (set.reps * set.weight), 0);
          if (totalVolume > 0) {
            if (!stats[exercise.name]) {
              stats[exercise.name] = [];
            }
            stats[exercise.name].push({ date: new Date(session.date).toISOString(), volume: totalVolume });
          }
        });
      });
    });
    Object.values(stats).forEach(dataPoints => {
      dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return stats;
  }, [workouts]);

  const availableExercises = Object.keys(exerciseStats);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    if (availableExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);
  
  // Registra l'azione per il pulsante centrale
  useEffect(() => {
    // Attiva il pulsante solo se ci sono esercizi da analizzare
    if (availableExercises.length > 0) {
      registerAction(() => setProModalOpen(true));
    } else {
      registerAction(null); // Altrimenti lo disabilita
    }
    return () => registerAction(null); // Pulisce l'azione quando si lascia la pagina
  }, [availableExercises.length, registerAction]);

  const selectedExerciseData = exerciseStats[selectedExercise] || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <div className="flex items-center gap-2">
          <BarChart3 />
          <h2 className="text-2xl font-bold">Statistiche</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analizza i tuoi progressi nel tempo.
        </p>
      </Card>

      {availableExercises.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <Info size={48} className="text-primary" />
          <h2 className="text-xl font-bold">Nessun Dato Disponibile</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Completa e salva almeno un allenamento per tracciare le tue statistiche qui.
          </p>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp /> Volume di Allenamento</h3>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
            >
              {availableExercises.map(name => ( <option key={name} value={name}>{name}</option> ))}
            </select>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedExerciseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} labelFormatter={formatDate} />
                <Legend />
                <Line type="monotone" dataKey="volume" name="Volume (kg)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      <ProModal 
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName="Report e Analisi AI"
      />
    </div>
  );
};