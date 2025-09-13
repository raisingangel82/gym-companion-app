import { initializeApp, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { VertexAI } from "@google-cloud/vertexai";
import fetch from "node-fetch";
import busboy = require("busboy");
import type { FileInfo } from "busboy";

// Inizializzazione sicura: esegue solo se non già inizializzata.
if (getApps().length === 0) {
  initializeApp();
}

// Configurazione condivisa per tutte le funzioni.
const functionOptions = { 
  region: "europe-west1",
  timeoutSeconds: 300,
  cors: [
    /localhost:\d+$/,
    "https://gym-companion-cb3af.web.app",
    "https://gym-companion-app.vercel.app"
  ] 
};

/**
 * Funzione Callable per generare un piano di allenamento con AI.
 */
export const generateAiWorkoutPlan = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "È necessario essere autenticati per generare un piano.");
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
    console.error("Errore during exercise substitution:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Unable to get a substitution from the AI.");
  }
});


/**
 * Funzione Callable per generare un report delle performance.
 */
export const generatePerformanceReport = onCall(functionOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  const { userProfile, workoutHistory, workoutName } = request.data;
  if (!userProfile || !workoutHistory || !workoutName) {
    throw new HttpsError("invalid-argument", "Incomplete data for report generation.");
  }
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
    console.log("--- RAW AI RESPONSE ---");
    console.log(responseText);
    console.log("--- END RAW AI RESPONSE ---");
    if (!responseText) throw new HttpsError("internal", "The AI did not generate a valid response.");
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) throw new HttpsError("internal", "The AI response was not in the expected JSON format.");
    try {
      const parsedJson = JSON.parse(jsonMatch[1]);
      return parsedJson;
    } catch (parseError) {
      console.error("JSON parsing error from AI response:", parseError);
      console.log("Invalid AI response received:", jsonMatch[1]);
      throw new HttpsError("internal", "Invalid JSON format received from the AI.");
    }
  } catch (error) {
    console.error("Error during report generation:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Unable to generate the AI report.");
  }
});


/**
 * Funzione Callable per cercare metadati di brani musicali.
 */
export const getMusicMetadata = onCall(functionOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required to search for metadata.");
  }
  const { query } = request.data;
  if (!query || typeof query !== 'string') {
    throw new HttpsError("invalid-argument", "A string 'query' is required.");
  }
  const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new HttpsError("unavailable", "The Deezer API is currently unreachable.");
    }
    const deezerResponse = await response.json() as { data?: unknown[] };
    return deezerResponse.data || [];
  } catch (error) {
    console.error("Error searching for metadata on Deezer:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Could not complete the metadata search.");
  }
});


/**
 * --- NUOVA FUNZIONE DI UPLOAD con gestione manuale dei CORS ---
 */
export const uploadMusicFile = onRequest(functionOptions, async (req, res) => {
  // --- MODIFICA: Inizio del blocco di gestione manuale dei CORS ---
  // Imposta gli header CORS per ogni richiesta in entrata.
  // Questo garantisce che il browser riceva sempre la risposta corretta.
  const origin = req.headers.origin;
  const allowedOrigins = [
    /localhost:\d+$/,
    "https://gym-companion-cb3af.web.app",
    "https://gym-companion-app.vercel.app",
  ];

  // Controlla se l'origine della richiesta è nella nostra lista di domini permessi.
  const isAllowed = allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin || "");
    }
    return origin === allowedOrigin;
  });

  if (isAllowed) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  // Gestione esplicita della richiesta di preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  // --- MODIFICA: Fine del blocco di gestione manuale dei CORS ---

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  const authToken = req.headers.authorization?.split("Bearer ")[1];
  if (!authToken) {
    res.status(401).json({ error: "Unauthorized: No auth token provided." });
    return;
  }
  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(authToken);
  } catch (error) {
    logger.error("Auth token verification failed", error);
    res.status(401).json({ error: "Unauthorized: Invalid auth token." });
    return;
  }
  const userId = decodedToken.uid;
  const bb = busboy({ headers: req.headers });
  const bucket = getStorage().bucket();
  let uploadResult: { downloadURL: string; fileName: string; } | null = null;

  bb.on("file", (fieldname: string, fileStream: NodeJS.ReadableStream, info: FileInfo) => {
    const { filename } = info;
    const filePath = `music/${userId}/${filename}`;
    const storageFile = bucket.file(filePath);

    logger.info(`Starting upload for ${filePath}`);

    const writeStream = storageFile.createWriteStream({
      metadata: { contentType: info.mimeType },
    });

    fileStream.pipe(writeStream);
    
    const promise = new Promise<void>((resolve, reject) => {
        writeStream.on('finish', async () => {
            logger.info(`Successfully uploaded ${filePath}`);
            await storageFile.makePublic();
            uploadResult = {
                downloadURL: storageFile.publicUrl(),
                fileName: filename,
            };
            resolve();
        });
        writeStream.on('error', (err) => {
            logger.error(`Failed to upload ${filePath}`, err);
            reject(new Error("File upload to storage failed."));
        });
    });
    (req as any).fileUploadPromise = promise;
  });

  bb.on("finish", async () => {
    try {
        if ((req as any).fileUploadPromise) {
            await (req as any).fileUploadPromise;
        }
        if (uploadResult) {
            // Assicurati che gli header CORS siano presenti anche nella risposta finale.
            if (isAllowed) {
              res.set("Access-Control-Allow-Origin", origin);
            }
            res.status(200).json(uploadResult);
        } else {
            throw new Error("File processing did not complete correctly.");
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  });

  bb.end(req.rawBody);
});