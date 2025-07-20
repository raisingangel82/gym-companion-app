import React, { useState } from 'react';
import { translations } from '../data/exerciseTranslations';
import { searchExercisesByName, getMainImageForExercise } from '../services/wgerApiService';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ExerciseFinderProps {
  exerciseName: string;
  onImageSelected: (imageUrl: string) => void;
  onClose: () => void;
}

export const ExerciseFinder: React.FC<ExerciseFinderProps> = ({ exerciseName, onImageSelected, onClose }) => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    setResults([]);

    const englishTerm = translations[exerciseName.toLowerCase()] || exerciseName.toLowerCase();
    
    const searchResults = await searchExercisesByName(englishTerm);
    if (searchResults.length === 0) {
      setError('Nessun risultato trovato. Prova con un nome più generico in inglese.');
    }
    
    setResults(searchResults);
    setIsLoading(false);
  };

  const handleSelectExercise = async (exercise: any) => {
     setIsLoading(true);
     setError('');
     
     const imageUrl = await getMainImageForExercise(exercise.data.id);
     
     if (imageUrl) {
        onImageSelected(imageUrl);
     } else {
        setError("Immagine principale non trovata per questo esercizio.");
     }
     setIsLoading(false);
  };

  return (
    <div className="p-4 my-2 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold">Cerca Immagine per:</h4>
          <p className="text-sm italic">"{exerciseName}"</p>
        </div>
        <Button onClick={onClose} variant="secondary" size="sm">Chiudi</Button>
      </div>
      
      <Button onClick={handleSearch} disabled={isLoading} className="w-full">
        {isLoading ? 'Cerco...' : `Cerca traduzione: "${translations[exerciseName.toLowerCase()] || exerciseName.toLowerCase()}"`}
      </Button>

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      {results.length > 0 && (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {results.map((result) => (
            <li 
              key={result.data.id} 
              onClick={() => handleSelectExercise(result)}
              className="p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {result.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};