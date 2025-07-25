import { useMemo, useState, useCallback } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import YouTube from 'react-youtube';

// Hooks, Tipi e Servizi
import { useMusic, MusicProvider } from './contexts/MusicContext';
import { usePageAction, PageActionProvider } from './contexts/PageActionContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { updateUserProfile } from './services/firestore';
import type { ActionConfig, UserProfile } from './types';

// Componenti e Pagine
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { OnboardingModal } from './components/OnboardingModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UpdatePrompt } from './components/UpdatePrompt';
import { WorkoutPage } from './pages/WorkoutPage';
import { ManagePage } from './pages/ManagePage';
import { StatsPage } from './pages/StatsPage';
import { MusicPage } from './pages/MusicPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UpgradePage } from './pages/UpgradePage';
import { Play, Pause, Dumbbell, Plus, Sparkles } from 'lucide-react';

// Layout per l'applicazione principale (quando l'utente è loggato)
function MainAppLayout() {
  const { isPlaying, setIsPlaying, videoId, playlistId, playerRef, setCurrentTrack, decorativePlayerRef } = useMusic();
  const { registeredAction } = usePageAction();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

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
  
  const handleCompleteOnboarding = useCallback(async (data: UserProfile) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, data);
      setIsOnboardingModalOpen(false);
    } catch (error) {
      console.error("Salvataggio del profilo fallito in MainAppLayout:", error);
    }
  }, [user]);
  
  const actionConfig: ActionConfig = useMemo(() => {
    if (location.pathname === '/') return { icon: Dumbbell, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Registra Set', disabled: !registeredAction };
    if (location.pathname === '/manage') return { icon: Plus, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Crea Scheda', disabled: !registeredAction };
    if (location.pathname === '/stats') return { icon: Sparkles, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Report AI', disabled: !registeredAction };
    return { icon: isPlaying ? Pause : Play, onClick: handleTogglePlay, label: 'Play/Pausa', disabled: !videoId && !playlistId };
  }, [location.pathname, isPlaying, videoId, playlistId, registeredAction, handleTogglePlay]);

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

  const handlePlayerStateChange = (event: any) => {
    if (event.data === 1 && playerRef.current) { // Stato 1 = In Riproduzione
      const trackData = playerRef.current.getVideoData();
      setCurrentTrack({ id: trackData.video_id, title: trackData.title });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onLogout={logout} onOpenOnboarding={() => setIsOnboardingModalOpen(true)} />
      {/* MODIFICA: Rimosso pt-16 per correggere l'altezza della pagina */}
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
          />
        </div>
      )}
      
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
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
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;