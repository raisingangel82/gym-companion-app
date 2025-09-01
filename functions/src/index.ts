import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";

// Inizializza l'app di Firebase Admin.
// Questo è necessario per far funzionare le Cloud Functions nell'ambiente del server.
initializeApp();

// Configurazione condivisa per tutte le funzioni.
// Centralizzare queste opzioni rende più facile la gestione e garantisce coerenza.
const functionOptions = { 
  region: "europe-west1",      // Regione europea per ridurre la latenza.
  timeoutSeconds: 300,         // Timeout esteso a 5 minuti per le chiamate AI più lunghe.
  cors: [
    /localhost:\d+$/,          // Permette i test in ambiente di sviluppo locale.
    "https://gym-companion-cb3af.web.app", // Dominio di hosting Firebase.
    "https://gym-companion-app.vercel.app"  // Dominio di produzione su Vercel.
  ] 
};

/**
 * Funzione Callable per generare un piano di allenamento con AI.
 * Riceve i dati anagrafici e gli obiettivi dell'utente per creare una scheda personalizzata.
 */
export const generateAiWorkoutPlan = onCall(functionOptions, async (request) => {
  // 1. Controllo di autenticazione
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "È necessario essere autenticati per generare un piano.");
  }

  // 2. Validazione dei dati in input
  const userData = request.data;
  if (!userData || !userData.goal || !userData.experience || !userData.frequency) {
    throw new HttpsError("invalid-argument", "Dati utente incompleti per la generazione della scheda.");
  }
  
  // 3. Costruzione del Prompt per l'AI
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

  // 4. Esecuzione della chiamata all'AI e gestione della risposta
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
 * Riceve un esercizio da cambiare e il motivo, fornendo alternative valide.
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

  } catch (error)
 {
    console.error("Errore durante la sostituzione dell'esercizio:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Impossibile ottenere una sostituzione dall'AI.");
  }
});


/**
 * Funzione Callable per generare un report delle performance.
 * VERSIONE MIGLIORATA per un'analisi più profonda e dettagliata.
 */
