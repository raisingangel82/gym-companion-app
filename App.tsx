// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { Layout } from './components/Layout';
import { WorkoutPage } from './pages/WorkoutPage';
import { ManagePage } from './pages/ManagePage';
import { MusicPage } from './pages/MusicPage';
import { StatsPage } from './pages/StatsPage'; // 1. Importa la nuova pagina
import { UpgradePage } from './pages/UpgradePage';

function App() {
  const { isAuthReady } = useAuth();

  // Mostra una schermata di caricamento finché Firebase non ha confermato lo stato di login
  if (!isAuthReady) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">Caricamento...</div>;
  }
  
  return (
    <Routes>
      {/* Il Layout contiene l'header e la barra di navigazione */}
      <Route path="/" element={<Layout />}>
        {/* Queste sono le pagine che vengono mostrate all'interno del Layout */}
        <Route index element={<WorkoutPage />} />
        <Route path="manage" element={<ManagePage />} />
        <Route path="music" element={<MusicPage />} />
        <Route path="stats" element={<StatsPage />} /> {/* 2. Aggiungi la rotta per le statistiche */}
      </Route>
      
      {/* La pagina di Upgrade è a sé stante, senza il layout principale */}
      <Route path="/upgrade" element={<UpgradePage />} />
    </Routes>
  );
}

export default App;
