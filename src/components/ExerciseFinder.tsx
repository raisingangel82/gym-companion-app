import React, { useState } from 'react';
import { translations } from '../data/exerciseTranslations';
import { searchExercisesByName } from '../services/wgerApiService';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme

// L'URL di base per le immagini lo mettiamo qui
const WGER_IMAGE_BASE_URL = "https://wger.de";

// MODIFICA 1: Aggiorna le props per accettare activeTheme
interface ExerciseFinderProps {
  exerciseName: string;
  onImageSelected: (imageUrl: string) => void;
  onClose: () => void;
  activeTheme: ReturnType<typeof useTheme>['activeTheme'];
}

export const ExerciseFinder: React.FC<ExerciseFinderProps> = ({ 
  exerciseName, 
  onImageSelected, 
  onClose,
  activeTheme // Ricevi la prop
}) => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    const englishTerm = translations[exerciseName.toLowerCase()] || exerciseName.toLowerCase();
    const searchResults = await searchExercisesByName(englishTerm);
    setResults(searchResults);
    setIsLoading(false);
  };

  const handleSelectExercise = (result: any) => {
    if (result.data && result.data.image) {
      const fullImageUrl = `${WGER_IMAGE_BASE_URL}${result.data.image}`;
      onImageSelected(fullImageUrl);
    } else {
      console.log("Questo risultato non ha un'immagine associata:", result);
      setError("Risultato selezionato non ha un'immagine.");
    }
  };

  return (
    <div className="p-4 my-2 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
      <div className="flex justify-between items-start">
        {/* MODIFICA 2: Stile del titolo per il tema scuro */}
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Cerca Immagine per: "{exerciseName}"</h4>
        <Button onClick={onClose} variant="secondary" size="sm">Chiudi</Button>
      </div>
      {/* MODIFICA 3: Stile del bottone allineato al tema */}
      <Button onClick={handleSearch} disabled={isLoading} className={`w-full text-white hover:opacity-90 ${activeTheme.bgClass}`}>
        Cerca
      </Button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      {results.length > 0 && (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {results.map((result, index) => (
            <li key={`${result.data.id}-${index}`} onClick={() => handleSelectExercise(result)} className="p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              {result.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};