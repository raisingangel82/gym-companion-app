// src/App.tsx

import { useMemo, useState, useCallback } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';

// Hooks, Tipi e Servizi
import { useMusic } from './contexts/MusicPlayerContext';
import { PageActionProvider, usePageAction } from './contexts/PageActionContext';
import { useAuth } from './contexts/AuthContext';
import { RestTimerProvider, useRestTimer } from './contexts/RestTimerContext';
import { updateUserProfile } from './services/firestore';
import type { ActionConfig, UserProfile } from './types';

// Componenti e Pagine
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { OnboardingModal } from './components/OnboardingModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UpdatePrompt } from './components/UpdatePrompt';
import { RestTimerModal } from './components/RestTimerModal';
import { WorkoutPage } from './pages/WorkoutPage';
import { ManagePage } from './pages/ManagePage';
import { StatsPage } from './pages/StatsPage';
import { MusicPage } from './pages/MusicPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UpgradePage } from './pages/UpgradePage';
// MODIFICA: Rimosse le icone non più necessarie qui e aggiunta Home per il default
import { Play, Pause, Home } from 'lucide-react';

function MainAppLayout() {
  const { currentTrack, isPlaying, togglePlayPause } = useMusic();
  // MODIFICA: Leggiamo la nuova proprietà 'actionConfig' dal contesto
  const { actionConfig: contextActionConfig } = usePageAction();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const { isTimerActive, isAlarming } = useRestTimer();
  const currentPath = location.pathname;
  
  const handleCompleteOnboarding = useCallback(async (formData: UserProfile) => {
    if (!user) return;
    try {
      const profileKeys: (keyof UserProfile)[] = [
        'plan','gender','age','height','weight','goal','experience','frequency','duration','equipment','lifestyle','injuries','pathologies','mobility_issues','favoritePlaylists'
      ];
      const profileToSave = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => 
            profileKeys.includes(key as keyof UserProfile) && value !== undefined
        )
      );
      await updateUserProfile(user.uid, profileToSave);
    } catch (error) {
      console.error("Salvataggio del profilo fallito in MainAppLayout:", error);
    } finally {
      setIsOnboardingModalOpen(false);
    }
  }, [user]);
  
  // MODIFICA: Tutta la logica per la actionConfig è stata semplificata
  const actionConfig: ActionConfig | null = useMemo(() => {
    // La pagina Musica ha una logica speciale che ha la priorità
    if (currentPath === '/music') {
      return { 
        icon: isPlaying ? Pause : Play, 
        onClick: togglePlayPause, 
        label: isPlaying ? 'Pausa' : 'Play', 
        disabled: !currentTrack 
      };
    }
    
    // Per tutte le altre pagine, usiamo la configurazione fornita dal contesto
    return contextActionConfig;

  }, [currentPath, contextActionConfig, isPlaying, currentTrack, togglePlayPause]);

  // Definiamo una configurazione di default per i momenti in cui nessuna azione è registrata
  const defaultConfig: ActionConfig = {
    icon: Home,
    label: 'Home',
    onClick: () => {},
    disabled: true
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onLogout={logout} onOpenOnboarding={() => setIsOnboardingModalOpen(true)} />

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      
      {/* Ora passiamo la configurazione corretta, usando il default se null */}
      <BottomBar actionConfig={actionConfig || defaultConfig} />
      
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onComplete={handleCompleteOnboarding}
        initialData={user}
      />
      
      {(isTimerActive || isAlarming) && currentPath === '/' && <RestTimerModal />}
    </div>
  );
}

function App() {
  // NOTA: Ho rimosso i Provider duplicati che erano già in main.tsx, 
  // assumendo che App sia il figlio diretto dei provider in main.tsx.
  // Se invece questo file è il vero entry point, la struttura a provider nidificati va bene.
  // Lascio la versione più sicura e completa.
  return (
      <RestTimerProvider>
        <PageActionProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainAppLayout />}>
                <Route path="/" element={<WorkoutPage />} />
                <Route path="/manage" element={<ManagePage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/music" element={<MusicPage />} />
              </Route>
            </Route>
          </Routes>
          <UpdatePrompt />
        </PageActionProvider>
      </RestTimerProvider>
  );
}

export default App;