// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { Layout } from './components/Layout';
import { ManagePage as SettingsPage } from './pages/ManagePage'; 
import { WorkoutPage } from './pages/WorkoutPage';
import { MusicPage } from './pages/MusicPage';
import { StatsPage } from './pages/StatsPage';
import { UpgradePage } from './pages/UpgradePage';

function App() {
  const { isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">Caricamento...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<WorkoutPage />} /> 
        <Route path="settings" element={<SettingsPage />} /> 
        <Route path="music" element={<MusicPage />} />
        <Route path="stats" element={<StatsPage />} /> 
      </Route>
      
      <Route path="/upgrade" element={<UpgradePage />} />
    </Routes>
  );
}

export default App;