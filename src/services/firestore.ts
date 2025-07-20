// src/services/firestore.ts
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Workout, WorkoutData } from '../types';

/**
 * Ascolta in tempo reale i cambiamenti sulla collezione degli allenamenti dell'utente.
 * @param onSuccess Callback da eseguire in caso di successo.
 * @param onError Callback da eseguire in caso di errore.
 * @returns Una funzione per annullare l'iscrizione al listener.
 */
export const onWorkoutsSnapshot = (
  onSuccess: (workouts: Workout[]) => void,
  onError: (error: Error) => void
) => {
  if (!auth.currentUser) {
    onError(new Error("Utente non autenticato."));
    return () => {};
  }

  const workoutsCollection = collection(db, 'users', auth.currentUser.uid, 'workouts');
  
  const unsubscribe = onSnapshot(workoutsCollection, 
    (snapshot) => {
      const workoutsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
      onSuccess(workoutsData);
    },
    (error) => {
      console.error("Errore nel listener di Firestore:", error);
      onError(error);
    }
  );

  return unsubscribe;
};

/**
 * Aggiunge una nuova scheda di allenamento al database dell'utente.
 * @param workoutData I dati della nuova scheda.
 */
export const addWorkout = async (workoutData: WorkoutData) => {
  if (!auth.currentUser) throw new Error("Utente non autenticato per aggiungere una scheda.");
  const workoutsCollection = collection(db, 'users', auth.currentUser.uid, 'workouts');
  await addDoc(workoutsCollection, workoutData);
};

/**
 * Aggiorna una scheda di allenamento esistente.
 * @param workoutId L'ID della scheda da aggiornare.
 * @param updatedData I dati da modificare.
 */
export const updateWorkout = async (workoutId: string, updatedData: Partial<WorkoutData>) => {
    if (!auth.currentUser) throw new Error("Utente non autenticato per aggiornare una scheda.");
    const workoutDoc = doc(db, 'users', auth.currentUser.uid, 'workouts', workoutId);
    await updateDoc(workoutDoc, updatedData);
};

/**
 * Elimina una scheda di allenamento.
 * @param workoutId L'ID della scheda da eliminare.
 */
export const deleteWorkout = async (workoutId: string) => {
  if (!auth.currentUser) throw new Error("Utente non autenticato per eliminare una scheda.");
  const workoutDoc = doc(db, 'users', auth.currentUser.uid, 'workouts', workoutId);
  await deleteDoc(workoutDoc);
};