import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
// MODIFICA: Import aggiuntivi da Firestore, incluso 'setDoc'
import { auth, db } from '../services/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { getUserProfile } from '../services/firestore';
import type { AppUser, FavoritePlaylist } from '../types';

interface AuthContextType {
  user: AppUser | null;
  isAuthReady: boolean;
  logout: () => void;
  signUp: typeof createUserWithEmailAndPassword;
  signIn: typeof signInWithEmailAndPassword;
  signInWithGoogle: () => Promise<any>;
  addFavoritePlaylist: (playlist: FavoritePlaylist) => Promise<void>;
  removeFavoritePlaylist: (playlist: FavoritePlaylist) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnapshot) => {
          const userProfile = docSnapshot.data();
          setUser({
            ...firebaseUser,
            ...userProfile,
          } as AppUser);
          setIsAuthReady(true);
        });
        return () => unsubProfile();
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // --- FUNZIONI CORRETTE PER GESTIRE LE PLAYLIST PREFERITE ---

  const addFavoritePlaylist = async (playlist: FavoritePlaylist) => {
    if (!user) throw new Error("Utente non autenticato.");
    const userDocRef = doc(db, 'users', user.uid);
    // MODIFICA: Usiamo setDoc con { merge: true } per creare il documento se non esiste
    await setDoc(userDocRef, {
      favoritePlaylists: arrayUnion(playlist)
    }, { merge: true });
  };

  const removeFavoritePlaylist = async (playlist: FavoritePlaylist) => {
    if (!user) throw new Error("Utente non autenticato.");
    const userDocRef = doc(db, 'users', user.uid);
    // MODIFICA: Usiamo setDoc anche qui per coerenza, sebbene updateDoc funzionerebbe
    // se siamo sicuri che il documento esista già. setDoc è più sicuro.
    await setDoc(userDocRef, {
      favoritePlaylists: arrayRemove(playlist)
    }, { merge: true });
  };
  // --- FINE MODIFICHE ---

  const value = { 
    user, 
    isAuthReady, 
    logout, 
    signUp: createUserWithEmailAndPassword,
    signIn: signInWithEmailAndPassword,
    signInWithGoogle,
    addFavoritePlaylist,
    removeFavoritePlaylist,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};