export const generatePerformanceReport = onCall(functionOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "È necessario essere autenticati.");
  const { userProfile, workoutHistory, workoutName } = request.data;
  if (!userProfile || !workoutHistory || !workoutName) {
    throw new HttpsError("invalid-argument", "Dati incompleti per la generazione del report.");
  }

  // PROMPT DETTAGLIATO per un'analisi approfondita
  const prompt = `
# RUOLO
Sei "Alpha-Trainer", un'intelligenza artificiale d'élite specializzata in data science applicata alla performance atletica. Il tuo compito è trasformare un log di allenamento grezzo in un'analisi strategica approfondita, identificando trend, pattern e fornendo insight azionabili.

# CONTESTO
L'utente ha richiesto un'analisi dettagliata delle sue performance basata sulla cronologia di allenamento fornita per il ciclo "${workoutName}".
- Profilo Utente:
  - Obiettivo Principale: ${userProfile.goal || 'Miglioramento generale'}
  - Infortuni o Limitazioni Note: ${userProfile.injuries || 'Nessuno'}
- Dati Grezzi del Ciclo di Allenamento:
  - Log Completo: ${JSON.stringify(workoutHistory, null, 2)}

# COMPITO DETTAGLIATO (Segui questi passaggi)
1.  **Analisi Quantitativa Generale**:
    - Calcola il trend del **volume totale** (tonnellaggio) nel periodo. È crescente, stabile o in calo?
    - Valuta la **frequenza e aderenza**: l'utente è stato costante o ci sono stati lunghi periodi di pausa?
    - Identifica i **gruppi muscolari più allenati e meno allenati** in base al volume.
2.  **Analisi Specifica per Esercizio (Deep Dive)**:
    - Seleziona i **2-3 esercizi fondamentali** più presenti nel log (es. Panca Piana, Squat, Stacco, Lat Machine).
    - Per ciascuno di essi, analizza la **progressione del carico e/o delle ripetizioni**. C'è uno stallo? Una progressione? Una regressione?
    - Fornisci un'osservazione specifica per ogni esercizio analizzato.
3.  **Sintesi Strategica**:
    - Riassumi i risultati in punti di forza evidenti e aree di miglioramento critiche.
    - Basandoti sull'analisi, formula due strategie chiare e dettagliate per il prossimo ciclo di allenamento. Una dovrebbe essere quella che ritieni ottimale.

# FORMATO DI OUTPUT (Obbligatorio: JSON strutturato come segue)
\`\`\`json
{
  "title": "Analisi di Performance Approfondita",
  "period": "Riepilogo del periodo analizzato (es. Ultimi 30 giorni)",
  "overallAnalysis": {
    "summary": "Un paragrafo denso di significato che riassume i risultati chiave dell'intero ciclo.",
    "volumeTrend": {
      "status": "Crescente | Stabile | In Calo",
      "comment": "Breve commento sul significato del trend del volume."
    },
    "adherence": {
      "level": "Alta | Media | Bassa",
      "comment": "Commento sulla costanza e l'impatto sulle performance."
    },
     "muscleGroupBalance": {
      "mostTrained": ["Gruppo Muscolare 1", "Gruppo Muscolare 2"],
      "leastTrained": ["Gruppo Muscolare 3", "Gruppo Muscolare 4"],
      "comment": "Considerazioni sul bilanciamento tra i vari distretti muscolari."
    }
  },
  "exerciseDeepDive": [
    {
      "exerciseName": "Nome Esercizio 1",
      "performanceTrend": "Descrizione del trend (es. 'Progressione lineare del carico, stallo sulle ripetizioni')",
      "analysis": "Analisi dettagliata di cosa sta succedendo con questo esercizio.",
      "suggestion": "Suggerimento specifico per questo esercizio (es. 'Introdurre una settimana di deload o variare lo schema di rep')."
    },
    {
      "exerciseName": "Nome Esercizio 2",
      "performanceTrend": "Descrizione del trend",
      "analysis": "Analisi dettagliata.",
      "suggestion": "Suggerimento specifico."
    }
  ],
  "strengths": [
    "Punto di forza dettagliato 1, supportato da dati (es. 'Impressionante aumento del 10% del carico sulla Panca Piana').",
    "Punto di forza dettagliato 2."
  ],
  "weaknesses": [
    "Area di miglioramento dettagliata 1 (es. 'Volume quasi nullo per i femorali, potenziale squilibrio muscolare').",
    "Area di miglioramento dettagliata 2."
  ],
  "recommendations": {
    "primary": {
      "title": "Strategia Consigliata: Nome della Strategia (es. 'Fase di Intensificazione con Focus sulla Forza')",
      "why": "Spiegazione dettagliata del perché questa è la scelta migliore basata sull'analisi.",
      "how": "Elenco puntato di azioni concrete da intraprendere nel prossimo ciclo."
    },
    "alternative": {
      "title": "Strategia Alternativa: Nome della Strategia (es. 'Blocco di Ipertrofia con Aumento del Volume')",
      "why": "Spiegazione del perché si potrebbe scegliere questa alternativa.",
      "how": "Elenco puntato di azioni concrete."
    }
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
    
    // Aggiungo un try-catch specifico per il parsing del JSON per un debug migliore in futuro.
    try {
      const parsedJson = JSON.parse(jsonMatch[1]);
      return parsedJson;
    } catch (parseError) {
      console.error("Errore di parsing JSON dalla risposta AI:", parseError);
      console.log("Risposta AI non valida ricevuta:", jsonMatch[1]);
      throw new HttpsError("internal", "Formato JSON ricevuto dall'AI non valido.");
    }

  } catch (error) {
    console.error("Errore durante la generazione del report:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Impossibile generare il report AI.");
  }
});