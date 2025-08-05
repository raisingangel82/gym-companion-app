import { useMemo, useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePageAction } from '../contexts/PageActionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { ReportModal, type ReportData } from '../components/ReportModal';
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

interface ChartDataPoint {
  date: string;
  value: number; // Rinominato da 'volume' a 'value' per generalizzare
}

// NUOVA FUNZIONE: Mappa un esercizio al suo gruppo muscolare principale.
// Questa è una mappatura di base, puoi espanderla con più esercizi.
const getMuscleGroupForExercise = (exerciseName: string): string => {
  const normalizedName = exerciseName.toLowerCase().trim();
  
  // Mappatura (Nome Esercizio -> Gruppo Muscolare)
  const map: Record<string, string> = {
    'panca piana': 'Petto',
    'bench press': 'Petto',
    'chest press': 'Petto',
    'croci': 'Petto',
    'push up': 'Petto',
    'trazioni': 'Dorsali',
    'lat machine': 'Dorsali',
    'rematore': 'Dorsali',
    'pull down': 'Dorsali',
    'pulley': 'Dorsali',
    'squat': 'Gambe',
    'leg press': 'Gambe',
    'affondi': 'Gambe',
    'leg extension': 'Gambe',
    'leg curl': 'Gambe',
    'stacco': 'Gambe',
    'deadlift': 'Gambe',
    'shoulder press': 'Spalle',
    'military press': 'Spalle',
    'lento avanti': 'Spalle',
    'alzate laterali': 'Spalle',
    'french press': 'Tricipiti',
    'push down': 'Tricipiti',
    'curl': 'Bicipiti',
    'crunch': 'Addome',
    'plank': 'Addome',
  };

  for (const key in map) {
    if (normalizedName.includes(key)) {
      return map[key];
    }
  }
  
  return 'Altro'; // Gruppo di fallback per esercizi non mappati
};


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
};

export const StatsPage: React.FC = () => {
  const { workouts } = useWorkouts();
  const { registerAction } = usePageAction();
  const { theme, activeTheme } = useTheme();
  const { user } = useAuth();
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // MODIFICA PRINCIPALE: Tutta la logica di calcolo è stata riscritta.
  const aggregatedStats = useMemo(() => {
    // La struttura ora sarà: { 'Petto': [...], 'Gambe': [...], 'Cardio': [...] }
    const stats: Record<string, Record<string, number>> = {};

    workouts.forEach(workout => {
      if (!workout.history || !Array.isArray(workout.history)) return;

      workout.history.forEach(session => {
        if (!session?.exercises) return;

        session.exercises.forEach(exercise => {
          if (!exercise.performance || exercise.performance.length === 0) return;

          const sessionDate = new Date(session.date).toISOString().split('T')[0]; // Raggruppa per giorno

          if (exercise.type === 'cardio') {
            const totalDuration = exercise.performance.reduce((sum, set) => sum + (set.duration || 0), 0);
            if (totalDuration > 0) {
              if (!stats['Cardio']) stats['Cardio'] = {};
              stats['Cardio'][sessionDate] = (stats['Cardio'][sessionDate] || 0) + totalDuration;
            }
          } else { // Esercizio di forza (strength)
            const muscleGroup = getMuscleGroupForExercise(exercise.name);
            const totalSets = exercise.performance.length; // Il volume è il numero di serie allenanti
            
            if (totalSets > 0) {
                if (!stats[muscleGroup]) stats[muscleGroup] = {};
                stats[muscleGroup][sessionDate] = (stats[muscleGroup][sessionDate] || 0) + totalSets;
            }
          }
        });
      });
    });

    // Trasformiamo i dati aggregati nel formato richiesto dal grafico
    const chartData: Record<string, ChartDataPoint[]> = {};
    for (const group in stats) {
        chartData[group] = Object.entries(stats[group]).map(([date, value]) => ({
            date,
            value,
        }));
        // Ordiniamo i dati per data
        chartData[group].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return chartData;
  }, [workouts]);

  const availableGroups = Object.keys(aggregatedStats);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  useEffect(() => {
    if (availableGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(availableGroups[0]);
    }
  }, [availableGroups, selectedGroup]);
  
  const handleGenerateReport = async () => {
    // La logica per generare il report AI può rimanere la stessa o essere adattata
    // per ora la lasciamo invariata, ma potrebbe essere un prossimo step di miglioramento.
    if (!user || isGeneratingReport || !selectedGroup) return;

    const relevantWorkout = workouts.find(w => w.history && w.history.length > 0);
    if (!relevantWorkout) {
        alert("Nessun allenamento con una cronologia per generare un report.");
        return;
    }

    setIsGeneratingReport(true);
    setReportData(null);
    setIsReportModalOpen(true);

    try {
        const functions = getFunctions(getApp(), 'europe-west1');
        const generatePerformanceReport = httpsCallable(functions, 'generatePerformanceReport');
        
        const userProfile = { goal: user.goal, injuries: user.injuries };
        
        const result = await generatePerformanceReport({ 
            userProfile, 
            workoutHistory: relevantWorkout.history,
            workoutName: relevantWorkout.name 
        });

        setReportData(result.data as ReportData);

    } catch (error) {
        console.error("Errore durante la generazione del report:", error);
        alert("Si è verificato un errore durante la generazione del report.");
        setIsReportModalOpen(false);
    } finally {
        setIsGeneratingReport(false);
    }
  };
  
  useEffect(() => {
    if (availableGroups.length > 0 && user?.plan === 'Pro') {
      registerAction(handleGenerateReport);
    } else {
      registerAction(null);
    }
    return () => registerAction(null);
  }, [availableGroups.length, user, selectedGroup, workouts]);

  const selectedGroupData = aggregatedStats[selectedGroup] || [];
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
  
  // Logica per etichette dinamiche
  const yAxisLabel = selectedGroup === 'Cardio' ? 'Durata (min)' : 'Serie Allenanti';
  const legendLabel = selectedGroup === 'Cardio' ? 'Durata' : 'Serie';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <div className="flex items-center gap-2">
          <BarChart3 />
          <h2 className="text-2xl font-bold">Statistiche</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analizza i tuoi progressi nel tempo per gruppo muscolare.
        </p>
      </Card>

      {availableGroups.length === 0 ? (
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
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
            >
              {availableGroups.map(name => ( <option key={name} value={name}>{name}</option>))}
            </select>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedGroupData} margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTheme.hex} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={activeTheme.hex} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: axisColor, strokeOpacity: 0.5 }} tickLine={{ stroke: axisColor, strokeOpacity: 0.5 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: axisColor, strokeOpacity: 0.5 }} tickLine={{ stroke: axisColor, strokeOpacity: 0.5 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: axisColor, style: { textAnchor: 'middle' } }} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB', borderRadius: '0.5rem' }} labelFormatter={formatDate} />
                <Legend wrapperStyle={{ color: axisColor }} />
                <Area type="monotone" dataKey="value" name={legendLabel} stroke={activeTheme.hex} strokeWidth={2} fill="url(#themeGradient)" dot={{ r: 4, fill: activeTheme.hex }} activeDot={{ r: 8, stroke: activeTheme.hex, fill: theme === 'dark' ? '#1F2937' : '#FFFFFF' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={reportData}
        isLoading={isGeneratingReport}
      />
    </div>
  );
};