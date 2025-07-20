// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // <-- Aggiungi questa riga
import { getFirestore } from "firebase/firestore"; // <-- Aggiungi o verifica questa riga
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUZe_mGbfLL4HzaacbshE6kj38oS7xWPg",
  authDomain: "gym-companion-cb3af.firebaseapp.com",
  projectId: "gym-companion-cb3af",
  storageBucket: "gym-companion-cb3af.firebasestorage.app",
  messagingSenderId: "1054016179457",
  appId: "1:1054016179457:web:11b1096f8dce67d3ffdf00",
  measurementId: "G-N2PTZ0W2BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Aggiungi 'export' qui
export const auth = getAuth(app); 
export const db = getFirestore(app);