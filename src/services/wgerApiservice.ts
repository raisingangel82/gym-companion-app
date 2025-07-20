// Definiamo i tipi di dati che ci aspettiamo dall'API di wger per avere un codice più sicuro
interface WgerExerciseInfo {
  id: number;
  name: string;
  uuid: string;
}

interface WgerExerciseImage {
  id: number;
  image: string; // Questo è l'URL parziale dell'immagine
}

const WGER_API_URL = "https://wger.de/api/v2";
const WGER_IMAGE_BASE_URL = "https://wger.de";

/**
 * Cerca un esercizio sull'API di wger in base a un termine in inglese.
 * @param term Il nome dell'esercizio in inglese.
 * @returns Una promessa che si risolve con un array di esercizi trovati.
 */
export const searchExercisesByName = async (term: string): Promise<WgerExerciseInfo[]> => {
  if (!term) return [];
  
  try {
    const response = await fetch(`${WGER_API_URL}/exercise/search/?term=${encodeURIComponent(term)}&language=2`); // language=2 è Inglese
    if (!response.ok) {
      throw new Error('Errore nella ricerca dell'esercizio su wger');
    }
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Errore in searchExercisesByName:", error);
    return [];
  }
};

/**
 * Trova l'URL dell'immagine principale per un dato ID di esercizio.
 * @param exerciseId L'ID dell'esercizio ottenuto dalla ricerca.
 * @returns Una promessa che si risolve con l'URL completo dell'immagine, o null se non trovata.
 */
export const getMainImageForExercise = async (exerciseId: number): Promise<string | null> => {
  try {
    // Cerchiamo l'immagine principale associata all'ID dell'esercizio base
    const response = await fetch(`${WGER_API_URL}/exerciseimage/?is_main=true&exercise_base=${exerciseId}`);
    if (!response.ok) {
      throw new Error("Errore nel recupero dell'immagine da wger");
    }
    const data = await response.json();
    const mainImage: WgerExerciseImage | undefined = data.results[0];
    
    if (mainImage && mainImage.image) {
      // Costruisce l'URL completo dell'immagine
      return `${WGER_IMAGE_BASE_URL}${mainImage.image}`;
    }
    return null;
  } catch (error) {
    console.error("Errore in getMainImageForExercise:", error);
    return null;
  }
};