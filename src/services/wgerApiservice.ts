// L'interfaccia non è più necessaria qui, ma puoi lasciarla se vuoi
interface WgerExerciseInfo {
  id: number; name: string; uuid: string;
}

const WGER_API_URL = "https://wger.de/api/v2";

export const searchExercisesByName = async (term: string): Promise<any[]> => {
  if (!term) return [];
  try {
    const response = await fetch(`${WGER_API_URL}/exercise/search/?term=${encodeURIComponent(term)}&language=2`);
    if (!response.ok) {
      throw new Error("Errore nella ricerca dell'esercizio su wger");
    }
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Errore in searchExercisesByName:", error);
    return [];
  }
};

// La funzione getMainImageForExercise è stata eliminata.