// src/data/exerciseTranslations.ts

/**
 * Mappa dall'italiano all'inglese per i nomi degli esercizi.
 * Usata per interrogare l'API di wger.
 * Combina le traduzioni fornite dall'utente con suggerimenti aggiuntivi.
 */
export const translations: { [key: string]: string } = {
  // --- Le tue traduzioni originali ---
  "panca orizzontale bilanciere": "barbell bench press",
  "chest press inclinata": "incline dumbbell press",
  "curl cavo basso in piedi": "cable standing curl",
  "curl concentrato con manubrio": "dumbbell concentration curl",
  "shoulder press": "dumbbell shoulder press",
  "alzate laterali in piedi": "dumbbell lateral raise",
  "lat machine": "cable lat pulldown",
  "pulley presa stretta": "cable seated row",
  "french press manubrio": "dumbbell lying triceps extension",
  "triceps station": "triceps dip",
  "leg press": "leg press",
  "leg extension": "leg extension",
  "leg curl seduto": "seated leg curl",
  "croci panca inclinata": "incline dumbbell fly",
  "vertical traction": "pull up",
  "dips": "dips",
  "squat con bilanciere": "barbell squat",

  // --- Aggiunte per maggiore copertura (senza duplicati) ---
  "panca piana": "bench press", // Generico
  "squat": "squat", // Generico
  "stacchi da terra": "deadlift",
  "alzate laterali": "lateral raise", // Generico
  "rematore": "row",
  "trazioni": "pull-up", // Termine più comune
  "leg curl": "leg curl", // Generico
  "curl bicipiti": "biceps curl", // Generico
};