import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";

initializeApp();

/**
 * Funzione Callable per generare un piano di allenamento con AI.
 */
// MODIFICA: Aggiunta l'opzione "cors: true" per permettere le chiamate da localhost
export const generateAiWorkoutPlan = onCall({ region: "us-central1", timeoutSeconds: 300, cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "È necessario essere autenticati.");
  }

  const userData = request.data;
  if (!userData || !userData.goal || !userData.experience || !userData.frequency) {
    throw new HttpsError("invalid-argument", "Dati utente incompleti per la generazione della scheda.");
  }
  
  const prompt = `
# RUOLO
Sei "Alpha-Trainer", un'intelligenza artificiale esperta nella programmazione dell'allenamento basata su evidenze scientifiche.

# CONTESTO
L'utente ha richiesto la creazione di un nuovo programma di allenamento. Analizza la sua anamnesi per creare un piano personalizzato.

**Anamnesi Completa Utente:**
- Sesso: ${userData.gender || 'Non specificato'}
- Età: ${userData.age || 'Non specificato'}
- Altezza: ${userData.height || 'Non specificato'} cm
- Peso: ${userData.weight || 'Non specificato'} kg
- Obiettivo Primario: ${userData.goal}
- Esperienza di Allenamento: ${userData.experience}
- Giorni di Allenamento a Settimana: ${userData.frequency}
- Durata per Sessione: ${userData.duration || 'Non specificato'} minuti
- Attrezzatura Disponibile: ${userData.equipment || 'Non specificato'}
- Infortuni e Limitazioni: ${userData.injuries || 'Nessuna'}

# COMPITO
Genera un programma di allenamento dettagliato in formato JSON. Il programma deve essere un array di oggetti "scheda". Se i giorni di allenamento sono 2 o più, crea schede diverse (A, B, ecc.) da alternare. Includi sempre esercizi per gli addominali. Non includere warm-up, cool-down o spiegazioni della logica, ma solo l'array JSON.

# FORMATO DI OUTPUT (Obbligatorio: solo l'array JSON racchiuso in \`\`\`json ... \`\`\`)
\`\`\`json
[
  {
    "name": "Nome Scheda (es. Full-Body A)",
    "exercises": [
      {
        "name": "Nome Esercizio",
        "sets": 4,
        "reps": "8-10",
        "weight": 0
      }
    ]
  }
]
\`\`\`
`;

  try {
    const vertex_ai = new VertexAI({ project: 'gym-companion-cb3af', location: 'us-central1' });
    const model = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new HttpsError("internal", "L'AI non ha generato una risposta valida.");
    }
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new HttpsError("internal", "La risposta AI non era nel formato JSON atteso.");
    }
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    
    return parsedJson;

  } catch (error) {
    console.error("Errore durante la generazione della scheda AI:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Impossibile generare la scheda AI.");
  }
});