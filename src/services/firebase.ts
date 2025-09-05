import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyBUZe_mGbfLL4HzaacbshE6kj38oS7xWPg",
  authDomain: "gym-companion-cb3af.firebaseapp.com",
  projectId: "gym-companion-cb3af",
  storageBucket: "gym-companion-cb3af.appspot.com", // Modificato per usare il dominio corretto, senza 'firebase' nel mezzo
  messagingSenderId: "1054016179457",
  appId: "1:1054016179457:web:11b1096f8dce67d3ffdf00",
  measurementId: "G-N2PTZ0W2BV"
};

// 1. Inizializza l'app di Firebase
const app = initializeApp(firebaseConfig);

// 2. Inizializza App Check in modo sicuro
// Questa variabile speciale (import.meta.env.DEV) è fornita da Vite (il tuo build tool).
// Sarà 'true' solo quando esegui il server di sviluppo (es. su localhost).
// Sarà 'false' quando crei la build per la produzione.
if (import.meta.env.DEV) {
  // Abilitiamo il token di debug SOLO in ambiente di sviluppo.
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  console.log("App Check: Modalità debug abilitata per l'ambiente di sviluppo.");
}

initializeAppCheck(app, {
  // La tua chiave del sito reCAPTCHA v3
  provider: new ReCaptchaV3Provider('6Lf5sI4rAAAAAHtXMoyKoNsGoS7mx_-KVXcxZKW8'),
  
  // Mantiene il token aggiornato automaticamente
  isTokenAutoRefreshEnabled: true
});


// 3. Esporta i servizi di Firebase per il resto della tua applicazione
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app); 

// Esporta anche l'istanza dell'app, può essere utile
export default app;