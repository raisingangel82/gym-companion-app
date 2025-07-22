// src/services/firestore.ts
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Workout, WorkoutData } from '../types';

console.log("✅ [firestore.ts] File caricato e oggetto 'db' importato:", db ? 'OK' : 'NON TROVATO');

export const onWorkoutsSnapshot = (
  onSuccess: (workouts: Workout[]) => void,
  onError: (error: Error) => void
) => {
  const user = auth.currentUser;
  if (!user) {
    console.warn("[firestore.ts] onWorkoutsSnapshot: Utente non autenticato.");
    onSuccess([]);
    return () => {};
  }
  console.log(`[firestore.ts] onWorkoutsSnapshot: In ascolto per l'utente ${user.uid}`);
  
  const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
  const q = query(workoutsCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      // FIX: Logica di mapping completata
      const workoutsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(),
          history: data.history?.map((entry: any) => ({
            ...entry,
            date: (entry.date as Timestamp)?.toDate ? (entry.date as Timestamp).toDate() : new Date(entry.date)
          })) || []
        } as Workout;
      });
      console.log(`[firestore.ts] onWorkoutsSnapshot: Ricevuti ${workoutsData.length} documenti.`);
      onSuccess(workoutsData);
    },
    (error) => {
      console.error("[firestore.ts] onWorkoutsSnapshot: Errore nel listener:", error);
      onError(error);
    }
  );
  return unsubscribe;
};

export const addWorkout = async (workoutData: WorkoutData) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("[firestore.ts] addWorkout: Tentativo di aggiungere una scheda senza utente autenticato.");
    throw new Error("Utente non autenticato per aggiungere una scheda.");
  }
  
  console.log(`2. [firestore.ts] Tentativo di scrittura nella collezione: users/${user.uid}/workouts`);
  
  try {
    const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
    const docRef = await addDoc(workoutsCollection, { ...workoutData, createdAt: Timestamp.now() });
    console.log("✅ 3. [firestore.ts] Scheda aggiunta con successo! ID Documento:", docRef.id);
  } catch (error) {
    console.error("❌ ERRORE CRITICO durante la scrittura su Firestore:", error);
    alert("Errore durante il salvataggio su Firebase. Controlla la console per i dettagli.");
  }
};

export const updateWorkout = async (workoutId: string, updatedData: Partial<WorkoutData>) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Utente non autenticato per aggiornare una scheda.");
    const workoutDoc = doc(db, 'users', user.uid, 'workouts', workoutId);
    await updateDoc(workoutDoc, updatedData);
};

export const deleteWorkout = async (workoutId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Utente non autenticato per eliminare una scheda.");
  const workoutDoc = doc(db, 'users', user.uid, 'workouts', workoutId);
  await deleteDoc(workoutDoc);
};