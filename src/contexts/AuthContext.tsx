import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/firestore'; // Importa la nuova funzione
import type { AppUser } from '../types'; // Importa il nostro nuovo tipo utente

interface AuthContextType {
  user: AppUser | null; // Ora userà il nostro tipo AppUser
  isAuthReady: boolean;
  logout: () => void;
  signUp: typeof createUserWithEmailAndPassword;
  signIn: typeof signInWithEmailAndPassword;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // L'utente si è loggato. Ora carichiamo il suo profilo da Firestore.
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        // Uniamo i dati di autenticazione con i dati del profilo
        setUser({
          ...firebaseUser,
          ...userProfile, // Aggiunge età, peso, obiettivi, ecc.
        });
      } else {
        // L'utente si è disconnesso.
        setUser(null);
      }
      setIsAuthReady(true);
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

  const value = { 
    user, 
    isAuthReady, 
    logout, 
    signUp: createUserWithEmailAndPassword,
    signIn: signInWithEmailAndPassword,
    signInWithGoogle,
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