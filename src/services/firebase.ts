import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUZe_mGbfLL4HzaacbshE6kj38oS7xWPg",
  authDomain: "gym-companion-cb3af.firebaseapp.com",
  projectId: "gym-companion-cb3af",
  storageBucket: "gym-companion-cb3af.firebasestorage.app",
  messagingSenderId: "1054016179457",
  appId: "1:1054016179457:web:11b1096f8dce67d3ffdf00",
  measurementId: "G-N2PTZ0W2BV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app);