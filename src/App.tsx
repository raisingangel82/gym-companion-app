import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Rnd } from 'react-rnd';

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


// ==================================================================
// ========= MODIFICA 1: Ridotta la dimensione di default =========
// ==================================================================
const defaultMiniPlayerSize = { width: 240, height: 135 };
const defaultMiniPlayerPosition = { x: window.innerWidth - 260, y: window.innerHeight - 215 };


function MainAppLayout() {
  const { 
    videoId, 
    playlistId, 
    playerRef, 
    handlePlayerStateChange,
    handlePlayerError,
    isPlayerMaximized,
    playerPosition,
    setPlayerPosition,
    playerSize,
    setPlayerSize,
    isPlaying,
    playTrack,
    playPlaylist
  } = useMusic();

  const miniPlayerStateRef = useRef({ position: defaultMiniPlayerPosition, size: defaultMiniPlayerSize });

  useEffect(() => {
    if (!isPlayerMaximized) {
      setPlayerPosition(miniPlayerStateRef.current.position);
      setPlayerSize(miniPlayerStateRef.current.size);
    }
  }, [isPlayerMaximized, setPlayerPosition, setPlayerSize]);

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
    } catch (error)      {
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

  const shouldRenderPlayer = !!(videoId || playlistId);
  const playerOptions = { height: '100%', width: '100%', playerVars: { autoplay: 1 as const } };

  const YouTubePlayerComponent = useMemo(() => (
    <YouTube
      opts={playerOptions}
      onReady={(event) => { 
        playerRef.current = event.target;
        if (playlistId) playPlaylist(playlistId);
        else if (videoId) playTrack(videoId);
      }}
      onStateChange={handlePlayerStateChange}
      onError={handlePlayerError}
      className="w-full h-full"
    />
  ), [playerRef, handlePlayerStateChange, handlePlayerError, videoId, playlistId, playTrack, playPlaylist]);

  // =======================================================================
  // === MODIFICA 2: Configurazione esplicita per il ridimensionamento ===
  // =======================================================================
  const resizeHandleClasses = {
      bottomRight: 'w-4 h-4 -right-1 -bottom-1 absolute cursor-se-resize' // Esempio per personalizzare la maniglia
  };

  const resizingConfig = {
      top: !isPlayerMaximized,
      right: !isPlayerMaximized,
      bottom: !isPlayerMaximized,
      left: !isPlayerMaximized,
      topRight: !isPlayerMaximized,
      bottomRight: !isPlayerMaximized,
      bottomLeft: !isPlayerMaximized,
      topLeft: !isPlayerMaximized,
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
        <Rnd
          size={playerSize}
          position={playerPosition}
          onDragStop={(e, d) => {
            const newPos = { x: d.x, y: d.y };
            setPlayerPosition(newPos);
            if (!isPlayerMaximized) {
              miniPlayerStateRef.current.position = newPos;
            }
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            const newSize = { width: ref.style.width, height: ref.style.height };
            setPlayerSize(newSize);
            setPlayerPosition(position);
            if (!isPlayerMaximized) {
              miniPlayerStateRef.current.size = newSize;
              miniPlayerStateRef.current.position = position;
            }
          }}
          minWidth={240}
          minHeight={135}
          lockAspectRatio={true}
          disableDragging={isPlayerMaximized}
          enableResizing={resizingConfig} // <-- Utilizziamo la configurazione esplicita
          resizeHandleClasses={resizeHandleClasses} // Opzionale: per stilizzare le maniglie
          className={`z-50 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${isPlayerMaximized ? 'rounded-none shadow-none' : 'border-2 border-primary'}`}
          style={{ transition: isPlayerMaximized ? 'width 0.3s ease, height 0.3s ease, transform 0.3s ease' : 'none' }}
        >
          {YouTubePlayerComponent}
        </Rnd>
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