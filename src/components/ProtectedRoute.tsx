import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { user, isAuthReady } = useAuth();

  // Mostra una schermata di caricamento mentre lo stato di autenticazione si inizializza
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        {/* Qui potresti inserire uno spinner/logo più elaborato */}
        <p className="text-gray-500">Caricamento...</p>
      </div>
    );
  }

  // Se l'autenticazione è pronta ma non c'è l'utente, reindirizza al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se l'utente è autenticato, mostra il contenuto della rotta protetta
  return <Outlet />;
};