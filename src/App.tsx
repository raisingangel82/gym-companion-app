import { useMemo, useState, useCallback } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import YouTube from 'react-youtube';

// Hooks, Tipi e Servizi
import { useMusic, MusicProvider } from './contexts/MusicContext';
import { usePageAction, PageActionProvider } from './contexts/PageActionContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { RestTimerProvider, useRestTimer } from './contexts/RestTimerContext';
import { updateUserProfile } from './services/firestore';
import type { ActionConfig, UserProfile } from './types'; // Assicurati che questo importi da index.ts

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
import { Play, Pause, Dumbbell, Plus, Sparkles } from 'lucide-react';

function MainAppLayout() {
  const { 
    isPlaying, 
    setIsPlaying, 
    videoId, 
    playlistId, 
    playerRef, 
    decorativePlayerRef,
    handlePlayerStateChange,
    handlePlayerError
  } = useMusic();

  const { registeredAction } = usePageAction();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  
  const { isTimerActive, isAlarming } = useRestTimer();
  const currentPath = location.pathname;

  const handleTogglePlay = useCallback(() => {
    const mainPlayer = playerRef.current;
    const decorativePlayer = decorativePlayerRef.current;
    if (!mainPlayer) return;
    if (isPlaying) {
      mainPlayer.pauseVideo();
      if (decorativePlayer) decorativePlayer.pauseVideo();
    } else {
      mainPlayer.playVideo();
      if (decorativePlayer) decorativePlayer.playVideo();
    }
  }, [isPlaying, playerRef, decorativePlayerRef]);
  
  // ==================================================================
  // ========= INIZIO DELLA MODIFICA: Funzione Corretta =========
  // ==================================================================
  const handleCompleteOnboarding = useCallback(async (formData: UserProfile) => {
    if (!user) return;
    try {
      // 1. DEFINIZIONE CHIAVI CORRETTA BASATA SU `index.ts`
      // Questa lista ora riflette esattamente le proprietà definite nella tua interfaccia UserProfile.
      const profileKeys: (keyof UserProfile)[] = [
        'plan',
        'gender',
        'age',
        'height',
        'weight',
        'goal',
        'experience',
        'frequency',
        'duration',
        'equipment',
        'lifestyle',
        'injuries',
        'pathologies',
        'mobility_issues',
        'favoritePlaylists'
      ];

      // 2. CREAZIONE DELL'OGGETTO "PULITO" IN MODO TYPE-SAFE
      // Questo approccio filtra l'oggetto ricevuto dal form, mantenendo solo le chiavi 
      // valide e i cui valori non sono `undefined`, risolvendo gli errori di build.
      const profileToSave = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => 
            profileKeys.includes(key as keyof UserProfile) && value !== undefined
        )
      );
      
      // 3. SALVATAGGIO DEI DATI PULITI
      await updateUserProfile(user.uid, profileToSave);

    } catch (error)      {
      console.error("Salvataggio del profilo fallito in MainAppLayout:", error);
    } finally {
      setIsOnboardingModalOpen(false);
    }
  }, [user]);
  // ==================================================================
  // ============= FINE DELLA MODIFICA =============
  // ==================================================================
  
  const actionConfig: ActionConfig = useMemo(() => {
    if (currentPath === '/') return { icon: Dumbbell, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Registra Set', disabled: !registeredAction };
    if (currentPath === '/manage') return { icon: Plus, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Crea Scheda', disabled: !registeredAction };
    if (currentPath === '/stats') return { icon: Sparkles, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Report AI', disabled: !registeredAction };
    return { icon: isPlaying ? Pause : Play, onClick: handleTogglePlay, label: 'Play/Pausa', disabled: !videoId && !playlistId };
  }, [currentPath, isPlaying, videoId, playlistId, registeredAction, handleTogglePlay]);

  const shouldRenderPlayer = videoId || playlistId;
  const playerOptions = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      ...(playlistId && {
        listType: 'playlist',
        list: playlistId,
      }),
    },
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onLogout={logout} onOpenOnboarding={() => setIsOnboardingModalOpen(true)} />
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <BottomBar actionConfig={actionConfig} />
      
      <svg style={{ position: 'absolute', height: 0, width: 0 }}><defs><filter id="remove-white-bg-filter"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 -255 -255 -255 0 255" result="mask"/><feComposite in="SourceGraphic" in2="mask" operator="out" /></filter></defs></svg>
      
      {shouldRenderPlayer && (
        <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <YouTube
            key={playlistId ? `p-${playlistId}` : `v-${videoId}`}
            videoId={videoId || undefined}
            opts={playerOptions}
            onReady={(event) => { playerRef.current = event.target; }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnd={() => setIsPlaying(false)}
            onStateChange={handlePlayerStateChange}
            onError={handlePlayerError}
          />
        </div>
      )}
      
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