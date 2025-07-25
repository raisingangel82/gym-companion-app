import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";

initializeApp();

// Configurazione condivisa aggiornata per la regione europea
const functionOptions = { 
  region: "europe-west1",
  timeoutSeconds: 300, 
  cors: [
    /localhost:\d+$/, 
    "https://gym-companion-cb3af.web.app",
    "https://gym-companion-app.vercel.app" // Assicurati che questo sia il tuo URL di produzione Vercel
  ] 
};

/**
 * Funzione Callable per generare un piano di allenamento con AI.
 */
export const generateAiWorkoutPlan = onCall(functionOptions, async (request) => {
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
    const vertex_ai = new VertexAI({ project: 'gym-companion-cb3af', location: 'europe-west1' });
    const model = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) throw new HttpsError("internal", "L'AI non ha generato una risposta valida.");
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) throw new HttpsError("internal", "La risposta AI non era nel formato JSON atteso.");
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    return parsedJson;

  } catch (error) {
    console.error("Errore durante la generazione della scheda AI:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Impossibile generare la scheda AI.");
  }
});


/**
 * Funzione Callable per trovare un esercizio sostitutivo con AI.
 */
export const getExerciseSubstitution = onCall(functionOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "È necessario essere autenticati.");
  const { userProfile, exerciseToSubstitute, reason } = request.data;
  if (!userProfile || !exerciseToSubstitute || !reason) {
    throw new HttpsError("invalid-argument", "Dati incompleti per la sostituzione dell'esercizio.");
  }

  const prompt = `
# RUOLO
Sei "Alpha-Trainer", un'intelligenza artificiale esperta in personal training, biomeccanica del movimento e adattamento dell'allenamento. La tua priorità assoluta è la sicurezza dell'utente, seguita dall'efficacia dell'allenamento.

# CONTESTO
L'utente sta eseguendo la sua sessione di allenamento e ha richiesto una modifica per un esercizio specifico.
- Dati Utente:
  - Obiettivo: ${userProfile.goal || 'Non specificato'}
  - Livello di esperienza: ${userProfile.experience || 'Non specificato'}
  - Infortuni noti: ${userProfile.injuries || 'Nessuno'}
- Dati della Sessione Attuale:
  - Esercizio da modificare: ${exerciseToSubstitute.name}
  - Motivo della richiesta: ${reason}

# COMPITO
Analizza la situazione e fornisci la migliore sostituzione possibile per l'esercizio indicato. La tua risposta deve essere immediata, chiara e attuabile. Fornisci la tua risposta in formato JSON.

# FORMATO DI OUTPUT (Obbligatorio: solo JSON)
\`\`\`json
{
  "quickAnalysis": "Breve commento sul problema.",
  "primarySolution": {
    "exerciseName": "Nome dell'esercizio sostitutivo.",
    "why": "Spiegazione biomeccanica della scelta.",
    "instructions": "Come adattare serie, ripetizioni e carico."
  },
  "secondarySolution": {
    "exerciseName": "Nome della seconda opzione.",
    "why": "Spiegazione della seconda scelta.",
    "instructions": "Indicazioni specifiche."
  }
}
\`\`\`
`;

  try {
    const vertex_ai = new VertexAI({ project: 'gym-companion-cb3af', location: 'europe-west1' });
    const model = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) throw new HttpsError("internal", "L'AI non ha generato una risposta valida.");
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) throw new HttpsError("internal", "La risposta AI non era nel formato JSON atteso.");
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    return parsedJson;

  } catch (error) {
    console.error("Errore durante la sostituzione dell'esercizio:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Impossibile ottenere una sostituzione dall'AI.");
  }
});


/**
 * Funzione Callable per generare un report delle performance.
 */
export const generatePerformanceReport = onCall(functionOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "È necessario essere autenticati.");
  const { userProfile, workoutHistory, workoutName } = request.data;
  if (!userProfile || !workoutHistory || !workoutName) {
    throw new HttpsError("invalid-argument", "Dati incompleti per la generazione del report.");
  }

  const prompt = `
# RUOLO
Sei "Alpha-Trainer", un'intelligenza artificiale esperta in analisi dei dati di performance atletica. Il tuo compito è interpretare i dati di allenamento dell'utente, tradurli in un report comprensibile e fornire una raccomandazione strategica basata sull'evidenza.
# CONTESTO
L'utente ha completato un ciclo di allenamento e ha richiesto una valutazione delle sue performance per la scheda "${workoutName}".
- Dati Utente:
  - Obiettivo del ciclo: ${userProfile.goal || 'Miglioramento generale'}
- Dati del Ciclo di Allenamento Appena Concluso:
  - Log di Allenamento: ${JSON.stringify(workoutHistory, null, 2)}
- Feedback Soggettivo (Sintesi dei log):
  - Dolori riportati: ${userProfile.injuries || 'Nessuno'}
# COMPITO
Analizza tutti i dati forniti per valutare i progressi, identificare punti di forza e di debolezza, e consigliare la strategia migliore per il prossimo ciclo di allenamento. La tua risposta deve essere in formato JSON.
# FORMATO DI OUTPUT (Obbligatorio: solo JSON)
\`\`\`json
{
  "title": "Report di Performance - Ciclo Corrente",
  "summary": "Un paragrafo riassuntivo di 2-3 frasi sui progressi generali, successi e aree di attenzione.",
  "strengths": ["Punto di forza 1 (es. Ottima progressione del carico su Panca Piana).","Punto di forza 2 (es. Aderenza al programma molto alta)."],
  "weaknesses": ["Area di miglioramento 1 (es. Stallo del carico sullo Squat).","Area di miglioramento 2 (es. Affaticamento generale riportato nei feedback soggettivi)."],
  "recommendedOption": {"title": "Opzione A (Consigliata): Settimana di Scarico Attivo (Deload)","why": "Spiegazione del perché questa è l'opzione migliore.","how": "Descrizione di come implementare la raccomandazione."},
  "alternativeOption": {"title": "Opzione B (Alternativa): Nuovo Ciclo con Modifiche","why": "Spiegazione dell'alternativa.","how": "Descrizione di come implementare l'alternativa."},
  "nextStep": "Una domanda finale per l'utente per fargli scegliere come procedere."
}
\`\`\`
`;

  try {
    const vertex_ai = new VertexAI({ project: 'gym-companion-cb3af', location: 'europe-west1' });
    const model = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) throw new HttpsError("internal", "L'AI non ha generato una risposta valida.");
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) throw new HttpsError("internal", "La risposta AI non era nel formato JSON atteso.");
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    return parsedJson;

  } catch (error) {
    console.error("Errore durante la generazione del report:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Impossibile generare il report AI.");
  }
});