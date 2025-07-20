import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BaseModal } from './ui/BaseModal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ExerciseFinder } from './ExerciseFinder'; // <-- IMPORTA IL NUOVO COMPONENTE
import { Plus, Save, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import type { Workout, Exercise } from '../types';

interface WorkoutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  workout: Workout | null;
}

// Assicurati che il tipo Exercise qui includa imageUrl
const emptyExercise: Exercise = { name: '', sets: 3, reps: '10', weight: 'auto', imageUrl: '' };

export const WorkoutEditorModal: React.FC<WorkoutEditorModalProps> = ({ isOpen, onClose, onSave, workout }) => {
  const { activeTheme } = useTheme();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise]);
  const [draggedItem, setDraggedItem] = useState<Exercise | null>(null);
  const [findingImageForIndex, setFindingImageForIndex] = useState<number | null>(null); // <-- NUOVO STATE

  useEffect(() => {
    if (isOpen) {
      if (workout) {
        setName(workout.name);
        setExercises(workout.exercises.length > 0 ? workout.exercises.map(ex => ({...emptyExercise, ...ex})) : [emptyExercise]);
      } else {
        setName('');
        setExercises([emptyExercise]);
      }
      setFindingImageForIndex(null); // Resetta alla riapertura
    }
  }, [isOpen, workout]);

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const updatedExercises = [...exercises];
    const currentExercise = { ...updatedExercises[index] };
    (currentExercise[field] as any) = value;
    updatedExercises[index] = currentExercise;
    setExercises(updatedExercises);
  };

  // <-- NUOVA FUNZIONE per gestire l'immagine selezionata
  const handleImageSelected = (index: number, imageUrl: string) => {
    handleExerciseChange(index, 'imageUrl', imageUrl);
    setFindingImageForIndex(null); // Chiude il finder
  };

  const addExercise = () => setExercises([...exercises, { ...emptyExercise }]);
  const removeExercise = (index: number) => {
    if (exercises.length <= 1) return;
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (name.trim() === '') {
      alert('Il nome della scheda non può essere vuoto.');
      return;
    }
    const validExercises = exercises.filter(ex => ex.name.trim() !== '');
    onSave({ name: name.trim(), exercises: validExercises });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => setDraggedItem(exercises[index]);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === exercises[index]) return;
    let items = exercises.filter(item => item !== draggedItem);
    items.splice(index, 0, draggedItem!);
    setExercises(items);
  };
  const handleDragEnd = () => setDraggedItem(null);

  const footerContent = (
    <div className="flex w-full justify-end">
      <Button onClick={handleSave} className={`text-white ${activeTheme.bgClass}`}><Save size={16} /> Salva Scheda</Button>
    </div>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={workout ? `Modifica: ${workout.name}` : 'Crea Nuova Scheda'} footer={footerContent}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Scheda</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Es. Giorno A - Spinta" />
        </div>
        <div className="space-y-2">
          {exercises.map((ex, index) => (
            <div key={index}>
              <div 
                className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
                draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd}
              >
                <GripVertical className="cursor-move text-gray-400" />
                {ex.imageUrl && <img src={ex.imageUrl} alt="preview" className="w-10 h-10 rounded object-cover"/>}
                <Input type="text" value={ex.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} placeholder="Nome" className="flex-grow" />
                <Input type="number" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)} className="w-14 text-center" />
                <Input type="text" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} placeholder="8-10" className="w-16 text-center" />
                
                {/* BOTTONE PER CERCARE IMMAGINE */}
                <Button variant="secondary" onClick={() => setFindingImageForIndex(findingImageForIndex === index ? null : index)}>
                    <ImageIcon size={16} />
                </Button>
                <Button variant="secondary" onClick={() => removeExercise(index)} disabled={exercises.length <= 1}><Trash2 size={16} /></Button>
              </div>

              {/* RENDER CONDIZIONALE DEL FINDER */}
              {findingImageForIndex === index && (
                <ExerciseFinder 
                  exerciseName={ex.name}
                  onImageSelected={(imageUrl) => handleImageSelected(index, imageUrl)}
                  onClose={() => setFindingImageForIndex(null)}
                />
              )}
            </div>
          ))}
          <Button onClick={addExercise} variant="secondary" className="w-full"><Plus size={16} /> Aggiungi Esercizio</Button>
        </div>
      </div>
    </BaseModal>
  );
};