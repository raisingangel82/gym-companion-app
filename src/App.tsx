import { useMemo, useState, useCallback } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';

// Hooks, Tipi e Servizi
import { useMusic, MusicProvider } from './contexts/MusicContext';
import { usePageAction, PageActionProvider } from './contexts/PageActionContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { RestTimerProvider, useRestTimer } from './contexts/RestTimerContext';
import { updateUserProfile } from './services/firestore';
import type { ActionConfig, UserProfile } from './types';

// Componenti e Pagine
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { MusicBar } from './components/MusicBar'; // Il nostro componente ora persistente
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
import { Play, Pause, Dumbbell, Plus, Sparkles } from 'lucide-react';

function MainAppLayout() {
  const { 
    videoId, 
    playlistId, 
    playerRef, 
    isPlaying,
  } = useMusic();
  const { registeredAction } = usePageAction();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const { isTimerActive, isAlarming } = useRestTimer();
  const currentPath = location.pathname;

  const handleTogglePlay = useCallback(() => {
    if (!playerRef.current) return;
    const playerState = playerRef.current.getPlayerState();
    if (playerState === 1) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [playerRef]);
  
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
  
  const actionConfig: ActionConfig = useMemo(() => {
    if (currentPath === '/') return { icon: Dumbbell, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Registra Set', disabled: !registeredAction };
    if (currentPath === '/manage') return { icon: Plus, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Crea Scheda', disabled: !registeredAction };
    if (currentPath === '/stats') return { icon: Sparkles, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Report AI', disabled: !registeredAction };
    return { icon: isPlaying ? Pause : Play, onClick: handleTogglePlay, label: 'Play/Pausa', disabled: !videoId && !playlistId };
  }, [currentPath, isPlaying, videoId, playlistId, registeredAction, handleTogglePlay]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onLogout={logout} onOpenOnboarding={() => setIsOnboardingModalOpen(true)} />
      
      {/* La MusicBar viene renderizzata qui. Sarà lei stessa a decidere se mostrarsi o meno. */}
      <MusicBar />

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      
      <BottomBar actionConfig={actionConfig} />
      
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
  return (
    <ThemeProvider>
      <SettingsProvider>
        <RestTimerProvider>
          <MusicProvider>
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
          </MusicProvider>
        </RestTimerProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;