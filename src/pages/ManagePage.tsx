import { useState, useRef, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Edit, Trash2, CheckCircle, Sparkles, Upload, Palette, Moon, Sun, Info, User, Timer } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { usePageAction } from '../contexts/PageActionContext';
import { useAuth } from '../contexts/AuthContext';
import { themeColorPalettes } from '../data/colorPalette';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WorkoutEditorModal } from '../components/WorkoutEditorModal';
import { ProModal } from '../components/ProModal';
import { Switch } from '@headlessui/react';
import type { Workout, WorkoutData } from '../types';

export const ManagePage: React.FC = () => {
  const { workouts, isLoading, addWorkout, deleteWorkout, updateWorkout, activeWorkout, setActiveWorkout } = useWorkouts();
  const { theme, toggleTheme, activeColor, setActiveColor, activeShade, setActiveShade, activeTheme } = useTheme();
  const { restTime, setRestTime, autoRestTimer, setAutoRestTimer } = useSettings();
  const { registerAction } = usePageAction();
  const { user } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proFeatureName, setProFeatureName] = useState('');

  const handleOpenModal = (workout: Workout | null = null) => {
    setEditingWorkout(workout);
    setModalOpen(true);
  };
  
  useEffect(() => {
    const createAction = () => handleOpenModal(null);
    registerAction(createAction);
    return () => registerAction(null);
  }, [registerAction]);

  const handleSaveWorkout = async (data: WorkoutData) => {
    try {
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, data);
      } else {
        await addWorkout({ ...data, createdAt: new Date(), history: [] });
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Errore nel salvataggio della scheda:", error);
      alert("Si è verificato un errore.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Impossibile leggere il file.");
        const data = JSON.parse(text);
        const processWorkoutData = (item: any): Omit<WorkoutData, 'createdAt' | 'history'> | null => {
            if (item && typeof item.name === 'string' && Array.isArray(item.exercises)) {
                const processedExercises = item.exercises.map((ex: any) => ({ ...ex, weight: parseFloat(String(ex.weight)) || 0 }));
                return { ...item, exercises: processedExercises };
            }
            return null;
        };
        let workoutsToImport: (Omit<WorkoutData, 'createdAt' | 'history'>)[] = [];
        if (Array.isArray(data)) {
            workoutsToImport = data.map(processWorkoutData).filter(Boolean) as any;
        } else {
            const singleWorkout = processWorkoutData(data);
            if (singleWorkout) workoutsToImport.push(singleWorkout);
        }
        if (workoutsToImport.length > 0) {
          await Promise.all(workoutsToImport.map(workout => addWorkout({ ...workout, createdAt: new Date(), history: [] })));
          alert(`${workoutsToImport.length} scheda/e importata/e con successo!`);
        } else {
          throw new Error("Il file JSON non contiene schede valide.");
        }
      } catch (error: any) {
        alert(`Impossibile importare il file: ${error.message}`);
      }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = '';
  };

  const jsonExample = `[ { "name": "Seduta 1", "exercises": [ ... ] } ]`;

  const handleGenerateAIClick = async () => {
    if (user && user.plan === 'Pro') {
      setIsGenerating(true);
      try {
        const functions = getFunctions();
        const generateAiWorkoutPlan = httpsCallable(functions, 'generateAiWorkoutPlan');
        
        // ## INIZIO MODIFICA ##
        // Creiamo un oggetto "pulito" con solo i dati necessari per l'AI.
        const userProfileData = {
          gender: user.gender,
          age: user.age,
          height: user.height,
          weight: user.weight,
          goal: user.goal,
          experience: user.experience,
          frequency: user.frequency,
          duration: user.duration,
          equipment: user.equipment,
          injuries: user.injuries,
        };
        
        // Inviamo solo l'oggetto pulito, non l'intero 'user'.
        const result = await generateAiWorkoutPlan(userProfileData);
        // ## FINE MODIFICA ##

        const generatedWorkouts = result.data as Omit<WorkoutData, 'createdAt' | 'history'>[];

        if (!generatedWorkouts || generatedWorkouts.length === 0) {
          throw new Error("L'AI non ha restituito schede valide.");
        }

        await Promise.all(
          generatedWorkouts.map(workout => 
            addWorkout({ ...workout, createdAt: new Date(), history: [] })
          )
        );
        alert(`Programma di allenamento di ${generatedWorkouts.length} schede creato con successo!`);
      } catch (error) {
        console.error("Errore durante la generazione della scheda AI:", error);
        alert("Si è verificato un errore durante la generazione.");
      } finally {
        setIsGenerating(false);
      }
    } else {
      setProFeatureName('Creazione Scheda con AI');
      setProModalOpen(true);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><User /> Account</h2>
            {user?.plan !== 'Pro' && (
              <Button onClick={() => { setProFeatureName('tutte le funzionalità'); setProModalOpen(true); }} className={`text-white ${activeTheme.bgClass}`}><Sparkles size={16} /> Passa a Pro</Button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Attualmente stai usando il piano {user?.plan || 'Free'}.</p>
      </Card>
      <Card>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Palette /> Impostazioni</h2>
        <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
          <div className="pt-4 first:pt-0 flex items-center justify-between">
            <label className="font-medium">Modalità</label>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{theme === 'light' ? <Moon /> : <Sun />}</button>
          </div>
          <div className="pt-4 first:pt-0 flex items-center justify-between">
            <label className="font-medium">Colore</label>
            <div className="flex gap-2 flex-wrap justify-end">
              {themeColorPalettes.map(palette => (<button key={palette.base} onClick={() => setActiveColor(palette.base)} className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${activeColor.base === palette.base ? `ring-2 ring-offset-2 ${activeTheme.ringClass} dark:ring-offset-gray-800` : ''}`} style={{ backgroundColor: palette.shades['700'].hex }} aria-label={`Seleziona colore ${palette.name}`} />))}
            </div>
          </div>
          <div className="pt-4 first:pt-0 flex items-center justify-between">
            <label className="font-medium">Tonalità</label>
            <div className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
              {(['400', '700', '800'] as const).map(shade => (<button key={shade} onClick={() => setActiveShade(shade)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeShade === shade ? `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow` : `text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600/50`}`}>{shade}</button>))}
            </div>
          </div>
          <div className="pt-4 first:pt-0 flex flex-col gap-2">
            <label htmlFor="rest-time" className="font-medium flex justify-between"><span>Tempo di Riposo</span><span className="font-mono text-sm">{restTime}s</span></label>
            <input id="rest-time" type="range" min="30" max="180" step="15" value={restTime} onChange={(e) => setRestTime(Number(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" />
          </div>
          <div className="pt-4 first:pt-0 flex items-center justify-between">
            <label htmlFor="auto-timer" className="font-medium flex items-center gap-2"><Timer size={16}/> Avvio Automatico Timer</label>
            <Switch
                id="auto-timer"
                checked={autoRestTimer}
                onChange={setAutoRestTimer}
                className={`${autoRestTimer ? activeTheme.bgClass : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
                <span className={`${autoRestTimer ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
            </Switch>
          </div>
        </div>
      </Card>
      <div>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div><h1 className="text-3xl font-bold">Le Tue Schede</h1><p className="text-gray-500 dark:text-gray-400">Seleziona una scheda da attivare, oppure creane una nuova.</p></div>
        </header>
        <Card className="mb-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Info size={18} /> Azioni Rapide</h3>
          <div className="flex gap-2 w-full mt-2">
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileImport} className="hidden" />
            <Button onClick={handleImportClick} variant="secondary" className="flex-1" disabled={isGenerating}><Upload size={16} /> Importa da File</Button>
            <Button onClick={handleGenerateAIClick} className={`flex-1 text-white ${activeTheme.bgClass}`} disabled={isGenerating}>
              <Sparkles size={16} /> {isGenerating ? 'Creazione in corso...' : 'Crea con AI'}
            </Button>
          </div>
        </Card>
        {!isLoading && workouts.map(workout => (
          <Card key={workout.id} className="flex flex-col justify-between mb-4">
            <div><h3 className="text-xl font-bold">{workout.name}</h3><p className="text-sm text-gray-500">{workout.exercises.length} esercizi</p></div>
            <div className="flex items-center justify-between mt-4 gap-2">
              <Button onClick={() => setActiveWorkout(workout.id)} variant={activeWorkout?.id === workout.id ? "default" : "secondary"} className={`flex-1 ${activeWorkout?.id === workout.id ? activeTheme.bgClass + ' text-white' : ''}`}><CheckCircle size={16}/> {activeWorkout?.id === workout.id ? 'Attiva' : 'Seleziona'}</Button>
              <div className="flex">
                <button onClick={() => { setProFeatureName(`Ottimizzazione "${workout.name}" con AI`); setProModalOpen(true); }} className="p-2 text-gray-500 hover:text-purple-500" title="Ottimizza con AI"><Sparkles size={18} /></button>
                <button onClick={() => handleOpenModal(workout)} className="p-2 text-gray-500 hover:text-blue-500" title="Modifica"><Edit size={18} /></button>
                <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-gray-500 hover:text-red-500" title="Elimina"><Trash2 size={18} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {isModalOpen && (<WorkoutEditorModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveWorkout} workout={editingWorkout}/>)}
      <ProModal isOpen={proModalOpen} onClose={() => setProModalOpen(false)} featureName={proFeatureName}/>
    </div>
  );
};