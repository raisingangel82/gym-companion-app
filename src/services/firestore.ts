import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Workout, WorkoutData, UserProfile } from '../types';

/**
 * Attiva un listener in tempo reale per le schede di allenamento dell'utente corrente.
 */
export const onWorkoutsSnapshot = (
  onSuccess: (workouts: Workout[]) => void,
  onError: (error: Error) => void
) => {
  const user = auth.currentUser;
  if (!user) {
    onSuccess([]);
    return () => {};
  }
  
  const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
  const q = query(workoutsCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
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
      onSuccess(workoutsData);
    },
    (error) => {
      console.error("[firestore.ts] Errore nel listener onWorkoutsSnapshot:", error);
      onError(error);
    }
  );
  return unsubscribe;
};

/**
 * Aggiunge una nuova scheda di allenamento per l'utente corrente.
 */
export const addWorkout = async (workoutData: WorkoutData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Utente non autenticato per aggiungere una scheda.");
  
  const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
  await addDoc(workoutsCollection, { ...workoutData, createdAt: Timestamp.now() });
};

/**
 * Aggiorna una scheda di allenamento esistente.
 */
export const updateWorkout = async (workoutId: string, updatedData: Partial<WorkoutData>) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Utente non autenticato per aggiornare una scheda.");
  const workoutDoc = doc(db, 'users', user.uid, 'workouts', workoutId);
  await updateDoc(workoutDoc, updatedData);
};

/**
 * Elimina una scheda di allenamento.
 */
export const deleteWorkout = async (workoutId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Utente non autenticato per eliminare una scheda.");
  const workoutDoc = doc(db, 'users', user.uid, 'workouts', workoutId);
  await deleteDoc(workoutDoc);
};

/**
 * Crea o aggiorna il documento del profilo di un utente.
 */
export const updateUserProfile = async (userId: string, data: UserProfile) => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, data, { merge: true });
};

/**
 * Recupera il documento del profilo di un utente.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Errore nel recuperare il profilo utente:", error);
    return null;
  }
};