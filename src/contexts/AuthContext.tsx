import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// CORREZIONE: Aggiungiamo la parola chiave 'type' prima di User
import { onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken, type User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // @ts-ignore - __initial_auth_token è fornito dall'ambiente Canvas
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Autenticazione iniziale fallita, tento l'accesso anonimo:", error);
        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    
    initAuth();

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
  };

  const value = { user, isAuthReady, logout };

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
