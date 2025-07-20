// src/pages/ManagePage.tsx
import React, { useState, useRef } from 'react';
import { Edit, Trash2, CheckCircle, Sparkles, Upload, Palette, Moon, Sun, Info, User } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { themeColorPalettes } from '../data/colorPalette';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WorkoutEditorModal } from '../components/WorkoutEditorModal';
import { ProModal } from '../components/ProModal';
import type { Workout, WorkoutData } from '../types';

export const ManagePage: React.FC = () => {
  const { workouts, isLoading, addWorkout, deleteWorkout, updateWorkout, activeWorkout, setActiveWorkout } = useWorkouts();
  const { theme, toggleTheme, activeColor, setActiveColor, activeShade, setActiveShade, activeTheme } = useTheme();
  const { restTime, setRestTime } = useSettings();
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proFeatureName, setProFeatureName] = useState('');

  const openProModal = (feature: string) => {
    setProFeatureName(feature);
    setProModalOpen(true);
  };

  const handleOpenModal = (workout: Workout | null = null) => { 
    setEditingWorkout(workout); 
    setModalOpen(true); 
  };

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
        if (typeof text !== 'string') {
            throw new Error("Impossibile leggere il file.");
        }
        const data = JSON.parse(text);
        
        const isValidWorkout = (item: any): item is Omit<WorkoutData, 'createdAt' | 'history'> => 
            item && typeof item.name === 'string' && Array.isArray(item.exercises);

        let workoutsToImport: Omit<WorkoutData, 'createdAt' | 'history'>[] = [];

        if (Array.isArray(data)) {
            workoutsToImport = data.filter(isValidWorkout);
        } else if (isValidWorkout(data)) {
            workoutsToImport.push(data);
        }

        if (workoutsToImport.length > 0) {
          await Promise.all(
            workoutsToImport.map(workout => 
              addWorkout({ ...workout, createdAt: new Date(), history: [] })
            )
          );
          alert(`${workoutsToImport.length} scheda/e importata/e con successo!`);
        } else {
          throw new Error("Il file JSON non contiene schede valide.");
        }

      } catch (error: any) {
        console.error("Errore durante l'importazione:", error);
        alert(`Impossibile importare il file: ${error.message}`);
      }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = ''; 
  };

  const jsonExample = `{
  "name": "Giorno A - Spinta",
  "exercises": [
    { "name": "Panca Piana", "sets": 4, "reps": "8-10", "weight": "80kg" }
  ]
}`;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User /> Account</h2>
        <div className="flex items-center justify-between">
            <p>Stato: <span className="font-bold">Piano Free</span></p>
            <Button onClick={() => openProModal('tutte le funzionalità')} className={`text-white ${activeTheme.bgClass}`}>
                <Sparkles size={16} /> Upgrade a Pro
            </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Palette /> Personalizza Tema</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-medium">Modalità</label>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">Colore</label>
            <div className="flex gap-2 flex-wrap justify-end">
              {themeColorPalettes.map(palette => (
                <button
                  key={palette.base}
                  onClick={() => setActiveColor(palette.base)}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${activeColor.base === palette.base ? `ring-2 ring-offset-2 ${activeTheme.ringClass} dark:ring-offset-gray-800` : ''}`}
                  style={{ backgroundColor: palette.shades['700'].hex }}
                  aria-label={`Seleziona colore ${palette.name}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium">Tonalità</label>
            <div className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
                {(['400', '700', '800'] as const).map(shade => (
                    <button
                        key={shade}
                        onClick={() => setActiveShade(shade)}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                            activeShade === shade
                                ? `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow`
                                : `text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600/50`
                        }`}
                    >
                        {shade}
                    </button>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <label htmlFor="rest-time" className="font-medium flex justify-between">
                <span>Tempo di Riposo</span>
                <span className="font-mono text-sm">{restTime}s</span>
            </label>
            <input
              id="rest-time"
              type="range"
              min="30"
              max="180"
              step="15"
              value={restTime}
              onChange={(e) => setRestTime(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </Card>
      
      <div>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Gestisci Schede</h1>
            <p className="text-gray-500 dark:text-gray-400">Crea, modifica e importa i tuoi piani.</p>
          </div>
        </header>

        <Card className="mb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Info size={18} /> Importa Scheda da File</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Puoi importare una singola scheda o un elenco di schede. Assicurati che il file <code>.json</code> abbia la seguente struttura:
            </p>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md overflow-x-auto">
                <code>{jsonExample}</code>
            </pre>
            <div className="flex gap-2 w-full mt-4">
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileImport} className="hidden" />
                <Button onClick={handleImportClick} variant="secondary" className="flex-1">
                    <Upload size={16} /> Importa File
                </Button>
                <Button onClick={() => openProModal('Generazione Scheda')} className={`flex-1 text-white ${activeTheme.bgClass}`}>
                    <Sparkles size={16} /> Crea con AI
                </Button>
            </div>
        </Card>

        {isLoading && <p className="text-center">Caricamento schede...</p>}

        {!isLoading && workouts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map(workout => (
              <Card key={workout.id} className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold">{workout.name}</h3>
                  <p className="text-sm text-gray-500">{workout.exercises.length} esercizi</p>
                </div>
                <div className="flex items-center justify-between mt-4 gap-2">
                   <Button 
                      onClick={() => setActiveWorkout(workout.id)} 
                      variant="secondary"
                      className={`flex-1 ${activeWorkout?.id === workout.id ? activeTheme.bgClass + ' text-white' : ''}`}
                    >
                     <CheckCircle size={16}/> {activeWorkout?.id === workout.id ? 'Attiva' : 'Seleziona'}
                   </Button>
                   <div className="flex">
                      <button onClick={() => openProModal(`Ottimizzazione "${workout.name}"`)} className="p-2 text-gray-500 hover:text-purple-500" title="Ottimizza con AI">
                        <Sparkles size={18} />
                      </button>
                      <button onClick={() => handleOpenModal(workout)} className="p-2 text-gray-500 hover:text-blue-500" title="Modifica">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-gray-500 hover:text-red-500" title="Elimina">
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <ProModal 
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName={proFeatureName}
      />
      
      {isModalOpen && (
        <WorkoutEditorModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)}
          onSave={handleSaveWorkout}
          workout={editingWorkout}
        />
      )}
    </div>
  );
};
