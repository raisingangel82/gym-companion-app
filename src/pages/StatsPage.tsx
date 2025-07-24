import { useMemo, useState, useEffect } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePageAction } from '../contexts/PageActionContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui/Card';
import { ProModal } from '../components/ProModal';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
//import type { Workout } from '../types';

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
  const { theme, activeTheme } = useTheme();
  
  const [proModalOpen, setProModalOpen] = useState(false);

  const exerciseStats = useMemo(() => {
    const stats: Record<string, ChartDataPoint[]> = {};
    workouts.forEach(workout => {
      if (!workout.history || !Array.isArray(workout.history)) return;
      workout.history.forEach(session => {
        if (!session || !session.date || !Array.isArray(session.exercises)) return;
        session.exercises.forEach(exercise => {
          if (!exercise.performance || exercise.performance.length === 0) return;
          const totalVolume = exercise.performance.reduce((sum, set) => {
            const reps = Number(set.reps);
            const weight = Number(set.weight);
            if (isNaN(reps) || isNaN(weight)) return sum;
            return sum + (reps * weight);
          }, 0);
          if (totalVolume > 0) {
            if (!stats[exercise.name]) stats[exercise.name] = [];
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
  
  useEffect(() => {
    if (availableExercises.length > 0) {
      registerAction(() => setProModalOpen(true));
    } else {
      registerAction(null);
    }
    return () => registerAction(null);
  }, [availableExercises.length, registerAction]);

  const selectedExerciseData = exerciseStats[selectedExercise] || [];
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';

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
              {availableExercises.map(name => ( <option key={name} value={name}>{name}</option>))}
            </select>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedExerciseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTheme.hex} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={activeTheme.hex} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: axisColor, strokeOpacity: 0.5 }} tickLine={{ stroke: axisColor, strokeOpacity: 0.5 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: axisColor, strokeOpacity: 0.5 }} tickLine={{ stroke: axisColor, strokeOpacity: 0.5 }} label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: axisColor }} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB', borderRadius: '0.5rem' }} labelFormatter={formatDate} />
                <Legend wrapperStyle={{ color: axisColor }} />
                <Area type="monotone" dataKey="volume" name="Volume (kg)" stroke={activeTheme.hex} strokeWidth={2} fill="url(#themeGradient)" dot={{ r: 4, fill: activeTheme.hex }} activeDot={{ r: 8, stroke: activeTheme.hex, fill: theme === 'dark' ? '#1F2937' : '#FFFFFF' }} />
              </AreaChart>
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